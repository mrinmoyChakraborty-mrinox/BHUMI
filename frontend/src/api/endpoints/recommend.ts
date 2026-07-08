import { apiRequest } from "../client";
import type { RecommendationRequest, RecommendationOut } from "../types";

export function recommendCrop(data: RecommendationRequest) {
  return apiRequest<RecommendationOut>("/recommend", {
    method: "POST",
    body: data,
  });
}

export function getRecommendationHistory(plotId: string) {
  return apiRequest<RecommendationOut[]>(
    `/recommend/${plotId}/history`
  );
}
