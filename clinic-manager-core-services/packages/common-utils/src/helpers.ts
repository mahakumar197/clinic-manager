import axios from 'axios';
import { generateSasUrl } from './azure-storage.helper';

export const helpers = {
  /**
   * Paginates a list of objects.
   *
   * @param list - List of objects to paginate
   * @param page - Current page number
   * @param limit - Number of items per page
   * @returns Paginated list
   */
  paginate(list: object[], page: number, limit: number) {
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      items: list.slice(start, end),
      meta: {
        page,
        limit,
        total: list.length,
        totalPages: Math.ceil(list.length / limit),
        hasNext: page < Math.ceil(list.length / limit),
        hasPrev: page > 1,
      },
    };
  },
  /**
   * Fetches user data by IDs.
   *
   * @param userIds - Array of user IDs
   * @returns Object mapping user IDs to user data
   */
  async fetchUsersByIds(uri: string, urlPath: string, userIds: string[]) {
    if (userIds.length === 0) return {};

    const url = `${uri}${urlPath}?ids=${userIds.join(',')}`;

    const response: any = await axios.get(url);

    const users = response?.data?.data || [];

    return users.reduce((acc: any, user: any) => {
      acc[user.id] = user;
      delete acc[user.id].passwordHash;
      return acc;
    }, {});
  },
  /**
   * Fetches user IDs for specific roles.
   *
   * @param uri - Base URI of the operations service
   * @param urlPath - Path to the user-list endpoint
   * @param roles - Array of roles or a single role string
   * @returns Array of user IDs
   */
  async fetchUserIdsByRole(
    uri: string,
    urlPath: string,
    roles: string | string[],
  ) {
    try {
      const roleQuery = Array.isArray(roles) ? roles.join(',') : roles;
      const url = `${uri}${urlPath}?roleType=${roleQuery}`;

      const response: any = await axios.get(url);
      const users = response?.data || [];

      return users.map((user: any) => user.id);
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  /**
   * Fetches Patient appointments from ZOHO.
   *
   * @param uri - Base URI of the operations service
   * @param urlPath - Path to the user-list endpoint
   * @param token - Authorization token
   * @returns Array of appointments
   */
  async fetchPatientAppointments(uri: string, urlPath: string, token: string) {
    try {
      const url = `${uri}${urlPath}`;
      const response: any = await axios.get(url, {
        headers: {
          Authorization: token,
        },
      });
      const appointments = response?.data?.data || [];

      return appointments;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  async fetchPatientAppointmentsWithEmail(
    uri: string,
    urlPath: string,
    email: string,
  ) {
    try {
      const url = `${uri}${urlPath}?email=${email}`;
      const response: any = await axios.get(url);
      const appointments = response?.data?.data || [];

      return appointments;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  async fetchUsersByRole(
    uri: string,
    urlPath: string,
    roles: string | string[],
  ) {
    try {
      const roleQuery = Array.isArray(roles) ? roles.join(',') : roles;
      const url = `${uri}${urlPath}?roleType=${roleQuery}`;

      const response: any = await axios.get(url);
      const users = response?.data || [];

      return users;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  /**
   * Fetches dropdown label value by IDs.
   *
   * @param uri - Base URI of the operations service
   * @param urlPath - Path to the dropdowns endpoint
   * @param ids - Array of dropdown IDs
   * @returns Array of dropdown IDs and its label values
   */
  async getDropdownLabelValue(uri: string, urlPath: string, ids: string) {
    const url = `${uri}${urlPath}?ids=${ids}`;
    const response: any = await axios.get(url);
    const dropdown = response?.data || [];
    return dropdown;
  },

  async getReportsStaff(
    uri: string,
    urlPath: string,
    userId: string,
    filter?: number,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const url = `${uri}${urlPath}`;
      const response: any = await axios.get(url, {
        params: {
          userId: userId,
          filter: filter,
          startDate: startDate,
          endDate: endDate,
        },
      });
      const reportsStaff = response?.data || [];
      return reportsStaff;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  async postReportsStaff(
    uri: string,
    urlPath: string,
    body: Record<string, any>,
  ) {
    try {
      const url = `${uri}${urlPath}`;

      const response = await axios.post(url, {
        ...body,
      });

      return response?.data || [];
    } catch (error) {
      console.error('postReportsStaff error:', error);
      throw error;
    }
  },

  async getReportsAdmin(
    uri: string,
    urlPath: string,
    query: Record<string, any>,
  ) {
    try {
      const url = `${uri}${urlPath}`;

      const response = await axios.get(url, {
        params: {
          ...query,
        },
      });

      return response?.data || [];
    } catch (error) {
      console.error('getReportsAdmin error:', error);
      throw error;
    }
  },

  async postReportsAdmin(
    uri: string,
    urlPath: string,
    body: Record<string, any>,
  ) {
    try {
      const url = `${uri}${urlPath}`;

      const response = await axios.post(url, {
        ...body,
      });

      return response?.data || [];
    } catch (error) {
      console.error('postReportsAdmin error:', error);
      throw error;
    }
  },

  /**
   * Generates a SAS URL for an Azure blob file.
   *
   * @param fileKey - The blob name/path within the container
   * @param containerName - Optional container name (defaults to AZURE_STORAGE_CONTAINER_NAME env var or 'mobile-app')
   * @param expiryMinutes - Optional expiry time in minutes (defaults to AZURE_SAS_EXPIRY_MINUTES env var or 60)
   * @returns SAS URL string with read permissions
   */
  async getFileUrlFromAzure(
    fileKey: string,
    containerName?: string,
    expiryMinutes?: number,
  ): Promise<string> {
    const container =
      containerName || process.env.AZURE_STORAGE_CONTAINER_NAME || 'mobile-app';
    const expiry =
      expiryMinutes ||
      parseInt(process.env.AZURE_SAS_EXPIRY_MINUTES || '60', 10);

    return generateSasUrl(fileKey, container, expiry);
  },
  /**
   * Task automation
   * @param uri
   * @param urlPath
   * @param data
   * @returns
   */
  async taskAutomation(
    uri: string,
    urlPath: string,
    patientPhaseId: string,
    userId: string,
  ) {
    try {
      const url = `${uri}${urlPath}?patientPhaseId=${patientPhaseId}&userId=${userId}`;
      await axios.post(url);
      return;
    } catch (error) {
      console.error('taskAutomation error:', error);
      throw error;
    }
  },
  async zohoFormSubmission(uri: string, urlPath: string, body: any) {
    try {
      const url = `${uri}${urlPath}`;
      await axios.post(url, body);
      return;
    } catch (error) {
      console.error('zohoFormSubmission error:', error);
      throw error;
    }
  },
  async fetchUserByNameOrEmail(
    uri: string,
    urlPath: string,
    emailOrName: string,
  ) {
    try {
      const url = `${uri}${urlPath}?emailOrName=${emailOrName}`;
      const response: any = await axios.get(url);
      const user = response?.data || [];
      return user;
    } catch (error) {
      console.error('fetchUserByNameOrEmail error:', error);
      throw error;
    }
  },
  async fetchUsersByEmails(uri: string, urlPath: string, emails: string[]) {
    try {
      const url = `${uri}${urlPath}?emails=${emails.join(',')}`;
      const response: any = await axios.get(url);
      const users = response?.data || [];
      return users;
    } catch (error) {
      console.error('fetchUsersByEmails error:', error);
      throw error;
    }
  },
  async getPatientSpecificForms(uri: string, urlPath: string, userId: string) {
    try {
      const url = `${uri}${urlPath}?userId=${userId}`;
      const response: any = await axios.get(url);
      const forms = response?.data || [];
      return forms;
    } catch (error) {
      console.error('getPatientSpecificForms error:', error);
      throw error;
    }
  },
};