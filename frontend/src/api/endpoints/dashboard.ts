import { apiRequest } from "../client";
import type {
  DashboardMeResponse,
  DashboardSummary,
  DashboardFarmer,
  DashboardAlert,
  HealthLogOut,
} from "../types";

export function getDashboardMe() {
  return apiRequest<DashboardMeResponse>("/dashboard/me");
}

export function getDashboardSummary() {
  return apiRequest<DashboardSummary>("/dashboard/summary");
}

export function getDashboardFarmers(wardId?: string, limit = 100) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (wardId) params.set("ward_id", wardId);
  return apiRequest<DashboardFarmer[]>(
    `/dashboard/farmers?${params.toString()}`
  );
}

export function getDashboardAlerts(wardId?: string, limit = 100) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (wardId) params.set("ward_id", wardId);
  return apiRequest<DashboardAlert[]>(
    `/dashboard/alerts?${params.toString()}`
  );
}

export function getDashboardHealthLogs(
  status = "flagged_for_rsk",
  limit = 100
) {
  return apiRequest<HealthLogOut[]>(
    `/dashboard/health-logs?status=${status}&limit=${limit}`
  );
}
