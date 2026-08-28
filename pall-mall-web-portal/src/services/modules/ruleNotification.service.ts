import notificationAxiosInstance from "../api/notificationAxiosInstance";
import { normalizePagination } from "../api/normalizePagination";
import { ENDPOINTS } from "../api/endpoints";
import {
  NotificationRulesResponse,
  GetNotificationRulesParams,
  CreateNotificationRulePayload,
  NotificationRuleDetailsResponse,
  UpdateNotificationRulePayload,
} from "../types";

export const notificationService = {
  // ---------------------------
  // GET NOTIFICATION RULES LIST
  // ---------------------------
  async getNotificationRules(
    params: GetNotificationRulesParams
  ): Promise<NotificationRulesResponse> {
    const response = await notificationAxiosInstance.get(
      ENDPOINTS.NOTIFICATION.LIST,
      { params }
    );

    const apiData = response.data;

    return {
      rules: apiData.data?.data ?? [],
      total: apiData.data?.total ?? 0,
      pagination: normalizePagination(apiData.meta?.pagination),
    };
  },

  // ---------------------------
  // CREATE NOTIFICATION RULE
  // ---------------------------
  async createNotificationRule(payload: CreateNotificationRulePayload) {
    try {
      const response = await notificationAxiosInstance.post(
        ENDPOINTS.NOTIFICATION.CREATE,
        payload
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ---------------------------
  // GET RULE BY ID
  // ---------------------------
  async getNotificationRuleById(
    ruleId: string
  ): Promise<NotificationRuleDetailsResponse> {
    const response = await notificationAxiosInstance.get(
      ENDPOINTS.NOTIFICATION.DETAILS(ruleId)
    );

    return {
      rule: response.data?.data ?? null,
    };
  },

  // ---------------------------
  // UPDATE RULE
  // ---------------------------
  async updateNotificationRule(
    ruleId: string,
    payload: UpdateNotificationRulePayload
  ) {
    const response = await notificationAxiosInstance.patch(
      ENDPOINTS.NOTIFICATION.DETAILS(ruleId),
      payload
    );

    return response.data;
  },
  // ---------------------------
  // TOGGLE RULE STATUS  FIXED
  // ---------------------------
  async toggleNotificationRuleStatus(ruleId: string, isActive: boolean) {
    const response = await notificationAxiosInstance.put(
      ENDPOINTS.NOTIFICATION.STATUS(ruleId, isActive)
    );

    return response.data;
  },

  async deleteNotificationRule(ruleId: string) {
    try {
      const response = await notificationAxiosInstance.delete(
        ENDPOINTS.NOTIFICATION.DELETE(ruleId)
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

