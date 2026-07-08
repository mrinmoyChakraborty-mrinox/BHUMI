import { apiRequest } from "../client";
import type {
  PaginatedResponse,
  WardCreate,
  WardUpdate,
  WardOut,
} from "../types";

export function listWards(
  opts: { district_id?: string; limit?: number; start_after?: string } = {}
) {
  const params = new URLSearchParams({ limit: String(opts.limit ?? 50) });
  if (opts.district_id) params.set("district_id", opts.district_id);
  if (opts.start_after) params.set("start_after", opts.start_after);
  return apiRequest<PaginatedResponse<WardOut>>(
    `/wards?${params.toString()}`
  );
}

export function getWard(id: string) {
  return apiRequest<WardOut>(`/wards/${id}`);
}

export function createWard(data: WardCreate) {
  return apiRequest<WardOut>("/wards", { method: "POST", body: data });
}

export function updateWard(id: string, data: WardUpdate) {
  return apiRequest<WardOut>(`/wards/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteWard(id: string) {
  return apiRequest<void>(`/wards/${id}`, { method: "DELETE" });
}

export function syncWardReferenceData(id: string) {
  return apiRequest<WardOut>(`/wards/${id}/sync-reference-data`, {
    method: "POST",
  });
}

export function refreshWardForecast(id: string) {
  return apiRequest<WardOut>(`/wards/${id}/refresh-forecast`, {
    method: "POST",
  });
}
