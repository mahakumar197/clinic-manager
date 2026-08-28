import { Pagination } from "../types";

export const normalizePagination = (pagination: any): Pagination => {
  return {
    page: Number(pagination?.page ?? 1),
    limit: Number(pagination?.limit ?? 10),
    total: Number(pagination?.total ?? 0),
    totalPages: Number(pagination?.totalPages ?? 0),
    hasNext: Boolean(pagination?.hasNext),
    hasPrev: Boolean(pagination?.hasPrev),
  };
};
