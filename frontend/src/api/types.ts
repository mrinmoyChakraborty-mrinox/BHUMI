export interface PaginatedResponse<T> {
  items: T[];
  next_cursor: string | null;
}

export interface DistrictCreate {
  name: string;
  state?: string;
  notes?: string | null;
}

export interface DistrictUpdate {
  name?: string;
  state?: string;
  notes?: string | null;
}

export interface DistrictOut {
  id: string;
  name: string;
  state: string;
  notes?: string | null;
  created_at?: string | null;
}

export interface WardCreate {
  ward_id: string;
  district_id: string;
  soil_type?: string | null;
  avg_rainfall_mm?: number | null;
  groundwater_depth_m?: number | null;
  forecast_dry_days?: number;
  lat?: number | null;
  lon?: number | null;
}

export interface WardUpdate {
  district_id?: string;
  soil_type?: string | null;
  avg_rainfall_mm?: number | null;
  groundwater_depth_m?: number | null;
  forecast_dry_days?: number;
  lat?: number | null;
  lon?: number | null;
}

export interface WardOut {
  id: string;
  district_id: string;
  soil_type?: string | null;
  avg_rainfall_mm?: number | null;
  groundwater_depth_m?: number | null;
  forecast_dry_days: number;
  lat?: number | null;
  lon?: number | null;
  updated_at?: string | null;
}

export interface FarmerCreate {
  name: string;
  phone: string;
  preferred_language?: Language;
  ward_id: string;
}

export type Language = "en" | "hi" | "bn" | "te";

export interface FarmerUpdate {
  name?: string;
  phone?: string;
  preferred_language?: string;
  ward_id?: string;
}

export interface FarmerOut {
  id: string;
  name: string;
  phone: string;
  preferred_language: string;
  ward_id: string;
  created_at?: string | null;
}

export interface PlotCreate {
  farmer_id: string;
  ward_id: string;
  soil_type?: string | null;
  groundwater_depth_m?: number | null;
  avg_rainfall_mm?: number | null;
  current_crop?: string | null;
  crop_stage?: string | null;
}

export interface PlotUpdate {
  ward_id?: string;
  soil_type?: string | null;
  groundwater_depth_m?: number | null;
  avg_rainfall_mm?: number | null;
  current_crop?: string | null;
  crop_stage?: string | null;
}

export interface PlotOut {
  id: string;
  farmer_id: string;
  ward_id: string;
  soil_type?: string | null;
  groundwater_depth_m?: number | null;
  avg_rainfall_mm?: number | null;
  current_crop?: string | null;
  crop_stage?: string | null;
  last_updated?: string | null;
}

export interface RecommendationRequest {
  plot_id: string;
}

export interface RecommendationOut {
  id: string;
  plot_id: string;
  recommended_crop: string;
  rationale: string;
  confidence: string;
  data_gaps?: string | null;
  source_data: Record<string, unknown>;
  created_at?: string | null;
}

export interface AlertTriggerRequest {
  plot_id: string;
  alert_type?: string;
  force?: boolean;
}

export interface AlertUpdate {
  status?: string;
  farmer_response?: string | null;
  message_text?: string | null;
}

export interface AlertOut {
  id: string;
  farmer_id: string;
  plot_id: string;
  alert_type: string;
  message_text: string;
  channel: string;
  status: string;
  farmer_response?: string | null;
  call_sid?: string | null;
  created_at?: string | null;
}

export interface HealthLogOut {
  id: string;
  farmer_id: string;
  plot_id: string;
  image_url?: string | null;
  diagnosis: string;
  confidence: string;
  recommended_action: string;
  escalate_to_rsk: boolean;
  status: string;
  rsk_notes?: string | null;
  created_at?: string | null;
}

export interface HealthLogResolve {
  rsk_notes: string;
  status?: string;
}

export interface OfficerCreate {
  uid: string;
  name: string;
  ward_id?: string | null;
  role?: string;
}

export interface OfficerUpdate {
  name?: string;
  ward_id?: string | null;
  role?: string;
}

export interface OfficerOut {
  uid: string;
  name: string;
  ward_id?: string | null;
  role: string;
  created_at?: string | null;
}

export interface DashboardMeResponse {
  uid: string;
  name?: string;
  role?: string;
  ward_id?: string | null;
  note?: string;
  created_at?: string | null;
}

export interface DashboardSummary {
  farmers: number;
  active_alerts: number;
  flagged_health_cases: number;
  wards: number;
}

export interface DashboardFarmer extends FarmerOut {
  current_crop?: string | null;
  plot_count: number;
  latest_alert_status?: string | null;
}

export interface DashboardAlert extends AlertOut {
  ui_color: "yellow" | "green" | "red";
}

export interface FarmerTimelineEvent {
  id: string;
  event_type: "alert" | "health_log" | "recommendation";
  plot_id: string;
  [key: string]: unknown;
}

export interface FarmerTimeline {
  farmer_id: string;
  events: FarmerTimelineEvent[];
}

export interface PublicCropRecommendationRequest {
  n: number;
  p: number;
  k: number;
  soilType: string;
  ph: number;
  temperature: number;
  rainfall: number;
  state: string;
  language?: string;
}

export interface PublicCropRecommendationResponse {
  success: boolean;
  recommendation: string;
}

export interface PublicDiseaseDetectionRequest {
  imageBase64: string;
  mimeType: string;
  cropName?: string | null;
  language?: string;
}

export interface PublicDiseaseDetectionResponse {
  success: boolean;
  diagnosis: string;
}

export interface PublicIrrigationAdviceRequest {
  cropName: string;
  soilType: string;
  stage: string;
  source: string;
  language?: string;
}

export interface PublicIrrigationAdviceResponse {
  success: boolean;
  advice: string;
}

export interface PublicWeatherAdvisoryRequest {
  state: string;
  district: string;
  language?: string;
}

export interface PublicWeatherAdvisoryResponse {
  success: boolean;
  advisory: string;
  metrics: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    soilMoisture: string | number;
    pestRiskIndex: string;
    soilMoisture_note?: string;
    [key: string]: unknown;
  };
}

export interface ChatbotRequest {
  message: string;
  history: { role: string; text: string }[];
  language?: string;
  location?: string;
}

export interface ChatbotResponse {
  success: boolean;
  response: string;
}
