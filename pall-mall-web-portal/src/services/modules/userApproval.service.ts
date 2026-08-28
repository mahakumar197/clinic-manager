import dashboardAxiosInstance from "../api/dashboardAxiosInstance";
import { ENDPOINTS } from "../api/endpoints";
import {
  UploadUserApprovalDetails,
  UploadUserApprovalsResponse,
  UploadUserApproveOrRejectPayload,
  UploadUserCommentsPayload,
  UploadUserGetComments,
  UserApprovalDetails,
  UserApprovalsCommentsPayload,
  UserApprovalsGetComments,
  UserApprovalsResponse,
  UserApproveOrRejectPayload,
  ViewUserUpload
} from "../types";

interface GetApprovalsParams {
  search?: string;
  status?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  dateFilter?: string;
  statusFilter?: string;
}

//Upload params
interface GetUploadApprovalsParams {
  search?: string;
  taskTypeFilter?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  dateFilter?: string;
  statusFilter?: string;
}


// FORM TAB
export const UserApprovalService = {
  // ---------------------------
  // GET APPROVALS LIST
  // ---------------------------
  async getApprovals(params: GetApprovalsParams, signal?: AbortSignal): Promise<UserApprovalsResponse> {
    const response = await dashboardAxiosInstance.get(
      ENDPOINTS.USER_APPROVALS.LIST,
      {
        params,
        signal,
      },
    );

    const apiData = response.data;
    console.log(response, "apiData")

    return {
      approvals: apiData?.data?.response ?? [], // list items
      cardsCounts: apiData?.data?.counts ?? {}, //card data
    };
  },

  // ---------------------------
    // GET APPROVAL DETAILS
    // ---------------------------
    async getApprovalById(id: string): Promise<UserApprovalDetails> {
      const response = await dashboardAxiosInstance.get(
        ENDPOINTS.USER_APPROVALS.DETAILS(id), //  ID AS PATH PARAM
      );
  
      return response.data?.data;
    },

    // ---------------------------
  // ACTION (Approve/Reject)
  // ---------------------------
  async updateApprovalStatus(payload: UserApproveOrRejectPayload) {
    const response = await dashboardAxiosInstance.post(
      ENDPOINTS.USER_APPROVALS.ACTION,
      payload,
    );
    return response.data;
  },

    // ---------------------------
    // GET COMMENTS
    // ---------------------------
    async getApprovalsComments(
      submission_id: string,
    ): Promise<UserApprovalsGetComments[]> {
      const response = await dashboardAxiosInstance.get(
        ENDPOINTS.USER_APPROVALS.COMMENTS(submission_id), //  ID AS PATH PARAM
      );
  
      return response.data?.data ?? [];
    },
  
    // ---------------------------
    // CREATE COMMENTS
    // ---------------------------
    async createApprovalsComments(payload: UserApprovalsCommentsPayload) {
      const response = await dashboardAxiosInstance.post(
        "/approval-doctor/add-comments",
        payload,
      );
  
      return response.data;
    },

};


//UPLOAD TAB
export const UserUploadApprovalService = {
  // ---------------------------
  // GET UPLOAD APPROVALS LIST
  // ---------------------------
  async getUploadApprovals(params: GetUploadApprovalsParams, signal?: AbortSignal): Promise<UploadUserApprovalsResponse> {
    const response = await dashboardAxiosInstance.get(
      ENDPOINTS.UPLOAD_USER_APPROVALS.LIST,
      {
        params,
        signal,
      },
    );

    const apiData = response.data;
    console.log(response, "apiData")

    return {
      approvals: apiData?.data?.submissions ?? [], // list items
      cardsCounts: apiData?.data?.counts ?? {}, //card data
    };
  },

  // ---------------------------
    // GET UPLOAD APPROVAL DETAILS
    // ---------------------------
    async getUploadApprovalById(id: string): Promise<UploadUserApprovalDetails> {
      const response = await dashboardAxiosInstance.get(
        ENDPOINTS.UPLOAD_USER_APPROVALS.DETAILS(id), //  ID AS PATH PARAM
      );
  
      return response.data?.data;
    },

    // ---------------------------
  // ACTION - UPLOAD (Approve/Reject)
  // ---------------------------
  async updateUploadApprovalStatus(payload: UploadUserApproveOrRejectPayload) {
    const response = await dashboardAxiosInstance.patch(
      ENDPOINTS.UPLOAD_USER_APPROVALS.ACTION,
      payload,
    );
    return response.data;
  },

    // ---------------------------
    // GET UPLOAD COMMENTS
    // ---------------------------
    async getUploadApprovalsComments(
      submission_id: string,
    ): Promise<UploadUserGetComments[]> {
      const response = await dashboardAxiosInstance.get(
        ENDPOINTS.UPLOAD_USER_APPROVALS.COMMENTS(submission_id), //  ID AS PATH PARAM
      );
  
      return response.data?.data ?? [];
    },
  
    // ---------------------------
    // CREATE UPLOAD COMMENTS
    // ---------------------------
    async createUploadApprovalsComments(payload: UploadUserCommentsPayload) {
      const response = await dashboardAxiosInstance.post(
        "/approval-doctor/add-comments-for-task-upload",
        payload,
      );
  
      return response.data;
    },

    // ---------------------------
    // GET UPLOAD SUBMISSION ASSET
    // ---------------------------
    async getUserApprovalUploadsSubmission(id: string): Promise<ViewUserUpload> {
      const response = await dashboardAxiosInstance.get(
        ENDPOINTS.UPLOAD_USER_APPROVALS.UPLOAD(id),
      );
  
      return response.data?.data;
    },
};
