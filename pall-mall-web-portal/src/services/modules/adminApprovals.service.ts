import dashboardAxiosInstance from "../api/dashboardAxiosInstance";
import { ENDPOINTS } from "../api/endpoints";
import {
  ApprovalDetails,
  ApprovalFormItem,
  ApprovalsCommentsPayload,
  ApprovalsGetComments,
  ApprovalsResponse,
  ApproveOrRejectPayload,
  UploadAdminApprovalsResponse,
  UploadApprovalDetails,
  UploadApprovalsCommentsPayload,
  UploadApprovalsGetComments,
  UploadApproveOrRejectPayload,
  ViewAdminUpload,
} from "../types";

interface GetApprovalsParams {
  search?: string;
  formPriority?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  dateFilter?: string;
  statusFilter?: string;
}
//upload params
interface GetUploadApprovalsParams {
  search?: string;
  taskTypeFilter?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  dateFilter?: string;
  statusFilter?: string;
}

//FORM TAB

export const adminApprovalsService = {
  // ---------------------------
  // GET APPROVALS LIST
  // ---------------------------
  async getApprovals(params: GetApprovalsParams, signal?: AbortSignal): Promise<ApprovalsResponse> {
    const response = await dashboardAxiosInstance.get(
      ENDPOINTS.APPROVALS.LIST,
      {
        params,
        signal,
      },
    );

    const apiData = response.data;

    return {
      approvals: apiData?.data?.submissions ?? [], // list items
      cardsCounts: apiData?.data?.counts ?? {}, //card data
    };
  },

  // ---------------------------
  // GET APPROVAL DETAILS
  // ---------------------------
  async getApprovalById(id: string): Promise<ApprovalDetails> {
    const response = await dashboardAxiosInstance.get(
      ENDPOINTS.APPROVALS.DETAILS(id), //  ID AS PATH PARAM
    );

    return response.data?.data;
  },

  // ---------------------------
  // GET COMMENTS
  // ---------------------------
  async getApprovalsComments(
    submission_id: string,
  ): Promise<ApprovalsGetComments[]> {
    const response = await dashboardAxiosInstance.get(
      ENDPOINTS.APPROVALS.COMMENTS(submission_id), //  ID AS PATH PARAM
    );

    return response.data?.data ?? [];
  },

  // ---------------------------
  // CREATE COMMENTS
  // ---------------------------
  async createApprovalsComments(payload: ApprovalsCommentsPayload) {
    const response = await dashboardAxiosInstance.post(
      "/approvals-admin/add-comments",
      payload,
    );

    return response.data;
  },

  // ---------------------------
  // ACTION (Approve/Reject)
  // ---------------------------
  async updateApprovalStatus(payload: ApproveOrRejectPayload) {
    const response = await dashboardAxiosInstance.patch(
      ENDPOINTS.APPROVALS.ACTION,
      payload,
    );
    return response.data;
  },

  // ---------------------------
  // GET FORM SUBMISSION (VIEW ONLY)
  // ---------------------------
  async getApprovalForm(
    formId: string,
    submitted_by: string,
  ): Promise<ApprovalFormItem | null> {
    const response = await dashboardAxiosInstance.get(
      `${ENDPOINTS.APPROVALS.FORM}${formId}`,
      {
        params: {
          submissionId: submitted_by, //  query param
        },
      },
    );
    return response.data?.data?.[0] ?? null;
  },
};

// UPLOAD TAB

export const adminApprovalsServiceUpload = {
  // ---------------------------
  // GET UPLOAD APPROVALS LIST
  // ---------------------------
  async getUploadApprovals(params: GetUploadApprovalsParams, signal?: AbortSignal): Promise<UploadAdminApprovalsResponse> {
    const response = await dashboardAxiosInstance.get(
      ENDPOINTS.UPLOAD_APPROVALS.LIST,
      {
        params,
        signal,
      },
    );

    const apiData = response.data;

    return {
      approvals: apiData?.data?.submissions ?? [], // list items
      cardsCounts: apiData?.data?.counts ?? {}, //card data
    };
  },

  // ---------------------------
  // GET UPLOAD APPROVAL DETAILS
  // ---------------------------
  async getUploadApprovalById(id: string): Promise<UploadApprovalDetails> {
    const response = await dashboardAxiosInstance.get(
      ENDPOINTS.UPLOAD_APPROVALS.DETAILS(id), //  ID AS PATH PARAM
    );

    return response.data?.data;
  },

  // ---------------------------
  // GET UPLOAD COMMENTS
  // ---------------------------
  async getUploadApprovalsComments(
    taskSubmissionId: string,
  ): Promise<UploadApprovalsGetComments[]> {
    const response = await dashboardAxiosInstance.get(
      ENDPOINTS.UPLOAD_APPROVALS.COMMENTS(taskSubmissionId), //  ID AS PATH PARAM
    );

    return response.data?.data ?? [];
  },

  // ---------------------------
  // CREATE UPLOAD COMMENTS
  // ---------------------------
  async createUploadApprovalsComments(payload: UploadApprovalsCommentsPayload) {
    const response = await dashboardAxiosInstance.post(
      "/approvals-admin/add-comments-for-task-upload",
      payload,
    );

    return response.data;
  },

  // ---------------------------
  // ACTION - UPLOAD (Approve/Reject)
  // ---------------------------
  async updateUploadApprovalStatus(payload: UploadApproveOrRejectPayload) {
    const response = await dashboardAxiosInstance.patch(
      ENDPOINTS.UPLOAD_APPROVALS.ACTION,
      payload,
    );
    return response.data;
  },

  // ---------------------------
  // GET UPLOAD SUBMISSION (VIEW ONLY)
  // ---------------------------
  async getApprovalUploadsSubmission(
    submissionId: string,
  ): Promise<ViewAdminUpload | null> {
    const response = await dashboardAxiosInstance.get(
      ENDPOINTS.UPLOAD_APPROVALS.UPLOAD(submissionId),
    );
    return response.data?.data ?? null;
  },
};
