import { apiRequest } from "../client";
import type {
  ChatbotRequest,
  ChatbotResponse,
  PublicCropRecommendationRequest,
  PublicCropRecommendationResponse,
  PublicDiseaseDetectionRequest,
  PublicDiseaseDetectionResponse,
  PublicIrrigationAdviceRequest,
  PublicIrrigationAdviceResponse,
  PublicWeatherAdvisoryRequest,
  PublicWeatherAdvisoryResponse,
} from "../types";

export function cropRecommendation(data: PublicCropRecommendationRequest) {
  return apiRequest<PublicCropRecommendationResponse>(
    "/api/crop-recommendation",
    { method: "POST", body: data }
  );
}

export function diseaseDetection(data: PublicDiseaseDetectionRequest) {
  return apiRequest<PublicDiseaseDetectionResponse>(
    "/api/disease-detection",
    { method: "POST", body: data }
  );
}

export function irrigationAdvice(data: PublicIrrigationAdviceRequest) {
  return apiRequest<PublicIrrigationAdviceResponse>(
    "/api/irrigation-advice",
    { method: "POST", body: data }
  );
}

export function weatherAdvisory(data: PublicWeatherAdvisoryRequest) {
  return apiRequest<PublicWeatherAdvisoryResponse>("/api/weather-advisory", {
    method: "POST",
    body: data,
  });
}

export function chatbot(data: ChatbotRequest) {
  return apiRequest<ChatbotResponse>("/api/chatbot", {
    method: "POST",
    body: data,
  });
}
