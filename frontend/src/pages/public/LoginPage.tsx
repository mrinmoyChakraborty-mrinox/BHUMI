import { useState, useRef, useEffect, type FormEvent } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "../../auth/firebase";
import { useAuthContext } from "../../auth/AuthContext";
import { apiRequest } from "../../api/client";
import type { FarmerOut, PlotCreate, PlotOut } from "../../api/types";
import { API_BASE_URL } from "../../config/env";
import {
  Loader2, Mail, Lock, Phone, Smartphone, Sprout,
  User, Globe, AlertCircle, CheckCircle,
  MessageSquare,
} from "lucide-react";
import type { Language } from "../../types";
import LOGO from "../../LOGO_BHUMI.png";

// ── Localised text for all 4 languages ─────────────────────────
const T = {
  en: {
    brand: "BHUMI Krishi AI",
    hero_title: "Your Farming,",
    hero_title_span: "Supercharged by AI",
    hero_desc: "Free AI tools for Indian farmers — crop advice, disease detection, weather alerts & government schemes in your language.",
    benefits: ["Save your farming history", "Get personalised irrigation plans", "Real-time weather alerts for your area"],
    farmers_count: "48,500+ farmers trust us",
    sign_in: "Sign In",
    create_account: "Create Account",
    login_phone: "Use Phone",
    login_email: "Use Email",
    mobile_label: "Your Mobile Number",
    mobile_placeholder: "Enter 10-digit number",
    mobile_hint: "You will receive a 6-digit code via SMS",
    get_otp: "Send OTP",
    otp_title: "Enter OTP Code",
    otp_sent_to: "We sent a 6-digit code to",
    otp_placeholder: "Enter 6-digit code",
    otp_hint: "Check SMS on your phone",
    verify_otp: "Verify & Login",
    change_phone: "Use a different number",
    email_label: "Email Address",
    email_placeholder: "your@email.com",
    password_label: "Password",
    password_placeholder: "Enter your password",
    sign_in_btn: "Sign In",
    rsk_note: "RSK Officers & Admins — use Email login",
    reg_name: "Your Full Name",
    reg_name_hint: "As shown on your ID card",
    reg_phone: "Mobile Number",
    reg_phone_hint: "With country code, e.g. +91",
    reg_email: "Email Address",
    reg_email_hint: "Optional, for account recovery",
    reg_language: "Preferred Language",
    reg_state: "Your State",
    reg_state_placeholder: "Select your state",
    reg_district: "Your District",
    reg_district_placeholder: "Enter district name",
    reg_crop: "Main Crop (optional)",
    reg_crop_placeholder: "e.g. Rice, Cotton, Wheat",
    reg_soil: "Soil Type (optional)",
    reg_soil_placeholder: "Select soil type",
    register_btn: "Create My Account",
    have_account: "Already registered?",
    sign_in_link: "Sign in here",
    guest: "Skip, continue as guest",
    back_home: "Back to home",
    error_password_mismatch: "Passwords do not match — please type the same password twice",
    error_password_short: "Password must be at least 6 characters",
    error_otp_invalid: "That code is not correct. Please try again.",
    error_generic: "Something went wrong. Please try again.",
    error_network: "Could not connect. Check your internet and try again.",
    error_name_required: "Please enter your full name to continue.",
    sending: "Sending...",
    verifying: "Verifying...",
    creating: "Creating account...",
    step: "Step",
    of: "of",
    welcome_back: "Welcome Back",
    join_title: "Join as a Farmer",
    otp_step1: "Enter your mobile number",
    otp_step2: "Enter the OTP sent to your phone",
    profile_title: "Complete Your Profile",
    profile_subtitle: "Just a few details so we can personalise your experience.",
  },
  hi: {
    brand: "भूमि कृषि AI",
    hero_title: "आपकी खेती,",
    hero_title_span: "AI की मदद से बेहतर",
    hero_desc: "भारतीय किसानों के लिए मुफ्त AI उपकरण — फसल सलाह, रोग पहचान, मौसम अलर्ट और सरकारी योजनाएं आपकी भाषा में।",
    benefits: ["अपना खेती इतिहास सुरक्षित रखें", "व्यक्तिगत सिंचाई योजना पाएं", "अपने क्षेत्र के मौसम अलर्ट"],
    farmers_count: "48,500+ किसान हम पर भरोसा करते हैं",
    sign_in: "साइन इन",
    create_account: "नया खाता बनाएं",
    login_phone: "फ़ोन से",
    login_email: "ईमेल से",
    mobile_label: "आपका मोबाइल नंबर",
    mobile_placeholder: "10 अंकों का नंबर दर्ज करें",
    mobile_hint: "आपको SMS के ज़रिए 6 अंकों का कोड मिलेगा",
    get_otp: "OTP भेजें",
    otp_title: "OTP कोड दर्ज करें",
    otp_sent_to: "हमने 6 अंकों का कोड भेजा है",
    otp_placeholder: "6 अंकों का कोड दर्ज करें",
    otp_hint: "अपने फ़ोन पर SMS देखें",
    verify_otp: "कोड जांचें और लॉगिन करें",
    change_phone: "दूसरा नंबर इस्तेमाल करें",
    email_label: "ईमेल पता",
    email_placeholder: "आपका ईमेल",
    password_label: "पासवर्ड",
    password_placeholder: "अपना पासवर्ड दर्ज करें",
    sign_in_btn: "साइन इन",
    rsk_note: "RSK अधिकारी और एडमिन — ईमेल से लॉगिन करें",
    reg_name: "आपका पूरा नाम",
    reg_name_hint: "जैसा आपके ID कार्ड पर है",
    reg_phone: "मोबाइल नंबर",
    reg_phone_hint: "देश कोड के साथ, जैसे +91",
    reg_email: "ईमेल पता",
    reg_email_hint: "वैकल्पिक, खाता रिकवरी के लिए",
    reg_language: "पसंदीदा भाषा",
    reg_state: "आपका राज्य",
    reg_state_placeholder: "अपना राज्य चुनें",
    reg_district: "आपका जिला",
    reg_district_placeholder: "जिले का नाम दर्ज करें",
    reg_crop: "मुख्य फसल (वैकल्पिक)",
    reg_crop_placeholder: "जैसे धान, कपास, गेहूं",
    reg_soil: "मिट्टी का प्रकार (वैकल्पिक)",
    reg_soil_placeholder: "मिट्टी का प्रकार चुनें",
    register_btn: "मेरा खाता बनाएं",
    have_account: "पहले से खाता है?",
    sign_in_link: "यहां साइन इन करें",
    guest: "छोड़ें, बिना खाता जारी रखें",
    back_home: "होम पेज पर जाएं",
    error_password_mismatch: "पासवर्ड मेल नहीं खाते — कृपया दोबारा एक जैसा पासवर्ड लिखें",
    error_password_short: "पासवर्ड कम से कम 6 अक्षर का होना चाहिए",
    error_otp_invalid: "कोड सही नहीं है। कृपया फिर से प्रयास करें।",
    error_generic: "कुछ गलत हो गया। कृपया फिर से प्रयास करें।",
    error_network: "कनेक्शन नहीं हो पाया। अपना इंटरनेट जांचें।",
    error_name_required: "जारी रखने के लिए कृपया अपना पूरा नाम दर्ज करें।",
    sending: "भेज रहे हैं...",
    verifying: "जांच रहे हैं...",
    creating: "खाता बना रहे हैं...",
    step: "चरण",
    of: "का",
    welcome_back: "वापसी पर स्वागत है",
    join_title: "किसान के रूप में जुड़ें",
    otp_step1: "अपना मोबाइल नंबर दर्ज करें",
    otp_step2: "फ़ोन पर आया OTP कोड दर्ज करें",
    profile_title: "अपनी प्रोफाइल पूरी करें",
    profile_subtitle: "कुछ जानकारी दें ताकि हम आपका अनुभव बेहतर बना सकें।",
  },
  bn: {
    brand: "ভূমি কৃষি AI",
    hero_title: "আপনার চাষ,",
    hero_title_span: "AI দ্বারা শক্তিশালী",
    hero_desc: "ভারতীয় কৃষকদের জন্য বিনামূল্যে AI টুলস — ফসলের পরামর্শ, রোগ সনাক্তকরণ, আবহাওয়া সতর্কতা ও সরকারি প্রকল্প আপনার ভাষায়।",
    benefits: ["আপনার চাষের ইতিহাস সংরক্ষণ করুন", "ব্যক্তিগতকৃত সেচ পরিকল্পনা পান", "আপনার এলাকার আবহাওয়া সতর্কতা"],
    farmers_count: "৪৮,৫০০+ কৃষক আমাদের বিশ্বাস করেন",
    sign_in: "সাইন ইন",
    create_account: "নতুন অ্যাকাউন্ট",
    login_phone: "ফোন দিয়ে",
    login_email: "ইমেল দিয়ে",
    mobile_label: "আপনার মোবাইল নম্বর",
    mobile_placeholder: "১০ ডিজিটের নম্বর দিন",
    mobile_hint: "আপনি SMS এর মাধ্যমে ৬ ডিজিটের কোড পাবেন",
    get_otp: "OTP পাঠান",
    otp_title: "OTP কোড দিন",
    otp_sent_to: "আমরা ৬ ডিজিটের কোড পাঠিয়েছি",
    otp_placeholder: "৬ ডিজিটের কোড দিন",
    otp_hint: "আপনার ফোনে SMS দেখুন",
    verify_otp: "কোড যাচাই ও লগইন",
    change_phone: "অন্য নম্বর ব্যবহার করুন",
    email_label: "ইমেল ঠিকানা",
    email_placeholder: "আপনার ইমেল",
    password_label: "পাসওয়ার্ড",
    password_placeholder: "আপনার পাসওয়ার্ড দিন",
    sign_in_btn: "সাইন ইন",
    rsk_note: "RSK অফিসার ও অ্যাডমিন — ইমেল দিয়ে লগইন করুন",
    reg_name: "আপনার পুরো নাম",
    reg_name_hint: "যেমন আপনার ID কার্ডে আছে",
    reg_phone: "মোবাইল নম্বর",
    reg_phone_hint: "দেশ কোড সহ, যেমন +91",
    reg_email: "ইমেল ঠিকানা",
    reg_email_hint: "ঐচ্ছিক, অ্যাকাউন্ট পুনরুদ্ধারের জন্য",
    reg_language: "পছন্দের ভাষা",
    reg_state: "আপনার রাজ্য",
    reg_state_placeholder: "আপনার রাজ্য নির্বাচন করুন",
    reg_district: "আপনার জেলা",
    reg_district_placeholder: "জেলার নাম দিন",
    reg_crop: "প্রধান ফসল (ঐচ্ছিক)",
    reg_crop_placeholder: "যেমন ধান, তুলা, গম",
    reg_soil: "মাটির ধরন (ঐচ্ছিক)",
    reg_soil_placeholder: "মাটির ধরন নির্বাচন করুন",
    register_btn: "আমার অ্যাকাউন্ট তৈরি করুন",
    have_account: "ইতিমধ্যে নিবন্ধিত?",
    sign_in_link: "এখানে সাইন ইন করুন",
    guest: "এড়িয়ে যান, অতিথি হিসাবে চালিয়ে যান",
    back_home: "হোম পেজে ফিরুন",
    error_password_mismatch: "পাসওয়ার্ড মিলছে না — দয়া করে আবার একই পাসওয়ার্ড লিখুন",
    error_password_short: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে",
    error_otp_invalid: "কোডটি সঠিক নয়। আবার চেষ্টা করুন।",
    error_generic: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    error_network: "সংযোগ হয়নি। আপনার ইন্টারনেট চেক করুন।",
    error_name_required: "চালিয়ে যেতে আপনার পুরো নাম লিখুন।",
    sending: "পাঠানো হচ্ছে...",
    verifying: "যাচাই করা হচ্ছে...",
    creating: "অ্যাকাউন্ট তৈরি হচ্ছে...",
    step: "ধাপ",
    of: "এর",
    welcome_back: "ফিরে আসায় স্বাগতম",
    join_title: "কৃষক হিসেবে যোগ দিন",
    otp_step1: "আপনার মোবাইল নম্বর দিন",
    otp_step2: "ফোনে আসা OTP কোড দিন",
    profile_title: "আপনার প্রোফাইল পূরণ করুন",
    profile_subtitle: "আমরা আপনার অভিজ্ঞতা ব্যক্তিগত করতে পারি এমন কিছু তথ্য দিন।",
  },
  te: {
    brand: "భూమి కృషి AI",
    hero_title: "మీ వ్యవసాయం,",
    hero_title_span: "AI తో సూపర్‌చార్జ్",
    hero_desc: "భారత రైతుల కోసం ఉచిత AI సాధనాలు — పంట సలహా, వ్యాధి గుర్తింపు, వాతావరణ హెచ్చరికలు & ప్రభుత్వ పథకాలు మీ భాషలో.",
    benefits: ["మీ వ్యవసాయ చరిత్రను సేవ్ చేయండి", "వ్యక్తిగతీకరించిన నీటి షెడ్యూల్ పొందండి", "మీ ప్రాంతానికి వాతావరణ హెచ్చరికలు"],
    farmers_count: "48,500+ మంది రైతులు మమ్మల్ని విశ్వసిస్తారు",
    sign_in: "సైన్ ఇన్",
    create_account: "ఖాతా సృష్టించండి",
    login_phone: "ఫోన్ ఉపయోగించండి",
    login_email: "ఇమెయిల్ ఉపయోగించండి",
    mobile_label: "మీ మొబైల్ నంబర్",
    mobile_placeholder: "10 అంకెల నంబర్ నమోదు చేయండి",
    mobile_hint: "మీకు SMS ద్వారా 6 అంకెల కోడ్ వస్తుంది",
    get_otp: "OTP పంపండి",
    otp_title: "OTP కోడ్ నమోదు చేయండి",
    otp_sent_to: "మేము 6 అంకెల కోడ్ పంపాము",
    otp_placeholder: "6 అంకెల కోడ్ నమోదు చేయండి",
    otp_hint: "మీ ఫోన్‌లో SMS తనిఖీ చేయండి",
    verify_otp: "కోడ్ ధృవీకరించండి & లాగిన్",
    change_phone: "వేరే నంబర్ ఉపయోగించండి",
    email_label: "ఇమెయిల్ చిరునామా",
    email_placeholder: "మీ ఇమెయిల్",
    password_label: "పాస్‌వర్డ్",
    password_placeholder: "మీ పాస్‌వర్డ్ నమోదు చేయండి",
    sign_in_btn: "సైన్ ఇన్",
    rsk_note: "RSK అధికారులు & అడ్మిన్ — ఇమెయిల్ ద్వారా లాగిన్ చేయండి",
    reg_name: "మీ పూర్తి పేరు",
    reg_name_hint: "మీ ID కార్డ్‌లో ఉన్నట్లు",
    reg_phone: "మొబైల్ నంబర్",
    reg_phone_hint: "దేశ కోడ్ తో, ఉదా. +91",
    reg_email: "ఇమెయిల్ చిరునామా",
    reg_email_hint: "ఐచ్ఛికం, ఖాతా పునరుద్ధరణ కోసం",
    reg_language: "ఇష్టపడే భాష",
    reg_state: "మీ రాష్ట్రం",
    reg_state_placeholder: "మీ రాష్ట్రం ఎంచుకోండి",
    reg_district: "మీ జిల్లా",
    reg_district_placeholder: "జిల్లా పేరు నమోదు చేయండి",
    reg_crop: "ప్రధాన పంట (ఐచ్ఛికం)",
    reg_crop_placeholder: "ఉదా. వరి, పత్తి, గోధుమ",
    reg_soil: "నేల రకం (ఐచ్ఛికం)",
    reg_soil_placeholder: "నేల రకం ఎంచుకోండి",
    register_btn: "నా ఖాతా సృష్టించండి",
    have_account: "ఇప్పటికే నమోదు చేసారా?",
    sign_in_link: "ఇక్కడ సైన్ ఇన్ చేయండి",
    guest: "దాటవేయి, అతిథిగా కొనసాగించు",
    back_home: "హోమ్ పేజీకి వెళ్ళు",
    error_password_mismatch: "పాస్‌వర్డ్ సరిపోలలేదు — దయచేసి ఒకే పాస్‌వర్డ్ రెండుసార్లు టైప్ చేయండి",
    error_password_short: "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి",
    error_otp_invalid: "ఆ కోడ్ సరైనది కాదు. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    error_generic: "ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    error_network: "కనెక్ట్ కాలేదు. మీ ఇంటర్నెట్ తనిఖీ చేయండి.",
    error_name_required: "కొనసాగించడానికి దయచేసి మీ పూర్తి పేరు నమోదు చేయండి.",
    sending: "పంపుతోంది...",
    verifying: "ధృవీకరిస్తోంది...",
    creating: "ఖాతా సృష్టిస్తోంది...",
    step: "దశ",
    of: "లో",
    welcome_back: "తిరిగి స్వాగతం",
    join_title: "రైతుగా చేరండి",
    otp_step1: "మీ మొబైల్ నంబర్ నమోదు చేయండి",
    otp_step2: "ఫోన్‌కు వచ్చిన OTP కోడ్ నమోదు చేయండి",
    profile_title: "మీ ప్రొఫైల్‌ను పూర్తి చేయండి",
    profile_subtitle: "మేము మీ అనుభవాన్ని వ్యక్తిగతం చేయడానికి కొన్ని వివరాలు ఇవ్వండి.",
  },
};

