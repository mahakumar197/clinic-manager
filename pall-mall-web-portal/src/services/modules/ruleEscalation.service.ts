import { ENDPOINTS } from "../api/endpoints";
import notificationAxiosInstance from "../api/notificationAxiosInstance";
import {
  EscalationRulesResponse,
  GetEscalationRulesParams,
  CreateEscalationRulePayload,
  EscalationRuleDetailsResponse,
  UpdateEscalationRulePayload,
} from "../types";

export const escalationService = {
  // ---------------------------
  // GET ESCALATION RULES LIST
  // ---------------------------
  async getEscalationRules(
    params: GetEscalationRulesParams
  ): Promise<EscalationRulesResponse> {
    try {
      console.log("Fetching escalation rules with params:", params);

      const response = await notificationAxiosInstance.get(
        ENDPOINTS.ESCALATION.LIST,
        { params }
      );

      console.log("Escalation Response:", response.data);

      const apiData = response.data;
      const dataArray = apiData.data?.data;
      const total = apiData.data?.total ?? 0;
      const page = params.page ?? 1;
      const limit = params.limit ?? 10;
      const totalPages = Math.ceil(total / limit);

      const result = {
        rules: dataArray ?? [],
        total: total,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };

      console.log("Escalation result:", result);

      return result;
    } catch (error) {
      console.error("Error fetching escalation rules:", error);
      throw error;
    }
  },


  
  // ---------------------------
  // CREATE ESCALATION RULE
  // ---------------------------
  async createEscalationRule(payload: CreateEscalationRulePayload) {
    try {
      const response = await notificationAxiosInstance.post(
        ENDPOINTS.ESCALATION.CREATE,
        payload
      );

      return response.data;
    } catch (error) {
      console.error(" Error creating escalation rule:", error);
      throw error;
    }
  },




  
  // ---------------------------
  // GET ESCALATION RULE DETAILS BY ID
  // ---------------------------
  async getEscalationRuleById(
    ruleId: string
  ): Promise<EscalationRuleDetailsResponse> {
    try {
      const response = await notificationAxiosInstance.get(
        ENDPOINTS.ESCALATION.DETAILS(ruleId)
      );

      const apiData = response.data;

      return {
        rule: apiData.data ?? null,
      };
    } catch (error) {
      console.error(" Error fetching escalation rule details:", error);
      throw error;
    }
  },





    // ---------------------------
  // UPDATE ESCALATION RULE
  // ---------------------------
  async updateEscalationRule(
    ruleId: string,
    payload: UpdateEscalationRulePayload
  ) {
    try {
      const response = await notificationAxiosInstance.patch(
        ENDPOINTS.ESCALATION.DETAILS(ruleId),
        payload
      );

      return response.data;
    } catch (error) {
      console.error(" Error updating escalation rule:", error);
      throw error;
    }
  },


  // ---------------------------
// TOGGLE RULE STATUS FIXED
// ---------------------------
async toggleNotificationRuleStatus(ruleId: string, isActive: boolean) {
  const response = await notificationAxiosInstance.put(
    ENDPOINTS.ESCALATION.STATUS(ruleId, isActive)
  );

  return response.data;
},


  // services/modules/ruleEscalation.service.ts

async deleteEscalationRule(ruleId: string) {
  try {
    console.log("Deleting escalation rule:", ruleId);

    const response = await notificationAxiosInstance.delete(
      ENDPOINTS.ESCALATION.DELETE(ruleId)
    );

    console.log("Delete escalation response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting escalation rule:", error);
    throw error;
  }
},



};