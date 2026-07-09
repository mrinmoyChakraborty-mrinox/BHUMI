import { Scheme, DiseaseSample } from "./types";

export const GOVERNMENT_SCHEMES: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    nameLocal: {
      hi: "पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)",
      bn: "পিএম-কিষাণ (প্রধানমন্ত্রী কিষাণ সম্মান নিধি)",
      te: "పిఎం-కిసాన్ (ప్రధాన్ మంత్రి కిసాన్ సమ్మాన్ నిధి)"
    },
    ministry: "Ministry of Agriculture and Farmers Welfare",
    tag: "Direct Benefit",
    benefits: "Direct income support of ₹6,000 per year in three equal installments of ₹2,000 directly into the bank accounts of small and marginal farmer families.",
    benefitsLocal: {
      hi: "छोटे और सीमांत किसान परिवारों के बैंक खातों में सीधे ₹6,000 प्रति वर्ष की प्रत्यक्ष आय सहायता (₹2,000 की तीन समान किस्तों में)।",
      bn: "ক্ষুদ্র ও প্রান্তিক কৃষক পরিবারের ব্যাঙ্ক অ্যাকাউন্টে সরাসরি প্রতি বছর ₹৬,০০০ আয় সহায়তা (₹২,০০০ এর তিনটি সমান কিস্তিতে)।",
      te: "చిన్న మరియు అంచుల రైతు కుటుంబాల బ్యాంక్ ఖాతాలకు నేరుగా సంవత్సరానికి ₹6,000 ఆదాయ మద్దతు (₹2,000 మూడు సమాన వాయ్పులలో)."
    },
    eligibility: "All landholding farmers' families who have cultivable landholding in their names (subject to certain exclusion criteria like high-income individuals and taxpayers).",
    eligibilityLocal: {
      hi: "सभी भूमिधारक किसान परिवार जिनके नाम पर कृषि योग्य भूमि है (उच्च आय वाले व्यक्तियों और करदाताओं को छोड़कर)।",
      bn: "সমস্ত জমিধারী কৃষক পরি঵ার যাদের নামে চাষযোগ্য জমি রয়েছে (উচ্চ আয়ের ব্যক্তি এবং করদাতাদের বাদ দিয়ে)।",
      te: "వారి పేర్లపై సాగు భూమి ఉన్న అన్ని భూయజమాని రైతు కుటుంబాలు (అధిక ఆదాయం ఉన్న వ్యక్తులు మరియు పన్ను చెల్లింపుదారులను మినహాయిస్తూ)."
    },
    howToApply: "Register online on PM-KISAN portal (pmkisan.gov.in) using Aadhaar card, land records, and bank account, or visit nearest Common Service Center (CSC).",
    link: "https://pmkisan.gov.in"
  },
  {
    id: "pm-fby",
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    nameLocal: {
      hi: "प्रधानमंत्री फसल बीमा योजना (PMFBY)",
      bn: "প্রধানমন্ত্রী ফসল বিমা যোজনা (PMFBY)",
      te: "ప్రధాన్ మంత్రి ఫసల్ బీమా యోజన (PMFBY)"
    },
    ministry: "Ministry of Agriculture and Farmers Welfare",
    tag: "Insurance",
    benefits: "Comprehensive insurance coverage against crop failure due to non-preventable natural risks (drought, flood, pests, storms). Premium is heavily subsidized: farmers pay only 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops.",
    benefitsLocal: {
      hi: "अपरिहार्य प्राकृतिक जोखिमों (सूखा, बाढ़, कीट, तूफान) के कारण फसल खराब होने पर व्यापक बीमा सुरक्षा। प्रीमियम अत्यधिक सब्सिडी वाला है: खरीफ के लिए 2%, रबी के लिए 1.5% और वाणिज्यिक फसलों के लिए 5%।",
      bn: "প্রতিরোধ অযোগ্য প্রাকৃতিক ঝুঁকি (খরা, বন্যা, কীটপতঙ্গ, ঝড়) এর কারণে ফসল নষ্ট হওয়ার বিরুদ্ধে ব্যাপক বিমা কভারেজ। প্রিমিয়ামে ব্যাপক ভর্তুকি দেওয়া হয়: খরিফ ফসলের জন্য ২%, রবি ফসলের জন্য ১.৫% এবং বাণিজ্যিক ফসলের জন্য ৫%।",
      te: "నివారించలేని సహజ ప్రమాదాల (వర్షాభావం, వరదలు, పురుగులు, తుఫానులు) వల్ల పంట వైఫల్యం నుండి సమగ్ర బీమా కవరేజ్. ప్రీమియం భారీగా సబ్సిడీ చేయబడుతుంది: ఖరీఫ్ పంటలకు 2%, రబీ పంటలకు 1.5% మరియు వాణిజ్య/తోటల పంటలకు 5%."
    },
    eligibility: "All farmers, including tenant farmers and sharecroppers, growing the notified crops in the notified areas are eligible.",
    eligibilityLocal: {
      hi: "अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले बटाईदार और काश्तकार किसानों सहित सभी किसान पात्र हैं।",
      bn: "বিজ্ঞপ্তিভুক্ত এলাকায় বিজ্ঞপ্তিভুক্ত ফসল চাষকারী ভাগচাষী এবং ভাড়াটে কৃষক সহ সমস্ত কৃষক যোগ্য।",
      te: "నోటిఫై చేయబడిన ప్రాంతాల్లో నోటిఫై చేయబడిన పంటలు సాగు చేసే అద్దెదారులు మరియు భాగస్వామ్య రైతులతో సహా అన్ని రైతులు అర్హులు."
    },
    howToApply: "Enroll through banks, cooperative societies, authorized insurance agents, or directly online on PMFBY portal (pmfby.gov.in).",
    link: "https://pmfby.gov.in"
  },
  {
    id: "kcc",
    name: "KCC (Kisan Credit Card)",
    nameLocal: {
      hi: "किसान क्रेडिट कार्ड (KCC)",
      bn: "কিষাণ ক্রেডিট কার্ড (KCC)",
      te: "కిసాన్ క్రెడిట్ కార్డ్ (KCC)"
    },
    ministry: "Reserve Bank of India & NABARD",
    tag: "Credit",
    benefits: "Provides timely, low-interest credit (loans) for crop cultivation, post-harvest expenses, and farm maintenance. Effectively offers interest rates as low as 4% per annum upon prompt repayment.",
    benefitsLocal: {
      hi: "फसल खेती, कटाई के बाद के खर्चों और कृषि रखरखाव के लिए समय पर, कम ब्याज पर ऋण। समय पर पुनर्भुगतान करने पर प्रति वर्ष 4% जैसी न्यूनतम ब्याज दर।",
      bn: "ফসল চাষ, ফসল কাটার পরবর্তী খরচ এবং খামার রক্ষণাবেক্ষণের জন্য সময়মতো, স্বল্প সুদে ঋণ। সময়মতো ঋণ পরিশোধ করলে বার্ষিক সর্বনিম্ন ৪% সুদে ঋণ পাওয়া যায়।",
      te: "పంట సాగు, కోత తర్వాత ఖర్చులు మరియు వ్యవసాయ నిర్వహణ కొరకు సకాలంలో, తక్కువ వడ్డీ రుణం (క్రెడిట్). సకాలంలో చెల్లింపు చేస్తే సంవత్సరానికి 4% వరకు వడ్డీ రేటు లభిస్తుంది."
    },
    eligibility: "Owner-cultivators, tenant farmers, sharecroppers, and self-help groups of farmers.",
    eligibilityLocal: {
      hi: "मालिक-काश्तकार, किरायेदार किसान, बटाईदार और किसानों के स्वयं सहायता समूह।",
      bn: "মালিক-চাষী, ভাড়াটে কৃষক, ভাগচাষী এবং কৃষকদের স্বনির্ভর গোষ্ঠী।",
      te: "యజమాని-సాగుదారులు, అద్దెదారు రైతులు, భాగస్వామ్య రైతులు మరియు రైతుల స్వయం సహాయక బృందాలు."
    },
    howToApply: "Apply at any rural, cooperative, or nationalized bank. Requires land record papers, identity proof, and photograph.",
    link: "https://www.nabard.org"
  },
  {
    id: "pm-kmy",
    name: "PM-KMY (Pradhan Mantri Kisan Maandhan Yojana)",
    nameLocal: {
      hi: "किसान मानधन योजना (PM-KMY)",
      bn: "কিষাণ মানধন যোজনা (PM-KMY)",
      te: "పిఎం-కెఎంవై (ప్రధాన్ మంత్రి కిసాన్ మాన్ధన్ యోజన)"
    },
    ministry: "Ministry of Agriculture and Farmers Welfare",
    tag: "Subsidy",
    benefits: "A voluntary and contributory pension scheme offering a assured monthly pension of ₹3,000 to small and marginal farmers upon reaching 60 years of age.",
    benefitsLocal: {
      hi: "एक स्वैच्छिक और अंशदायी पेंशन योजना जो 60 वर्ष की आयु प्राप्त करने पर छोटे और सीमांत किसानों को ₹3,000 की सुनिश्चित मासिक पेंशन प्रदान करती है।",
      bn: "একটি স্বেচ্ছাসেবী এবং সহযোগিতামূলক পেনশন স্কিম যা ৬০ বছর বয়স পূর্ণ হলে ক্ষুদ্র ও প্রান্তিক কৃষকদের প্রতি মাসে ₹৩,০০০ নিশ্চিত পেনশন প্রদান করে।",
      te: "60 సంవత్సరాల వయస్సు వచ్చిన తర్వాత చిన్న మరియు అంచుల రైతులకు నెలకు ₹3,000 హామీ పింఛనును అందించే స్వచ్ఛంద, సహాయక పింఛను పథకం."
    },
    eligibility: "Small and marginal farmers aged between 18 and 40 years, with cultivable land up to 2 hectares.",
    eligibilityLocal: {
      hi: "18 से 40 वर्ष की आयु के छोटे और सीमांत किसान, जिनके पास 2 हेक्टेयर तक कृषि योग्य भूमि है।",
      bn: "১৮ থেকে ৪০ বছর বয়সী ক্ষুদ্র ও প্রান্তিক কৃষক, যাদের চাষযোগ্য জমি ২ হেক্টর পর্যন্ত রয়েছে।",
      te: "18 నుండి 40 సంవత్సరాల మధ్య వయస్సు ఉన్న చిన్న మరియు అంచుల రైతులు, వారి వద్ద 2 హెక్టార్ల వరకు సాగు భూమి ఉంటే అర్హులు."
    },
    howToApply: "Register at the nearest Common Service Centre (CSC) or self-enroll online at maandhan.in. Requires Aadhaar and bank details.",
    link: "https://maandhan.in"
  }
];

