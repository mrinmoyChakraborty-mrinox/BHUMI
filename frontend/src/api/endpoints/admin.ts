import { apiRequest } from "../client";
import type { OfficerCreate, OfficerUpdate, OfficerOut } from "../types";

export function listOfficers(wardId?: string) {
  const params = wardId ? `?ward_id=${wardId}` : "";
  return apiRequest<OfficerOut[]>(`/admin/officers${params}`);
}

export function getOfficer(uid: string) {
  return apiRequest<OfficerOut>(`/admin/officers/${uid}`);
}

export function createOfficer(data: OfficerCreate) {
  return apiRequest<OfficerOut>("/admin/officers", {
    method: "POST",
    body: data,
  });
}

export function updateOfficer(uid: string, data: OfficerUpdate) {
  return apiRequest<OfficerOut>(`/admin/officers/${uid}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteOfficer(uid: string) {
  return apiRequest<void>(`/admin/officers/${uid}`, { method: "DELETE" });
}
