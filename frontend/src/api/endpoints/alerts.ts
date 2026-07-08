import { apiRequest } from "../client";
import type {
  PaginatedResponse,
  AlertTriggerRequest,
  AlertUpdate,
  AlertOut,
} from "../types";

export interface TriggerAlertResponse {
  status: string;
  channel?: string;
  alert_id?: string;
  message_text?: string;
  call_sid?: string | null;
  sms_sid?: string | null;
  warnings?: string[] | null;
  reason?: string;
}

export function triggerAlert(data: AlertTriggerRequest) {
  return apiRequest<TriggerAlertResponse>("/alert/trigger", {
    method: "POST",
    body: data,
  });
}

export function listAlerts(
  opts: { farmer_id?: string; status?: string; limit?: number; start_after?: string } = {}
) {
  const params = new URLSearchParams({ limit: String(opts.limit ?? 50) });
  if (opts.farmer_id) params.set("farmer_id", opts.farmer_id);
  if (opts.status) params.set("status", opts.status);
  if (opts.start_after) params.set("start_after", opts.start_after);
  return apiRequest<PaginatedResponse<AlertOut>>(
    `/alerts?${params.toString()}`
  );
}

export function getAlert(id: string) {
  return apiRequest<AlertOut>(`/alerts/${id}`);
}

export function updateAlert(id: string, data: AlertUpdate) {
  return apiRequest<AlertOut>(`/alerts/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteAlert(id: string) {
  return apiRequest<void>(`/alerts/${id}`, { method: "DELETE" });
}
