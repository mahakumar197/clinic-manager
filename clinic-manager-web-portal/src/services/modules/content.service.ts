
import dashboardAxiosInstance from "../api/dashboardAxiosInstance";
import { normalizePagination } from "../api/normalizePagination";
import { ENDPOINTS } from "../api/endpoints";
import {
  Content,
  ContentCounts,
  ContentListResponse,
  Procedure,
  ProcedureListResponse,
} from "../types";

/* -----------------------------
 * CONTENT PARAMS
 * ---------------------------- */
interface GetContentParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  procedureId?: string;
}

/* -----------------------------
 * CREATE CONTENT PAYLOAD
 * ---------------------------- */
// export interface CreateContentPayload {
//   title: string;
//   description?: string;
//   type: string;
//   thumbnailUrl?: string;
//   contentUrl: string;
//   procedureId: string; // ✅ UUID ONLY
//   status: "draft" | "published";
//   content: string;
// }


export interface CreateContentPayload {
  title: string;
  description?: string;
  content?: string;

  type: "image" | "video" | "blog" | "elearning";

  thumbnailUrl?: string;

  contentUrl?: string[];        //  ARRAY
  imgCount?: number;            //  IMAGE ONLY

  procedureId: string;

  status: "draft" | "published";

  authorId?: string;
  authorName?: string;



  blogHeader?: string;          //  BLOG ONLY
  eLearnings?: Record<string, any>; //  ELEARNING ONLY
}


/* -----------------------------
 * DEFAULTS
 * ---------------------------- */
const EMPTY_COUNTS: ContentCounts = {
  image: 0,
  video: 0,
  blog: 0,
  elearning: 0,
  total: 0,
};

/* =====================================================
 * SERVICE
 * ===================================================== */
export const contentService = {
  /* ---------------------------
   * CONTENT
   * --------------------------- */

  async getContents(
    params: GetContentParams = {}
  ): Promise<ContentListResponse> {
    const res = await dashboardAxiosInstance.get(
      ENDPOINTS.CONTENT.LIST,
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          search: params.search,
          type: params.type,
          status: params.status,
          procedureId: params.procedureId,
        },
      }
    );

    const api = res.data;

    return {
      contents: api.data ?? [],
      counts: api.meta?.count ?? EMPTY_COUNTS,
      pagination: normalizePagination(api.meta?.pagination),
    };
  },

  async getContentById(contentId: string): Promise<Content> {
    const res = await dashboardAxiosInstance.get(
      ENDPOINTS.CONTENT.DETAILS(contentId)
    );
    return res.data.data;
  },

  async createContent(payload: CreateContentPayload): Promise<void> {
    await dashboardAxiosInstance.post(
      ENDPOINTS.CONTENT.LIST,
      payload
    );
  },

  async deleteContent(id: string): Promise<void> {
  await dashboardAxiosInstance.delete(
    ENDPOINTS.CONTENT.DELETE(id)
  );
},

async updateContent(id: string, payload: Partial<CreateContentPayload>
): Promise<void> {
  await dashboardAxiosInstance.patch(
    ENDPOINTS.CONTENT.UPDATE(id),
    payload
  );
},



  /* ---------------------------
   * PROCEDURE
   * --------------------------- */

  async getProcedures(
  params: { page?: number; limit?: number; search?: string; type?: string } = {},
  signal?: AbortSignal
): Promise<ProcedureListResponse> {
  const res = await dashboardAxiosInstance.get(
    ENDPOINTS.PROCEDURE.LIST,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        search: params.search,
        type: params.type, 
      },
      signal,
    }
  );

    const api = res.data;

    return {
      procedures: api.data ?? [],
      statusCounts: api.meta?.count ?? {
      draft: 0,
      published: 0,
      archived: 0,
    },
      pagination: normalizePagination(api.meta?.pagination),
    };
  },

  async getProcedureById(id: string): Promise<Procedure> {
    const res = await dashboardAxiosInstance.get(
      ENDPOINTS.PROCEDURE.DETAILS(id)
    );
    return res.data.data;
  },
};