const SOIL_TYPES = [
  "alluvial", "black", "red", "laterite", "sandy", "loamy", "clay",
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Gujarat", "Haryana",
  "Karnataka", "Madhya Pradesh", "Maharashtra", "Odisha",
  "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "West Bengal",
];

type AuthMode = "login" | "register";
type LoginMethod = "phone" | "email";
type PhoneStep = "input" | "otp" | "profile";

function getErrorMessage(err: unknown, t: typeof T.en): string {
  if (!err) return t.error_generic;
  const msg = err instanceof Error ? err.message : "";
  if (msg.includes("auth/invalid-verification-code") || msg.includes("auth/code-expired")) return t.error_otp_invalid;
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) return t.error_network;
  if (msg.includes("auth/too-many-requests")) return "Too many attempts. Please wait a minute and try again.";
  if (msg.includes("auth/user-not-found") || msg.includes("auth/wrong-password")) return "Email or password is incorrect.";
  if (msg.includes("auth/email-already-in-use")) return "This email is already registered. Try signing in.";
  if (msg.includes("auth/invalid-phone-number")) return "Please enter a valid 10-digit mobile number.";
  if (msg.includes("auth/captcha-check-failed")) return "Verification failed. Please try again.";
  return msg || t.error_generic;
}

export default function LoginPage() {
  const { user, role, loading: authLoading, loginRedirect, setLoginRedirect, setFarmerProfile } = useAuthContext();
  const navigate = useNavigate();
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const initialHandled = useRef(false);
  const [lang, setLang] = useState<Language>("en");
  const t = T[lang];

  const [mode, setMode] = useState<AuthMode>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("input");

  // Login fields
  const [phoneLogin, setPhoneLogin] = useState("");
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");

  // Register / profile fields
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regLanguage, setRegLanguage] = useState("en");
  const [regState, setRegState] = useState("");
  const [regDistrict, setRegDistrict] = useState("");
  const [regCrop, setRegCrop] = useState("");
  const [regSoil, setRegSoil] = useState("");

  // OTP fields
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpPhone, setOtpPhone] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If the user is already authenticated when landing here, send them on.
  useEffect(() => {
    if (authLoading || !user) return;
    if (initialHandled.current) return;
    if (role === null) return; // wait until the role has been resolved
    initialHandled.current = true;
    const dest = loginRedirect || (role === "farmer" ? "/farmer" : "/dashboard");
    setLoginRedirect(null);
    navigate(dest, { replace: true });
  }, [user, role, authLoading, loginRedirect, navigate, setLoginRedirect]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-emerald-50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Lazily (re)create the invisible reCAPTCHA verifier right before it is
  // needed. Clearing any previous instance first avoids the
  // "reCAPTCHA has already been rendered in this element" error that occurs
  // when a verifier is created on mount (e.g. under React StrictMode).
  async function makeVerifier(): Promise<RecaptchaVerifier> {
    if (!auth) throw new Error("auth-unavailable");
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {
        // ignore
      }
      recaptchaVerifierRef.current = null;
    }
    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
    await verifier.render();
    recaptchaVerifierRef.current = verifier;
    return verifier;
  }

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const resetPhoneFlow = () => {
    setPhoneStep("input");
    setOtpCode("");
    setConfirmationResult(null);
    setOtpPhone("");
    setError("");
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError("");
    resetPhoneFlow();
    if (m === "register") setLoginMethod("phone");
  };

  const handleSendOtp = async () => {
    if (!auth) {
      setError("Login service is unavailable right now. Please try again later.");
      return;
    }
    if (phoneLogin.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const phoneNumber = `+91${phoneLogin.replace(/\s/g, "")}`;
      const verifier = await makeVerifier();
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
      setOtpPhone(phoneNumber);
      setPhoneStep("otp");
    } catch (err: unknown) {
      setError(getErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) return;
    setError("");
    setSubmitting(true);
    try {
      await confirmationResult.confirm(otpCode);
      await new Promise((r) => setTimeout(r, 600));
      const phone = encodeURIComponent(otpPhone);
      const res = await fetch(`${API_BASE_URL}/farmers/by-phone/${phone}`);
      if (res.ok) {
        const profile: FarmerOut | null = await res.json();
        if (profile && profile.id) {
          setFarmerProfile(profile);
          const dest = loginRedirect || "/farmer";
          setLoginRedirect(null);
          navigate(dest, { replace: true });
          return;
        }
      }
      // No farmer record yet — collect profile details to finish signup.
      setRegPhone(otpPhone);
      setPhoneStep("profile");
    } catch (err: unknown) {
      setError(getErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Login service is unavailable right now. Please try again later.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, emailLogin, passwordLogin);
      const dest = loginRedirect || "/dashboard";
      setLoginRedirect(null);
      navigate(dest, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileComplete = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth?.currentUser) return;
    setError("");

    if (!regName.trim()) {
      setError(t.error_name_required);
      return;
    }

    setSubmitting(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const authHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const cleanedPhone = regPhone.startsWith("+")
        ? regPhone
        : `+91${regPhone.replace(/\s/g, "")}`;

      const farmer = await apiRequest<FarmerOut>("/farmers", {
        method: "POST",
        headers: authHeaders,
        body: {
          name: regName.trim(),
          phone: cleanedPhone,
          preferred_language: regLanguage,
          state: regState || undefined,
          district: regDistrict || undefined,
          email: regEmail.trim() || undefined,
        },
      });

      if (farmer.id) {
        const plotPayload: Partial<PlotCreate> = { farmer_id: farmer.id, ward_id: "general" };
        if (regCrop) plotPayload.current_crop = regCrop;
        if (regSoil) plotPayload.soil_type = regSoil;
        try {
          await apiRequest<PlotOut>("/plots", {
            method: "POST",
            headers: authHeaders,
            body: plotPayload,
          });
        } catch {
          // optional
        }
      }

      setFarmerProfile(farmer);
      const dest = loginRedirect || "/farmer";
      setLoginRedirect(null);
      navigate(dest, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  const LANG_LABELS: Record<Language, string> = {
    en: "EN", hi: "हिन्दी", bn: "বাংলা", te: "తెలుగు",
  };

  const isRegister = mode === "register";

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl bg-white border-2 border-emerald-700 rounded-3xl shadow-[8px_8px_0px_0px_rgba(4,120,87,1)] overflow-hidden grid md:grid-cols-[1fr_1.2fr]">
        {/* ── Hero panel ────────────────────────────────────────── */}
        <div
          className="relative bg-gradient-to-br from-emerald-700/92 via-emerald-600/92 to-teal-700/92 p-8 md:p-10 flex flex-col text-white overflow-hidden bg-cover bg-center"
          style={{ minHeight: 320, backgroundImage: "url(/login-bg.png)" }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -left-16 w-72 h-72 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

          {/* Language selector */}
          <div className="relative z-10 flex justify-end mb-2">
            <div className="flex bg-white/10 backdrop-blur border border-white/20 rounded-xl p-0.5 gap-0.5">
              {(Object.keys(LANG_LABELS) as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                    lang === l ? "bg-white text-emerald-800" : "text-white/70 hover:text-white"
                  }`}
                  aria-label={l === "en" ? "English" : l === "hi" ? "हिन्दी" : l === "bn" ? "বাংলা" : "తెలుగు"}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest border border-white/20 self-start mb-4">
              <img src={LOGO} alt="BHUMI" className="w-5 h-5 rounded-md border border-white/40 object-cover" />
              {t.brand}
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-black leading-tight">
              {t.hero_title}<br />
              <span className="text-emerald-200">{t.hero_title_span}</span>
            </h2>
            <p className="mt-3 text-sm text-emerald-50/90 leading-relaxed max-w-xs">
              {t.hero_desc}
            </p>
          </div>

          {/* Benefits + stats */}
          <div className="relative z-10 mt-4 space-y-2">
            {t.benefits.map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-xs">
                <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="relative z-10 mt-4 text-[10px] font-mono text-emerald-200/80">
            {t.farmers_count}
          </div>
        </div>

        {/* ── Form panel ────────────────────────────────────────── */}
        <div className="p-6 md:p-8 lg:p-10">
          {/* Step indicator + mode tabs */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-black text-stone-900">
              {isRegister ? t.join_title : t.welcome_back}
            </h3>
            <div className="flex border-2 border-stone-200 rounded-xl p-0.5">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`px-4 py-2 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                    mode === m ? "bg-emerald-600 text-white shadow-sm" : "text-stone-400 hover:text-stone-700"
                  }`}
                >
                  {m === "login" ? t.sign_in : t.create_account}
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl px-4 py-3.5 mb-5 flex items-start gap-2.5 text-sm font-semibold text-rose-700 leading-relaxed">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* ── PROFILE COMPLETION (signup step 3) ───────────────── */}
          {phoneStep === "profile" ? (
            <form onSubmit={handleProfileComplete} className="space-y-3.5">
              <div className="mb-1">
                <h4 className="text-sm font-display font-black text-stone-900">{t.profile_title}</h4>
                <p className="text-[11px] text-stone-400">{t.profile_subtitle}</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.reg_name}</label>
                <div className="flex items-center gap-2.5 bg-stone-50 border-2 border-stone-300 rounded-2xl px-4 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <User className="w-5 h-5 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={t.reg_name}
                    className="w-full py-3 text-sm bg-transparent focus:outline-none font-semibold"
                    required
                  />
                </div>
                <p className="mt-0.5 text-[11px] text-stone-400">{t.reg_name_hint}</p>
              </div>

              {/* Phone (read-only, verified) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.reg_phone}</label>
                <div className="flex items-center gap-2.5 bg-stone-100 border-2 border-stone-200 rounded-2xl px-4">
                  <Phone className="w-5 h-5 text-stone-400 shrink-0" />
                  <input
                    type="tel"
                    value={regPhone}
                    readOnly
                    className="w-full py-3 text-sm bg-transparent font-semibold text-stone-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Email (optional) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.reg_email}</label>
                <div className="flex items-center gap-2.5 bg-stone-50 border-2 border-stone-300 rounded-2xl px-4 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <Mail className="w-5 h-5 text-stone-400 shrink-0" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={t.email_placeholder}
                    className="w-full py-3 text-sm bg-transparent focus:outline-none font-semibold"
                  />
                </div>
                <p className="mt-0.5 text-[11px] text-stone-400">{t.reg_email_hint}</p>
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.reg_language}</label>
                <div className="flex items-center gap-2.5 bg-stone-50 border-2 border-stone-300 rounded-2xl px-4 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <Globe className="w-5 h-5 text-stone-400 shrink-0" />
                  <select
                    value={regLanguage}
                    onChange={(e) => setRegLanguage(e.target.value)}
                    className="w-full py-3 text-sm bg-transparent focus:outline-none font-semibold"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="bn">বাংলা</option>
                    <option value="te">తెలుగు</option>
                  </select>
                </div>
              </div>

              {/* State + District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.reg_state}</label>
                  <select
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full py-3 px-4 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="">{t.reg_state_placeholder}</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.reg_district}</label>
                  <input
                    type="text"
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    placeholder={t.reg_district_placeholder}
                    className="w-full py-3 px-4 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>

              {/* Crop + Soil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.reg_crop}</label>
                  <div className="flex items-center gap-2.5 bg-stone-50 border-2 border-stone-300 rounded-2xl px-4 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                    <Sprout className="w-5 h-5 text-stone-400 shrink-0" />
                    <input
                      type="text"
                      value={regCrop}
                      onChange={(e) => setRegCrop(e.target.value)}
                      placeholder={t.reg_crop_placeholder}
                      className="w-full py-3 text-sm bg-transparent focus:outline-none font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.reg_soil}</label>
                  <select
                    value={regSoil}
                    onChange={(e) => setRegSoil(e.target.value)}
                    className="w-full py-3 px-4 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="">{t.reg_soil_placeholder}</option>
                    {SOIL_TYPES.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-stone-300 text-white font-display font-black text-base px-5 py-3.5 rounded-2xl border-2 border-emerald-800 shadow-[3px_3px_0px_0px_rgba(5,150,105,1)] hover:shadow-[4px_4px_0px_0px_rgba(4,120,87,1)] transition-all cursor-pointer disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mt-1"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {t.creating}</>
                ) : (
                  <><CheckCircle className="w-5 h-5" /> {t.register_btn}</>
                )}
              </button>

              <p className="text-xs text-stone-500 text-center mt-2 font-medium">
                {t.have_account}{" "}
                <button type="button" onClick={() => switchMode("login")} className="text-emerald-700 font-bold hover:underline cursor-pointer">
                  {t.sign_in_link}
                </button>
              </p>
            </form>
          ) : (
            <>
              {/* ── LOGIN (email) ─────────────────────────────────── */}
              {!isRegister && loginMethod === "email" && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">{t.email_label}</label>
                    <div className="flex items-center gap-2.5 bg-stone-50 border-2 border-stone-300 rounded-2xl px-4 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                      <Mail className="w-5 h-5 text-stone-400 shrink-0" />
                      <input
                        type="email"
                        value={emailLogin}
                        onChange={(e) => setEmailLogin(e.target.value)}
                        placeholder={t.email_placeholder}
                        className="w-full py-3 text-sm bg-transparent focus:outline-none font-semibold"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">{t.password_label}</label>
                    <div className="flex items-center gap-2.5 bg-stone-50 border-2 border-stone-300 rounded-2xl px-4 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                      <Lock className="w-5 h-5 text-stone-400 shrink-0" />
                      <input
                        type="password"
                        value={passwordLogin}
                        onChange={(e) => setPasswordLogin(e.target.value)}
                        placeholder={t.password_placeholder}
                        className="w-full py-3 text-sm bg-transparent focus:outline-none font-semibold"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-stone-300 text-white font-display font-black text-base px-5 py-3.5 rounded-2xl border-2 border-emerald-800 shadow-[3px_3px_0px_0px_rgba(5,150,105,1)] transition-all cursor-pointer disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.sign_in_btn}
                  </button>
                  <p className="text-[10px] text-stone-400 text-center font-mono">{t.rsk_note}</p>
                </form>
              )}

              {/* ── PHONE FLOW (login + register) ─────────────────── */}
              {((!isRegister && loginMethod === "phone") || isRegister) && (
                <>
                  {/* Method toggle (login only) */}
                  {!isRegister && (
                    <div className="flex gap-2 mb-6">
                      {(["phone", "email"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => { setLoginMethod(m); setError(""); resetPhoneFlow(); }}
                          className={`flex-1 py-3 text-xs font-bold rounded-2xl border-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            loginMethod === m
                              ? "bg-emerald-50 border-emerald-600 text-emerald-800 shadow-[2px_2px_0px_0px_rgba(5,150,105,1)]"
                              : "bg-white border-stone-200 text-stone-500 hover:border-stone-400"
                          }`}
                        >
                          {m === "phone" ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                          {m === "phone" ? t.login_phone : t.login_email}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Step 1: phone input */}
                  {phoneStep === "input" && (
                    <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">1</span>
                          <label className="text-xs font-bold text-stone-600">{t.otp_step1}</label>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <div className="bg-stone-100 border-2 border-stone-300 rounded-2xl px-4 flex items-center text-sm font-bold text-stone-500 shrink-0">
                            +91
                          </div>
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={phoneLogin}
                            onChange={(e) => setPhoneLogin(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            placeholder={t.mobile_placeholder}
                            className="w-full py-3 px-4 text-base bg-white border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-bold transition"
                            required
                            autoFocus
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-stone-400 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {t.mobile_hint}
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting || phoneLogin.replace(/\D/g, "").length !== 10}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-stone-300 text-white font-display font-black text-base px-5 py-3.5 rounded-2xl border-2 border-emerald-800 shadow-[3px_3px_0px_0px_rgba(5,150,105,1)] hover:shadow-[4px_4px_0px_0px_rgba(4,120,87,1)] transition-all cursor-pointer disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                      >
                        {submitting ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> {t.sending}</>
                        ) : (
                          <><Smartphone className="w-5 h-5" /> {t.get_otp}</>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Step 2: OTP input */}
                  {phoneStep === "otp" && (
                    <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">2</span>
                          <label className="text-xs font-bold text-stone-600">{t.otp_step2}</label>
                        </div>
                        <p className="text-sm text-stone-500 mt-2">
                          {t.otp_sent_to} <strong className="text-stone-900">{otpPhone}</strong>
                        </p>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder={t.otp_placeholder}
                          className="w-full py-3.5 px-4 text-xl tracking-[0.5em] text-center bg-white border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-bold transition mt-2"
                          required
                          maxLength={6}
                          autoFocus
                        />
                        <p className="mt-1.5 text-xs text-stone-400 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {t.otp_hint}
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting || otpCode.length !== 6}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-stone-300 text-white font-display font-black text-base px-5 py-3.5 rounded-2xl border-2 border-emerald-800 shadow-[3px_3px_0px_0px_rgba(5,150,105,1)] hover:shadow-[4px_4px_0px_0px_rgba(4,120,87,1)] transition-all cursor-pointer disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                      >
                        {submitting ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> {t.verifying}</>
                        ) : (
                          <><CheckCircle className="w-5 h-5" /> {t.verify_otp}</>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => { resetPhoneFlow(); }}
                        className="w-full text-xs font-semibold text-stone-400 hover:text-stone-700 transition cursor-pointer underline underline-offset-2"
                      >
                        {t.change_phone}
                      </button>
                    </form>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Footer ──────────────────────────────────────────── */}
          <div className="mt-6 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-center gap-4 text-xs font-medium text-stone-400">
              <Link to="/app" className="hover:text-emerald-700 transition flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {t.guest}
              </Link>
              <span className="text-stone-200">|</span>
              <Link to="/" className="hover:text-stone-600 transition">
                {t.back_home}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recaptcha container (invisible) */}
      <div id="recaptcha-container" />
    </div>
  );
}