// Sample crop images for disease detection demo
export const DISEASE_SAMPLES: DiseaseSample[] = [
  {
    id: "rice-blast",
    name: "Rice Blast (Magnaporthe oryzae)",
    cropName: "Rice",
    symptoms: "Spindle-shaped, diamond lesions with ash-colored centers and dark brown margins on the leaves. Severe cases cause stem nodule rot and head collapse.",
    mimeType: "image/jpeg",
    image: "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAEAAQADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJcovK1grNDR4kW5OkoIURUZUVDlistEBDCRURkxSWhcYGl4cYG6Gg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebnGlqc3R1ndnd4eXpd3g8fX1f393h5+v/gQCv/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5jpndnd4eXpd3g8fX1f393h5+v/aAAwDAQACEEMAPIAP/9k="
  },
  {
    id: "tomato-late-blight",
    name: "Tomato Late Blight (Phytophthora infestans)",
    cropName: "Tomato",
    symptoms: "Water-soaked, dark green-to-black lesions on leaves, often expanding rapidly in humid conditions, accompanied by white, downy fungal-like growth on the leaf underside.",
    mimeType: "image/jpeg",
    image: "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAEAAQADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJcovK1grNDR4kW5OkoIURUZUVDlistEBDCRURkxSWhcYGl4cYG6Gg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebnGlqc3R1ndnd4eXpd3g8fX1f393h5+v/gQCv/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5jpndnd4eXpd3g8fX1f393h5+v/aAAwDAQACEEMAPIAP/9k="
  },
  {
    id: "wheat-rust",
    name: "Wheat Stem Rust (Puccinia graminis)",
    cropName: "Wheat",
    symptoms: "Elongated, brick-red to brownish pustules on leaf sheaths, stems, and leaves. Ruptured pustules release powdery spores that disrupt water flow, leading to lodging and shriveled grains.",
    mimeType: "image/jpeg",
    image: "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAEAAQADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJcovK1grNDR4kW5OkoIURUZUVDlistEBDCRURkxSWhcYGl4cYG6Gg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebnGlqc3R1ndnd4eXpd3g8fX1f393h5+v/gQCv/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5jpndnd4eXpd3g8fX1f393h5+v/aAAwDAQACEEMAPIAP/9k="
  }
];


