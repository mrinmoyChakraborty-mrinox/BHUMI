import { apiRequest } from "../client";
import type {
  PaginatedResponse,
  FarmerCreate,
  FarmerUpdate,
  FarmerOut,
  FarmerTimeline,
} from "../types";

export function listFarmers(
  opts: { ward_id?: string; limit?: number; start_after?: string } = {}
) {
  const params = new URLSearchParams({ limit: String(opts.limit ?? 50) });
  if (opts.ward_id) params.set("ward_id", opts.ward_id);
  if (opts.start_after) params.set("start_after", opts.start_after);
  return apiRequest<PaginatedResponse<FarmerOut>>(
    `/farmers?${params.toString()}`
  );
}

export function getFarmer(id: string) {
  return apiRequest<FarmerOut>(`/farmers/${id}`);
}

export function getFarmerTimeline(id: string, limit = 20) {
  return apiRequest<FarmerTimeline>(
    `/farmers/${id}/timeline?limit=${limit}`
  );
}

export function createFarmer(data: FarmerCreate) {
  return apiRequest<FarmerOut>("/farmers", { method: "POST", body: data });
}

export function updateFarmer(id: string, data: FarmerUpdate) {
  return apiRequest<FarmerOut>(`/farmers/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export function updateOwnFarmer(id: string, data: FarmerUpdate) {
  return apiRequest<FarmerOut>(`/farmers/${id}/self`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteFarmer(id: string) {
  return apiRequest<void>(`/farmers/${id}`, { method: "DELETE" });
}
