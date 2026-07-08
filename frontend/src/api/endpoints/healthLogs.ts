import { apiRequest } from "../client";
import type {
  PaginatedResponse,
  HealthLogOut,
  HealthLogResolve,
} from "../types";

export function listHealthLogs(
  opts: { status?: string; farmer_id?: string; limit?: number; start_after?: string } = {}
) {
  const params = new URLSearchParams({ limit: String(opts.limit ?? 50) });
  if (opts.status) params.set("status", opts.status);
  if (opts.farmer_id) params.set("farmer_id", opts.farmer_id);
  if (opts.start_after) params.set("start_after", opts.start_after);
  return apiRequest<PaginatedResponse<HealthLogOut>>(
    `/health/logs?${params.toString()}`
  );
}

export function getHealthLog(id: string) {
  return apiRequest<HealthLogOut>(`/health/log/${id}`);
}

export function resolveHealthLog(id: string, data: HealthLogResolve) {
  return apiRequest<HealthLogOut>(`/health/log/${id}/resolve`, {
    method: "PATCH",
    body: data,
  });
}
