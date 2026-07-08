import { apiRequest } from "../client";
import type {
  PaginatedResponse,
  PlotCreate,
  PlotUpdate,
  PlotOut,
} from "../types";

export function listPlots(
  opts: { farmer_id?: string; ward_id?: string; limit?: number; start_after?: string } = {}
) {
  const params = new URLSearchParams({ limit: String(opts.limit ?? 50) });
  if (opts.farmer_id) params.set("farmer_id", opts.farmer_id);
  if (opts.ward_id) params.set("ward_id", opts.ward_id);
  if (opts.start_after) params.set("start_after", opts.start_after);
  return apiRequest<PaginatedResponse<PlotOut>>(
    `/plots?${params.toString()}`
  );
}

export function getPlot(id: string) {
  return apiRequest<PlotOut>(`/plots/${id}`);
}

export function createPlot(data: PlotCreate) {
  return apiRequest<PlotOut>("/plots", { method: "POST", body: data });
}

export function updatePlot(id: string, data: PlotUpdate) {
  return apiRequest<PlotOut>(`/plots/${id}`, { method: "PATCH", body: data });
}

export function deletePlot(id: string) {
  return apiRequest<void>(`/plots/${id}`, { method: "DELETE" });
}
