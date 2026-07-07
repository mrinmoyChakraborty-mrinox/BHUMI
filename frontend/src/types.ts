export type Language = "en" | "hi" | "bn";

export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export interface Scheme {
  id: string;
  name: string;
  nameLocal: { hi: string; bn: string };
  ministry: string;
  benefits: string;
  benefitsLocal: { hi: string; bn: string };
  eligibility: string;
  eligibilityLocal: { hi: string; bn: string };
  howToApply: string;
  link: string;
  tag: "Direct Benefit" | "Insurance" | "Credit" | "Subsidy" | "Infrastructure";
}

export interface SoilNPK {
  n: number;
  p: number;
  k: number;
  soilType: string;
  ph: number;
  temperature: number;
  rainfall: number;
  state: string;
}

export interface DiseaseSample {
  id: string;
  name: string;
  cropName: string;
  image: string; // Base64 or placeholder URL
  mimeType: string;
  symptoms: string;
}
