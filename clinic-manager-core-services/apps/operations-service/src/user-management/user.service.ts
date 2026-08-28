import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RolePermission } from './entities/role-permission.entity';
import {
  CreateUserDto,
  RolePermissionDto,
  ListUsersDto,
  SuspendUserDto,
  UnsuspendUserDto,
  UpdateUserDto,
} from './dto/user-management.dto';
import {
  ApiResponseBuilder,
  HttpStatus,
  ErrorCode,
  ApiError,
} from '@pallmall/shared-types';
import { logger } from '@pallmall/logger';
import * as bcrypt from 'bcrypt';
import {
  USER_MANAGEMENT_MESSAGES,
  AUTH_MESSAGES,
  UserStatus,
} from '@pallmall/common-utils';
import axios from 'axios';
import { API_ENDPOINTS } from '@pallmall/common-utils';

@Injectable()
export class UserService implements OnModuleInit, OnModuleDestroy {
  private readonly ACTIVE_USER_CONDITION = `(u.status = 'active' OR (u.status = 'suspended' AND u.suspended_until IS NOT NULL AND u.suspended_until <= NOW()))`;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}
  private dropdownIdCache = new Map<string, any>();

  private dropdownCacheInterval?: NodeJS.Timeout;
  private dropdownCache = new Map<string, any[]>();
  private dropdownMapCache = new Map<string, Map<string, any>>();

  onModuleInit(): void {
    if (this.dropdownCacheInterval) return;
    this.dropdownCacheInterval = setInterval(
      () => {
        this.dropdownCache.clear();
        this.dropdownMapCache.clear();
        this.dropdownIdCache.clear();
        logger.debug('Cleared dropdown cache (TTL)');
      },
      10 * 60 * 1000,
    );
  }

  onModuleDestroy(): void {
    if (!this.dropdownCacheInterval) return;
    clearInterval(this.dropdownCacheInterval as NodeJS.Timeout);
    this.dropdownCacheInterval = undefined;
    this.dropdownCache.clear();
    this.dropdownMapCache.clear();
    this.dropdownIdCache.clear();
    logger.debug('Cleared dropdown cache on shutdown');
  }

  private buildContentUrl(suffix: string) {
    logger.debug('buildContentUrl --->');
    const base = process.env.BASE_CONTENT || '';
    const endpoint = (
      API_ENDPOINTS as any
    ).CONTENT_SERVICE.DROPDOWN_FETCH.replace(/\/+$/g, '');
    if (suffix && !suffix.startsWith('/') && !suffix.startsWith('?'))
      suffix = '/' + suffix;
    return `${base}${endpoint}${suffix}`;
  }

  private async fetchDropdownById(id: string) {
    logger.debug('fetchDropdownById --->');
    const key = String(id).trim();
    if (!key) return null;
    if (this.dropdownIdCache.has(key)) {
      return this.dropdownIdCache.get(key);
    }
    const base = process.env.BASE_CONTENT || '';
    if (!base) return null;
    const url = this.buildContentUrl(`?ids=${encodeURIComponent(key)}`);
    try {
      const res = await axios.get<any>(url, { timeout: 5000 });
      const arr = res?.data?.data ?? [];
      if (!Array.isArray(arr) || !arr.length) return null;
      const it = arr[0];
      const normalized = {
        id: String(it.id),
        type: it.type,
        beValue: it.beValue,
      };
      this.dropdownIdCache.set(key, normalized);
      return normalized;
    } catch (e) {
      logger.warn(`Failed to fetch dropdown by ID: ${key}, error: ${e}`);
      return null;
    }
  }

  private async fetchDropdownsByType(type: string) {
    const base = process.env.BASE_CONTENT || '';
    if (!base) {
      logger.warn(
        'BASE_CONTENT not configured; skipping dropdown fetch by type',
      );
      return [];
    }
    const url = this.buildContentUrl(`/${encodeURIComponent(type)}`);
    logger.debug(`Fetching dropdowns by type: ${url}`);
    if (this.dropdownCache.has(type)) return this.dropdownCache.get(type)!;
    try {
      const res = await axios.get<any>(url, {
        timeout: 5000,
        headers: { Accept: 'application/json' },
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      const arr = Array.isArray(payload) ? payload : [];
      const normalized = arr.map((it: any) => ({
        id: it.id ?? it.key ?? null,
        beValue: it.beValue ?? it.label ?? null,
      }));
      this.dropdownCache.set(type, normalized);
      return normalized;
    } catch (e: any) {
      logger.warn(
        `Dropdown fetch by type failed for type=${type}: message=${e?.message ?? e}`,
      );
      if (e?.response?.data)
        logger.debug(
          `Dropdown fetch response body: ${JSON.stringify(e.response.data)}`,
        );
      return [];
    }
  }

  private async getDropdownMap(type: string): Promise<Map<string, any>> {
    logger.debug('getDropdownMap --->');
    if (this.dropdownMapCache.has(type)) {
      return this.dropdownMapCache.get(type)!;
    }

    const list = await this.fetchDropdownsByType(type);
    const map = new Map<string, any>();
    for (const it of list) {
      if (it.id) map.set(String(it.id), it);
      if (it.beValue) map.set(String(it.beValue).toLowerCase(), it);
    }
    this.dropdownMapCache.set(type, map);
    return map;
  }

  private effectiveStatus(user: any): string {
    logger.debug('effectiveStatus --->');
    if (!user?.status) return UserStatus.INACTIVE;
    const status = String(user.status).toLowerCase().trim();
    const now = new Date();
    if (status === UserStatus.SUSPENDED) {
      if (user.suspended_until == null) {
        return UserStatus.SUSPENDED;
      }
      const suspendedUntil = new Date(user.suspended_until);
      if (suspendedUntil > now) {
        return UserStatus.SUSPENDED;
      }
    }
    if (status === UserStatus.INACTIVE) {
      return UserStatus.INACTIVE;
    }
    try {
      const lastLogin = user.last_login ? new Date(user.last_login) : null;
      if (lastLogin) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (lastLogin < sevenDaysAgo) {
          return UserStatus.INACTIVE;
        }
      }
    } catch (e) {
      return status;
    }
    return UserStatus.ACTIVE;
  }

  private async resolveRoleFromDropdown(
    roleInput?: string,
  ): Promise<string | null> {
    logger.debug('resolveRoleFromDropdown --->');
    if (!roleInput) return null;
    const raw = String(roleInput).trim();
    const byId = await this.fetchDropdownById(raw);
    if (byId) return byId.beValue ?? String(byId.id);

    const roleMap = await this.getDropdownMap('Role');
    const found = roleMap.get(raw) || roleMap.get(raw.toLowerCase());
    if (found) return found.beValue ?? String(found.id);
    return raw;
  }

  async getCardsCounts() {
    logger.info('getCardsCounts --->');
    try {
      const repo = this.dataSource.getRepository(User);
      const qbCountsBase = repo.createQueryBuilder('u');

      const activeCount = await qbCountsBase
        .clone()
        .andWhere(this.ACTIVE_USER_CONDITION)
        .getCount();
      const inactiveCount = await qbCountsBase
        .clone()
        .andWhere('u.status = :status', { status: 'inactive' })
        .getCount();
      const suspendedCount = await qbCountsBase
        .clone()
        .andWhere(
          `u.status = 'suspended' AND (u.suspended_until IS NULL OR u.suspended_until > NOW())`,
        )
        .getCount();
      const totalCount = await qbCountsBase.clone().getCount();
      const twoFaCount = await qbCountsBase
        .clone()
        .andWhere('u.two_fa_enabled = true')
        .getCount();

      const cardsCounts = {
        active: activeCount,
        inActive: inactiveCount,
        suspended: suspendedCount,
        twoFAEnabled: twoFaCount,
        total: totalCount,
      };

      return new ApiResponseBuilder().success(
        { cardsCounts },
        USER_MANAGEMENT_MESSAGES.USER_CARDS_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Get cards counts -> ${error}`);
      const apiError: ApiError = {
        code: ErrorCode.INTERNAL_ERROR,
        message: error?.message ?? 'Internal server error',
        timestamp: new Date().toISOString(),
      };
      return new ApiResponseBuilder().error(
        apiError,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createUser(dto: CreateUserDto, _userID?: string) {
    logger.info('Create user...');

    return this.dataSource.transaction(async (manager) => {
      try {
        const exists = await manager.findOne(User, {
          where: { email: dto.email?.toLowerCase() },
        });

        if (exists) {
          logger.warn(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
          const apiError: ApiError = {
            code: ErrorCode.ALREADY_EXISTS,
            message: AUTH_MESSAGES.EMAIL_ALREADY_EXISTS,
            timestamp: new Date().toISOString(),
          };
          return new ApiResponseBuilder().error(
            apiError,
            HttpStatus.BAD_REQUEST,
          );
        }

        if ((dto as any).phoneNumber) {
          const rawPn = String((dto as any).phoneNumber).trim();
          const existsPhone = rawPn
            ? await manager.findOne(User, { where: { phoneNumber: rawPn } })
            : null;
          if (existsPhone) {
            logger.warn('Phone number already exists');
            const apiError: ApiError = {
              code: ErrorCode.ALREADY_EXISTS,
              message: 'Phone number already exists',
              timestamp: new Date().toISOString(),
            };
            return new ApiResponseBuilder().error(
              apiError,
              HttpStatus.BAD_REQUEST,
            );
          }
          (dto as any).phoneNumber = rawPn;
        }

        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const departmentLabel = dto.department ? String(dto.department) : null;
        const resolvedRoleVal = await this.resolveRoleFromDropdown(
          dto.role as any,
        );
        const roleToSave =
          resolvedRoleVal ?? (dto.role ? String(dto.role) : null);
        const first = (dto as any).firstName ?? (dto as any).first_name ?? '';
        const last = (dto as any).lastName ?? (dto as any).last_name ?? '';
        const userName = [first, last].filter(Boolean).join(' ').trim() || null;

        const user = manager.create(User, {
          first_name: first || null,
          last_name: last || null,
          userName: userName,
          email: dto.email?.toLowerCase(),
          role: roleToSave as any,
          department: departmentLabel,
          two_fa_enabled: !!(
            (dto as any).twoFaEnabled ?? (dto as any).two_fa_enabled
          ),
          passwordHash: hashedPassword,
          phoneNumber: (dto as any).phoneNumber ?? null,
          additional_notes: (dto as any).additionalNotes ?? null,
          status: 'active',
        } as any);

        const saved = await manager.save(User, user);

        logger.info(`Create user -> ${HttpStatus.CREATED}`);
        return new ApiResponseBuilder().success(
          { id: saved.id },
          USER_MANAGEMENT_MESSAGES.USER_CREATED,
          HttpStatus.CREATED,
        );
      } catch (error: any) {
        logger.error(`Create user -> ${error?.message}`);

        if (error?.code === '23505') {
          let message = 'Duplicate value exists';

          if (error?.detail?.includes('email')) {
            message = AUTH_MESSAGES.EMAIL_ALREADY_EXISTS;
          } else if (error?.detail?.includes('phone')) {
            message = 'Phone number already exists';
          }

          const apiError: ApiError = {
            code: ErrorCode.ALREADY_EXISTS,
            message,
            timestamp: new Date().toISOString(),
          };

          return new ApiResponseBuilder().error(
            apiError,
            HttpStatus.BAD_REQUEST,
          );
        }

        // Fallback for real internal errors
        const apiError: ApiError = {
          code: ErrorCode.INTERNAL_ERROR,
          message: error?.message ?? 'Internal server error',
          timestamp: new Date().toISOString(),
        };

        return new ApiResponseBuilder().error(
          apiError,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  async getRolePermissionsList() {
    try {
      const repo = this.dataSource.getRepository(RolePermission);
      const all = await repo.find();
      const rolesList = await this.fetchDropdownsByType('Role');

      const permissions: Record<string, Record<string, boolean>> = {};
      const roles =
        rolesList && rolesList.length > 0
          ? rolesList.map((r) => ({ key: String(r.id), label: r.beValue }))
          : [];

      const modulesList = await this.fetchDropdownsByType('Module');
      const modules =
        modulesList && modulesList.length > 0
          ? modulesList.map((m: any) => ({
              key: String(m.id),
              label: m.beValue,
            }))
          : [];

      const moduleSlugByKey: Record<string, string> = {};
      for (const m of modules) {
        moduleSlugByKey[String(m.key)] = String(m.label)
          .toLowerCase()
          .replace(/\s+/g, '_');
      }

      for (const r of roles) {
        const key = String(r.key);
        permissions[key] = {};
        for (const m of modules) {
          const slug = moduleSlugByKey[String(m.key)];
          permissions[key][slug] = false;
        }
      }

      for (const p of all) {
        const roleObj = roles.find(
          (r) =>
            r.label.toLowerCase() === (p.role || '').toLowerCase() ||
            String(r.key) === String(p.role),
        );
        if (!roleObj) continue;
        const roleKey = String(roleObj.key);

        const moduleRaw = String(p.module || '').trim();
        let moduleSlug = moduleRaw;
        if (moduleSlugByKey[moduleRaw]) moduleSlug = moduleSlugByKey[moduleRaw];
        else {
          const mm = modules.find(
            (m) =>
              (m.label || '').toLowerCase() === moduleRaw.toLowerCase() ||
              String(m.key) === moduleRaw,
          );
          if (mm) {
            moduleSlug = moduleSlugByKey[String(mm.key)];
          } else if (/^\d+$/.test(moduleRaw)) {
            const idx = parseInt(moduleRaw, 10) - 1;
            if (idx >= 0 && idx < modules.length) {
              const fallback = modules[idx];
              moduleSlug = moduleSlugByKey[String(fallback.key)];
            } else {
              moduleSlug = moduleRaw.toLowerCase().replace(/\s+/g, '_');
            }
          } else {
            moduleSlug = moduleRaw.toLowerCase().replace(/\s+/g, '_');
          }
        }

        if (!permissions[roleKey]) permissions[roleKey] = {};
        permissions[roleKey][moduleSlug] = !!p.isPermitted;
      }

      return new ApiResponseBuilder().success(
        {
          roles,
          modules,
          permissions,
        },
        USER_MANAGEMENT_MESSAGES.PERMISSIONS_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Get role permissions list -> ${error}`);
      const apiError: ApiError = {
        code: ErrorCode.INTERNAL_ERROR,
        message: error?.message ?? 'Internal server error',
        timestamp: new Date().toISOString(),
      };
      return new ApiResponseBuilder().error(
        apiError,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async setRolePermission(dto: RolePermissionDto, userID?: string) {
    logger.info('Set role permission...');

    return this.dataSource.transaction(async (manager) => {
      try {
        let roleLabel: string | null = null;
        const r = await this.fetchDropdownById(String(dto.role));
        roleLabel = r?.beValue ?? null;

        let moduleKey = String(dto.module || '').trim();
        const moduleMap = await this.getDropdownMap('Module');
        const mm =
          moduleMap.get(moduleKey) || moduleMap.get(moduleKey.toLowerCase());
        if (mm) {
          moduleKey = String(mm.id);
        } else if (/^\d+$/.test(moduleKey)) {
          const modulesList = await this.fetchDropdownsByType('Module');
          const idx = parseInt(moduleKey, 10) - 1;
          if (idx >= 0 && idx < modulesList.length) {
            moduleKey = String(modulesList[idx].id);
          } else {
            moduleKey = moduleKey.toLowerCase();
          }
        } else {
          moduleKey = moduleKey.toLowerCase();
        }

        let existing = await manager.findOne(RolePermission, {
          where: { role: roleLabel ?? dto.role, module: moduleKey },
        });

        if (existing) {
          existing.isPermitted = dto.enabled;
          existing.updatedBy = userID ?? null;
          const saved = await manager.save(RolePermission, existing);
          logger.info('Role permission updated');
          return new ApiResponseBuilder().success(
            { isPermitted: !!saved.isPermitted },
            USER_MANAGEMENT_MESSAGES.PERMISSION_UPDATED,
            HttpStatus.OK,
          );
        }

        const created = manager.create(RolePermission, {
          role: roleLabel ?? dto.role,
          module: moduleKey,
          isPermitted: dto.enabled,
          updatedBy: userID ?? null,
        } as any);

        const saved = await manager.save(RolePermission, created);
        logger.info('Role permission created');
        return new ApiResponseBuilder().success(
          { isPermitted: !!saved.isPermitted },
          USER_MANAGEMENT_MESSAGES.PERMISSION_CREATED,
          HttpStatus.CREATED,
        );
      } catch (error) {
        logger.error(`Set role permission -> ${error}`);
        const apiError: ApiError = {
          code: ErrorCode.INTERNAL_ERROR,
          message: error?.message ?? 'Internal server error',
          timestamp: new Date().toISOString(),
          stack: error?.stack,
        };
        return new ApiResponseBuilder().error(
          apiError,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  async listUsers(query: ListUsersDto) {
    logger.info('List users...');
    try {
      const page = query.page && query.page > 0 ? query.page : 1;
      const limit = Math.min(query.limit || 10, 100);
      const offset = (page - 1) * limit;

      const repo = this.dataSource.getRepository(User);
      const applyBaseFilters = async (qb: any) => {
        const s = String(query.search ?? '').trim();
        if (s) {
          const q = `%${s.toLowerCase()}%`;
          qb.andWhere(
            "(LOWER(COALESCE(u.userName, '')) LIKE :q OR LOWER(CONCAT(COALESCE(u.first_name,''),' ',COALESCE(u.last_name,''))) LIKE :q OR LOWER(COALESCE(u.email, '')) LIKE :q)",
            { q },
          );
        }
        if (query.role) {
          const roleDropdown = await this.fetchDropdownById(String(query.role));
          if (
            !roleDropdown ||
            roleDropdown.type !== 'Role' ||
            !roleDropdown.beValue
          ) {
            qb.andWhere('1 = 0');
          } else {
            qb.andWhere('u.role = :role', { role: roleDropdown.beValue });
          }
        }
        if (query.status) {
          const statusDropdown = await this.fetchDropdownById(
            String(query.status),
          );
          if (
            !statusDropdown ||
            statusDropdown.type !== 'ProcedureStatus' ||
            !statusDropdown.beValue
          ) {
            qb.andWhere('1 = 0');
          } else {
            const status = statusDropdown.beValue.toLowerCase();
            if (status === 'active') {
              qb.andWhere(
                `(u.status = 'active' OR (u.status = 'suspended' AND u.suspended_until <= NOW())) AND (u.last_login IS NULL OR u.last_login >= NOW() - INTERVAL '7 days')`,
              );
            }
            if (status === 'inactive') {
              qb.andWhere(
                `u.status = 'inactive'
                OR (
                    (u.status = 'active'
                    OR (u.status = 'suspended' AND u.suspended_until <= NOW()))
                    AND u.last_login < NOW() - INTERVAL '7 days'
                  )
              `);
            }
            if (status === 'suspended') {
              qb.andWhere(
                `u.status = 'suspended' AND (u.suspended_until IS NULL OR u.suspended_until > NOW())`,
              );
            }
          }
        }
      };
      const qb = repo.createQueryBuilder('u');
      qb.addSelect(['u.two_fa_enabled', 'u.last_login']);
      await applyBaseFilters(qb);

      const [items, total] = await qb
        .orderBy('u.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      const roleMap = await this.getDropdownMap('Role');
      const mappedItems = items.map((u: any) => {
        const roleObj =
          roleMap.get(String(u.role)) ||
          roleMap.get(String(u.role).toLowerCase());
        const roleLabel = roleObj ? roleObj.beValue : null;
        const roleId = roleObj ? String(roleObj.id) : null;
        const userName =
          u.userName ??
          ([u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
            null);
        return {
          userId: u.id,
          userName,
          email: u.email,
          phoneNumber: u.phoneNumber ?? null,
          roleLabel,
          roleId,
          status: this.effectiveStatus(u),
          lastLogin: u.last_login ? new Date(u.last_login).toISOString() : null,
          two_fa_enabled: !!u.two_fa_enabled,
        };
      });
      const totalPages = Math.ceil(total / limit) || 1;
      const pagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
      const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return {
        success: true,
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
          requestId,
          pagination,
        },
        data: [{ items: mappedItems }],
        message: USER_MANAGEMENT_MESSAGES.USER_DATA_FETCHED,
      } as any;
    } catch (error) {
      logger.error(`List users -> ${error}`);
      const apiError: ApiError = {
        code: ErrorCode.INTERNAL_ERROR,
        message: error?.message ?? 'Internal server error',
        timestamp: new Date().toISOString(),
        stack: error?.stack,
      };
      return new ApiResponseBuilder().error(
        apiError,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async suspendUser(dto: SuspendUserDto, _actorId?: string) {
    const targetId = dto?.userId;
    if (!targetId) {
      const apiError: ApiError = {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Missing userId',
        timestamp: new Date().toISOString(),
      };
      return new ApiResponseBuilder().error(apiError, HttpStatus.BAD_REQUEST);
    }

    return this.dataSource.transaction(async (manager) => {
      try {
        const user = await manager.findOne(User, { where: { id: targetId } });
        if (!user) {
          const apiError: ApiError = {
            code: ErrorCode.NOT_FOUND,
            message: USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND,
            timestamp: new Date().toISOString(),
          };
          return new ApiResponseBuilder().error(apiError, HttpStatus.NOT_FOUND);
        }

        const now = new Date();
        let suspendedUntil: Date | null = null;
        const duration = (dto as any).duration;
        if (duration) {
          const dur = await this.fetchDropdownById(String(duration));
          const val = dur?.beValue;
          switch (val) {
            case '24 Hours':
              suspendedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
              break;
            case '7 Days':
              suspendedUntil = new Date(
                now.getTime() + 7 * 24 * 60 * 60 * 1000,
              );
              break;
            case '30 Days':
              suspendedUntil = new Date(
                now.getTime() + 30 * 24 * 60 * 60 * 1000,
              );
              break;
            case 'Indefinite':
              suspendedUntil = null;
              break;
            default:
              suspendedUntil = null;
          }
        } else {
          suspendedUntil = null;
        }

        user.status = 'suspended';
        user.suspended_until = suspendedUntil;
        user.suspension_reason = dto.reason ?? null;
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await manager.save(User, user as any);

        return new ApiResponseBuilder().success(
          { userId: user.id },
          USER_MANAGEMENT_MESSAGES.USER_SUSPENDED,
          HttpStatus.OK,
        );
      } catch (error) {
        logger.error(`Suspend user -> ${error}`);
        const apiError: ApiError = {
          code: ErrorCode.INTERNAL_ERROR,
          message: error?.message ?? 'Internal server error',
          timestamp: new Date().toISOString(),
        };
        return new ApiResponseBuilder().error(
          apiError,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  async getUserById(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId } as any,
      });
      if (!user) {
        const apiError: ApiError = {
          code: ErrorCode.NOT_FOUND,
          message: USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND,
          timestamp: new Date().toISOString(),
        };
        return new ApiResponseBuilder().error(apiError, HttpStatus.NOT_FOUND);
      }
      const roleMap = await this.getDropdownMap('Role');
      const roleObj = user.role
        ? roleMap.get(String(user.role)) ||
          roleMap.get(String(user.role).toLowerCase())
        : null;
      const roleKey = roleObj ? String(roleObj.id) : null;
      const roleLabel = roleObj ? roleObj.beValue : null;

      const deptMap = await this.getDropdownMap('UserDepartment');
      const deptObj =
        user.department && deptMap.size > 0
          ? deptMap.get(String(user.department)) ||
            deptMap.get(String(user.department).toLowerCase())
          : null;
      const deptKey = deptObj ? String(deptObj.id) : null;
      const deptLabel = deptObj ? (deptObj.beValue ?? null) : null;
      const lastLogin = user.last_login
        ? new Date(user.last_login).toISOString()
        : null;
      const usersActiveDays = user.createdAt
        ? Math.floor(
            (Date.now() - new Date(user.createdAt).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;
      const userNameVal =
        user.userName ??
        ([user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
          null);
      return new ApiResponseBuilder().success(
        {
          userId: user.id,
          userName: userNameVal,
          email: user.email,
          phoneNumber: user.phoneNumber ?? null,
          departmentId: deptKey,
          deptLabel,
          roleId: roleKey,
          roleLabel,
          lastLogin,
          usersActiveDays,
          additionalNotes: user.additional_notes ?? null,
          status: this.effectiveStatus(user),
          createdAt: user.createdAt?.toISOString() ?? null,
          updatedAt: user.updatedAt?.toISOString() ?? null,
          two_fa_enabled: !!user.two_fa_enabled,
        },
        USER_MANAGEMENT_MESSAGES.USER_DATA_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Get user by id -> ${error}`);
      const apiError: ApiError = {
        code: ErrorCode.INTERNAL_ERROR,
        message: error?.message ?? 'Internal server error',
        timestamp: new Date().toISOString(),
      };
      return new ApiResponseBuilder().error(
        apiError,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProfile(userId: string) {
    logger.info('getProfile --->');
    try {
      if (!userId) {
        return new ApiResponseBuilder().error(
          {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Missing userId',
            timestamp: new Date().toISOString(),
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const user = await this.userRepository.findOne({
        where: { id: userId } as any,
      });
      if (!user) {
        return new ApiResponseBuilder().error(
          {
            code: ErrorCode.NOT_FOUND,
            message: USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const [perms, modules] = await Promise.all([
        this.dataSource
          .getRepository(RolePermission)
          .find({ where: { role: user.role } as any }),
        this.fetchDropdownsByType('Module'),
      ]);
      const moduleSlugById = new Map<string, string>();

      for (const m of modules) {
        if (!m?.id || !m.beValue) continue;

        const slug = m.beValue
          .toLowerCase()
          .trim()
          .replace(/\s*&\s*/g, '_&_')
          .replace(/\s+/g, '_');
        moduleSlugById.set(String(m.id), slug);
      }
      const permissions: Record<string, boolean> = {};
      for (const slug of moduleSlugById.values()) {
        permissions[slug] = false;
      }
      for (const p of perms) {
        const slug = moduleSlugById.get(String(p.module));
        if (slug) {
          permissions[slug] = !!p.isPermitted;
        }
      }
      const userName =
        user.userName ??
        ([user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
          null);
      return new ApiResponseBuilder().success(
        {
          user: {
            id: user.id,
            userName,
            email: user.email,
            phoneNumber: user.phoneNumber ?? null,
            role: user.role,
            status: this.effectiveStatus(user),
            two_fa_enabled: !!user.two_fa_enabled,
          },
          permissions,
        },
        USER_MANAGEMENT_MESSAGES.USER_DATA_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Get profile -> ${error}`);
      return new ApiResponseBuilder().error(
        {
          code: ErrorCode.INTERNAL_ERROR,
          message: error?.message ?? 'Internal server error',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(dto: UpdateUserDto, _actorId?: string) {
    if (!dto || !dto.userId) {
      const apiError: ApiError = {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Missing userId',
        timestamp: new Date().toISOString(),
      };
      return new ApiResponseBuilder().error(apiError, HttpStatus.BAD_REQUEST);
    }

    return this.dataSource.transaction(async (manager) => {
      try {
        const user = await manager.findOne(User, { where: { id: dto.userId } });
        if (!user) {
          const apiError: ApiError = {
            code: ErrorCode.NOT_FOUND,
            message: USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND,
            timestamp: new Date().toISOString(),
          };
          return new ApiResponseBuilder().error(apiError, HttpStatus.NOT_FOUND);
        }

        if (
          dto.email &&
          dto.email.toLowerCase() !== (user.email ?? '').toLowerCase()
        ) {
          const exists = await manager.findOne(User, {
            where: { email: dto.email?.toLowerCase() },
          });
          if (exists && exists.id !== user.id) {
            const apiError: ApiError = {
              code: ErrorCode.ALREADY_EXISTS,
              message: AUTH_MESSAGES.EMAIL_ALREADY_EXISTS,
              timestamp: new Date().toISOString(),
            };
            return new ApiResponseBuilder().error(
              apiError,
              HttpStatus.BAD_REQUEST,
            );
          }
        }

        if (typeof (dto as any).firstName !== 'undefined') {
          user.first_name = (dto as any).firstName ?? user.first_name;
        }
        if (typeof (dto as any).lastName !== 'undefined') {
          user.last_name = (dto as any).lastName ?? user.last_name;
        }
        const derivedParts = [user.first_name, user.last_name].filter(Boolean);
        user.userName = derivedParts.length
          ? derivedParts.join(' ').trim()
          : user.userName;

        if (dto.email) {
          user.email = dto.email.toLowerCase();
        }

        if (
          typeof (dto as any).phoneNumber !== 'undefined' ||
          typeof (dto as any).phone !== 'undefined'
        ) {
          const raw = (dto as any).phoneNumber ?? (dto as any).phone ?? null;
          if (raw) {
            const normalized = String(raw).trim();
            if (normalized && normalized !== user.phoneNumber) {
              const existsPhone = await manager.findOne(User, {
                where: { phoneNumber: normalized },
              });
              if (existsPhone && existsPhone.id !== user.id) {
                const apiError: ApiError = {
                  code: ErrorCode.ALREADY_EXISTS,
                  message: 'Phone number already exists',
                  timestamp: new Date().toISOString(),
                };
                return new ApiResponseBuilder().error(
                  apiError,
                  HttpStatus.BAD_REQUEST,
                );
              }
              user.phoneNumber = normalized;
            }
          }
        }

        if (typeof (dto as any).twoFaEnabled !== 'undefined') {
          user.two_fa_enabled = !!(dto as any).twoFaEnabled;
        }

        if (typeof dto.department !== 'undefined') {
          const dpt = await this.fetchDropdownById(String(dto.department));
          user.department = dpt?.beValue ?? user.department;
        }
        if (typeof dto.role !== 'undefined') {
          const resolvedVal = await this.resolveRoleFromDropdown(
            dto.role as any,
          );
          user.role = (resolvedVal ?? String(dto.role)) as any;
        }
        if (typeof dto.additionalNotes !== 'undefined')
          user.additional_notes = dto.additionalNotes ?? user.additional_notes;
        user.updatedAt = new Date();
        await manager.save(User, user as any);
        return new ApiResponseBuilder().success(
          { userId: user.id },
          USER_MANAGEMENT_MESSAGES.USER_UPDATED,
          HttpStatus.OK,
        );
      } catch (error) {
        logger.error(`Update user -> ${error}`);
        const apiError: ApiError = {
          code: ErrorCode.INTERNAL_ERROR,
          message: error?.message ?? 'Internal server error',
          timestamp: new Date().toISOString(),
        };
        return new ApiResponseBuilder().error(
          apiError,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  async unsuspendUser(dto: UnsuspendUserDto, _actorId?: string) {
    const targetId = dto?.userId;
    if (!targetId) {
      const apiError: ApiError = {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Missing userId',
        timestamp: new Date().toISOString(),
      };
      return new ApiResponseBuilder().error(apiError, HttpStatus.BAD_REQUEST);
    }

    return this.dataSource.transaction(async (manager) => {
      try {
        const user = await manager.findOne(User, { where: { id: targetId } });
        if (!user) {
          const apiError: ApiError = {
            code: ErrorCode.NOT_FOUND,
            message: USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND,
            timestamp: new Date().toISOString(),
          };
          return new ApiResponseBuilder().error(apiError, HttpStatus.NOT_FOUND);
        }

        user.status = 'active';
        user.suspended_until = null;
        user.suspension_reason = null;

        await manager.save(User, user as any);

        return new ApiResponseBuilder().success(
          { userId: user.id },
          USER_MANAGEMENT_MESSAGES.USER_UNSUSPENDED,
          HttpStatus.OK,
        );
      } catch (error) {
        logger.error(`Unsuspend user -> ${error}`);
        const apiError: ApiError = {
          code: ErrorCode.INTERNAL_ERROR,
          message: error?.message ?? 'Internal server error',
          timestamp: new Date().toISOString(),
        };
        return new ApiResponseBuilder().error(
          apiError,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }
}