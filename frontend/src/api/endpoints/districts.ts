import { apiRequest } from "../client";
import type {
  PaginatedResponse,
  DistrictCreate,
  DistrictUpdate,
  DistrictOut,
} from "../types";

export function listDistricts(limit = 50, startAfter?: string) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (startAfter) params.set("start_after", startAfter);
  return apiRequest<PaginatedResponse<DistrictOut>>(
    `/districts?${params.toString()}`
  );
}

export function getDistrict(id: string) {
  return apiRequest<DistrictOut>(`/districts/${id}`);
}

export function createDistrict(data: DistrictCreate) {
  return apiRequest<DistrictOut>("/districts", {
    method: "POST",
    body: data,
  });
}

export function updateDistrict(id: string, data: DistrictUpdate) {
  return apiRequest<DistrictOut>(`/districts/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteDistrict(id: string) {
  return apiRequest<void>(`/districts/${id}`, { method: "DELETE" });
}
