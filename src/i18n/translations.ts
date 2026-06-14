import type { LanguageCode } from "../services/settingsApi";

type TranslationMap = Record<string, string>;

const mr: TranslationMap = {
  Dashboard: "डॅशबोर्ड",
  Agents: "एजंट्स",
  Evals: "मूल्यांकन",
  Settings: "सेटिंग्ज",
  Admin: "प्रशासन",
  "Sign in": "साइन इन",
  "Sign up": "नोंदणी",
  "Sign out": "साइन आउट",
  "Real time": "रिअल टाइम",
  "Civic safety and AQI command center": "नागरी सुरक्षा आणि AQI कमांड सेंटर",
  "Pune civic safety and AQI response platform": "पुणे नागरी सुरक्षा आणि AQI प्रतिसाद प्लॅटफॉर्म",
  "Citizen grievance intake, ward response coordination, evidence review, and city risk monitoring in one civic service.":
    "नागरिक तक्रार नोंदणी, प्रभाग प्रतिसाद, पुरावा तपासणी आणि शहर जोखीम निरीक्षण एका नागरी सेवेत.",
  "Public Services": "सार्वजनिक सेवा",
  "File complaint": "तक्रार नोंदवा",
  "Ward dashboard": "प्रभाग डॅशबोर्ड",
  "System evals": "सिस्टम मूल्यांकन",
  "Service Status": "सेवा स्थिती",
  "Complaint services: protected": "तक्रार सेवा: सुरक्षित",
  "Evidence uploads: access controlled": "पुरावा अपलोड: प्रवेश नियंत्रित",
  "Case records: saved securely": "प्रकरण नोंदी: सुरक्षित जतन",
  "PunaRaksha civic technology platform for Pune. For emergency assistance, contact official emergency services.":
    "पुण्यासाठी PunaRaksha नागरी तंत्रज्ञान प्लॅटफॉर्म. आपत्कालीन मदतीसाठी अधिकृत आपत्कालीन सेवांशी संपर्क साधा.",

  "Pune civic command dashboard": "पुणे नागरी कमांड डॅशबोर्ड",
  "A clear official view of ward risk, public complaints, SLA pressure, and air-quality intervention readiness.":
    "प्रभाग जोखीम, सार्वजनिक तक्रारी, SLA दबाव आणि हवा-गुणवत्ता कृतीची स्पष्ट अधिकृत झलक.",
  "Open cases": "खुली प्रकरणे",
  "Cases still needing civic action": "अजून नागरी कारवाई लागणारी प्रकरणे",
  "SLA breaches": "SLA उल्लंघने",
  "Escalated or overdue cases": "वाढवलेली किंवा मुदत ओलांडलेली प्रकरणे",
  "Highest risk": "सर्वाधिक जोखीम",
  "Avg AQI": "सरासरी AQI",
  "Current citywide ward average": "सध्याचा शहरभर प्रभाग सरासरी",
  "Operational Overview": "कार्यकारी आढावा",
  "Key indicators are shown first. Detailed intelligence is available below for officers and admins.":
    "मुख्य निर्देशांक आधी दाखवले आहेत. अधिकारी आणि प्रशासनासाठी तपशील खाली उपलब्ध आहेत.",
  Stable: "स्थिर",
  Watch: "नजर ठेवा",
  Critical: "गंभीर",
  "Safety Zone Alerts": "सुरक्षा क्षेत्र सूचना",
  "Location-based public safety warning": "स्थानावर आधारित सार्वजनिक सुरक्षा इशारा",
  "Opt-in location monitoring checks nearby Pune safety zones and sends a warning when a user enters a high-risk red zone.":
    "वापरकर्त्याच्या संमतीने स्थान निरीक्षण जवळची पुणे सुरक्षा क्षेत्रे तपासते आणि उच्च-जोखीम लाल क्षेत्रात प्रवेश झाल्यास इशारा पाठवते.",
  "Opt-in monitoring uses real browser GPS location, checks nearby Pune safety zones, and sends a warning when a citizen enters a high-risk red zone.":
    "संमतीनंतर हे खरे ब्राउझर GPS स्थान वापरते, जवळची पुणे सुरक्षा क्षेत्रे तपासते आणि नागरिक उच्च-जोखीम लाल क्षेत्रात गेल्यास इशारा पाठवते.",
  "Start alerts": "सूचना सुरू करा",
  "Stop alerts": "सूचना बंद करा",
  "Test alert": "चाचणी सूचना",
  "Alert state": "सूचना स्थिती",
  "Pune zones": "पुणे क्षेत्रे",
  "Red zones": "लाल क्षेत्रे",
  "Live status": "थेट स्थिती",
  "Current Location Risk": "सध्याची स्थान जोखीम",
  "Nearest zone": "जवळचे क्षेत्र",
  Distance: "अंतर",
  "Risk level": "जोखीम पातळी",
  Position: "स्थान",
  "Customized Warning Message": "वैयक्तिकृत इशारा संदेश",
  "No location checked yet.": "अजून स्थान तपासलेले नाही.",
  "Location monitoring is off": "स्थान निरीक्षण बंद आहे",
  "Ward Risk Command Map": "प्रभाग जोखीम कमांड नकाशा",
  "Main ward priority view. Each tile combines safety, AQI, and complaint severity.":
    "मुख्य प्रभाग प्राधान्य दृश्य. प्रत्येक टाइल सुरक्षा, AQI आणि तक्रार तीव्रता एकत्र करते.",
  "AQI Forecast With Risk Threshold": "जोखीम मर्यादेसह AQI अंदाज",
  "Shows city average, ward peak, and the AQI 200 danger threshold.":
    "शहर सरासरी, प्रभाग उच्चांक आणि AQI 200 धोक्याची मर्यादा दाखवते.",
  "Complaint Funnel": "तक्रार प्रक्रिया प्रवाह",
  "Compact view of the civic response pipeline.": "नागरी प्रतिसाद प्रक्रियेचे संक्षिप्त दृश्य.",
  "SLA Health": "SLA आरोग्य",
  "Healthy queue, urgent queue, breaches, and closures.": "निरोगी रांग, तातडीची रांग, उल्लंघने आणि बंद प्रकरणे.",
  "Detailed Intelligence": "तपशीलवार माहिती",
  "Category heat, response pressure, and recommendations": "श्रेणी उष्णता, प्रतिसाद दबाव आणि शिफारसी",
  "Command Recommendations": "कमांड शिफारसी",

  "Settings and account controls": "सेटिंग्ज आणि खाते नियंत्रण",
  "Multilingual civic service": "बहुभाषिक नागरी सेवा",
  "Manage language, appearance, sign-in safety, alerts, permissions, privacy, help, and suggestions from one official account area.":
    "भाषा, दिसणे, साइन-इन सुरक्षा, सूचना, परवानग्या, गोपनीयता, मदत आणि सूचना एका अधिकृत खाते विभागातून व्यवस्थापित करा.",
  "Save settings": "सेटिंग्ज जतन करा",
  Language: "भाषा",
  Multilingual: "बहुभाषिक",
  "Preferred language": "प्राधान्य भाषा",
  Appearance: "दिसणे",
  Display: "प्रदर्शन",
  Light: "लाइट",
  Dark: "डार्क",
  System: "सिस्टम",
  "Mobile Number and 2FA": "मोबाइल क्रमांक आणि 2FA",
  "Sign-in safety": "साइन-इन सुरक्षा",
  "Mobile number": "मोबाइल क्रमांक",
  "Mobile OTP two-factor authentication": "मोबाइल OTP दोन-स्तरीय प्रमाणीकरण",
  Notifications: "सूचना",
  Alerts: "अलर्ट",
  "SMS alerts": "SMS सूचना",
  "Email updates": "ईमेल अपडेट्स",
  "App notifications": "अ‍ॅप सूचना",
  "Emergency advisories": "आपत्कालीन सूचना",
  "Safety zone alerts": "सुरक्षा क्षेत्र सूचना",
  "Warn me when my device enters a high-risk safety zone.": "माझे डिव्हाइस उच्च-जोखीम सुरक्षा क्षेत्रात गेल्यावर मला सूचना द्या.",
  "Safety and Privacy": "सुरक्षा आणि गोपनीयता",
  Permissions: "परवानग्या",
  "Location access": "स्थान प्रवेश",
  "Camera access": "कॅमेरा प्रवेश",
  Suggestions: "सूचना",
  Feedback: "अभिप्राय",
  "Help Center": "मदत केंद्र",
  Support: "सहाय्य",
  "Delete account": "खाते हटवा",

  "Autonomous response workspace": "स्वयंचलित प्रतिसाद कार्यक्षेत्र",
  "Agentic civic action loop": "एजंटिक नागरी कारवाई प्रवाह",
  "Complaints become classified cases, routed notices, SLA timers, escalations, and AQI interventions.":
    "तक्रारी वर्गीकृत प्रकरणे, पाठवलेल्या नोटिसा, SLA टाइमर, वाढवलेली प्रकरणे आणि AQI कृतींमध्ये बदलतात.",
  "File a Complaint": "तक्रार नोंदवा",
  Complaint: "तक्रार",
  Ward: "प्रभाग",
  "Evidence photo": "पुरावा फोटो",
  "Take or upload image": "फोटो घ्या किंवा अपलोड करा",
  "Submit Complaint": "तक्रार सबमिट करा",
  "Load Sample Complaint": "नमुना तक्रार लोड करा",
  "Active Grievances": "सक्रिय तक्रारी",
  "Scan AQI": "AQI स्कॅन करा",
  "Predictive Interventions": "भाकितात्मक हस्तक्षेप",

  "Welcome back": "परत स्वागत आहे",
  "Create your PunaRaksha account": "तुमचे PunaRaksha खाते तयार करा",
  "Start with verified access": "सत्यापित प्रवेशाने सुरू करा",
  "Continue your work": "तुमचे काम सुरू ठेवा",
  "Full name": "पूर्ण नाव",
  Email: "ईमेल",
  Password: "पासवर्ड",
  Role: "भूमिका",
  Citizen: "नागरिक",
  "Ward officer request": "प्रभाग अधिकारी विनंती",
  "Admin request": "प्रशासन विनंती",
  "Create account": "खाते तयार करा",
  "Please wait": "कृपया थांबा",
  "Already have an account?": "आधीच खाते आहे?",
  "Need an account?": "खाते हवे आहे?",

  "Admin console": "प्रशासन कन्सोल",
  "Users and Roles": "वापरकर्ते आणि भूमिका",
  "Manage citizen, officer, and admin access for PunaRaksha.": "PunaRaksha साठी नागरिक, अधिकारी आणि प्रशासन प्रवेश व्यवस्थापित करा.",
  "Total grievances": "एकूण तक्रारी",
  "Open grievances": "खुल्या तक्रारी",
  Interventions: "हस्तक्षेप",
  Accounts: "खाती",
  Name: "नाव",
  Created: "तयार केले",
};

const hi: TranslationMap = {
  Dashboard: "डैशबोर्ड",
  Agents: "एजेंट",
  Evals: "मूल्यांकन",
  Settings: "सेटिंग्स",
  Admin: "प्रशासन",
  "Sign in": "साइन इन",
  "Sign up": "साइन अप",
  "Sign out": "साइन आउट",
  "Real time": "रीयल टाइम",
  "Civic safety and AQI command center": "नागरिक सुरक्षा और AQI कमांड सेंटर",
  "Pune civic safety and AQI response platform": "पुणे नागरिक सुरक्षा और AQI प्रतिक्रिया प्लेटफॉर्म",
  "Citizen grievance intake, ward response coordination, evidence review, and city risk monitoring in one civic service.":
    "नागरिक शिकायत, वार्ड प्रतिक्रिया, साक्ष्य समीक्षा और शहर जोखिम निगरानी एक नागरिक सेवा में.",
  "Public Services": "सार्वजनिक सेवाएं",
  "File complaint": "शिकायत दर्ज करें",
  "Ward dashboard": "वार्ड डैशबोर्ड",
  "System evals": "सिस्टम मूल्यांकन",
  "Service Status": "सेवा स्थिति",
  "Complaint services: protected": "शिकायत सेवाएं: सुरक्षित",
  "Evidence uploads: access controlled": "साक्ष्य अपलोड: प्रवेश नियंत्रित",
  "Case records: saved securely": "केस रिकॉर्ड: सुरक्षित रूप से सहेजे गए",
  "PunaRaksha civic technology platform for Pune. For emergency assistance, contact official emergency services.":
    "पुणे के लिए PunaRaksha नागरिक तकनीक प्लेटफॉर्म. आपातकालीन सहायता के लिए आधिकारिक आपातकालीन सेवाओं से संपर्क करें.",

  "Pune civic command dashboard": "पुणे नागरिक कमांड डैशबोर्ड",
  "A clear official view of ward risk, public complaints, SLA pressure, and air-quality intervention readiness.":
    "वार्ड जोखिम, सार्वजनिक शिकायतों, SLA दबाव और वायु-गुणवत्ता कार्रवाई की स्पष्ट आधिकारिक झलक.",
  "Open cases": "खुले केस",
  "Cases still needing civic action": "जिन केसों पर अभी नागरिक कार्रवाई चाहिए",
  "SLA breaches": "SLA उल्लंघन",
  "Escalated or overdue cases": "बढ़ाए गए या समय से बाहर केस",
  "Highest risk": "सबसे अधिक जोखिम",
  "Avg AQI": "औसत AQI",
  "Current citywide ward average": "वर्तमान शहरव्यापी वार्ड औसत",
  "Operational Overview": "कार्य संचालन सारांश",
  "Key indicators are shown first. Detailed intelligence is available below for officers and admins.":
    "मुख्य संकेतक पहले दिखाए गए हैं. अधिकारियों और प्रशासन के लिए विस्तृत जानकारी नीचे उपलब्ध है.",
  Stable: "स्थिर",
  Watch: "निगरानी",
  Critical: "गंभीर",
  "Safety Zone Alerts": "सुरक्षा क्षेत्र अलर्ट",
  "Location-based public safety warning": "स्थान-आधारित सार्वजनिक सुरक्षा चेतावनी",
  "Opt-in location monitoring checks nearby Pune safety zones and sends a warning when a user enters a high-risk red zone.":
    "उपयोगकर्ता की अनुमति से स्थान निगरानी पास के पुणे सुरक्षा क्षेत्रों की जांच करती है और उच्च-जोखिम लाल क्षेत्र में प्रवेश पर चेतावनी भेजती है.",
  "Opt-in monitoring uses real browser GPS location, checks nearby Pune safety zones, and sends a warning when a citizen enters a high-risk red zone.":
    "अनुमति के बाद यह असली ब्राउज़र GPS स्थान का उपयोग करता है, पास के पुणे सुरक्षा क्षेत्रों की जांच करता है और नागरिक के उच्च-जोखिम लाल क्षेत्र में जाने पर चेतावनी भेजता है.",
  "Start alerts": "अलर्ट शुरू करें",
  "Stop alerts": "अलर्ट बंद करें",
  "Test alert": "टेस्ट अलर्ट",
  "Alert state": "अलर्ट स्थिति",
  "Pune zones": "पुणे क्षेत्र",
  "Red zones": "लाल क्षेत्र",
  "Live status": "लाइव स्थिति",
  "Current Location Risk": "वर्तमान स्थान जोखिम",
  "Nearest zone": "निकटतम क्षेत्र",
  Distance: "दूरी",
  "Risk level": "जोखिम स्तर",
  Position: "स्थान",
  "Customized Warning Message": "अनुकूलित चेतावनी संदेश",
  "No location checked yet.": "अभी स्थान जांचा नहीं गया.",
  "Location monitoring is off": "स्थान निगरानी बंद है",
  "Ward Risk Command Map": "वार्ड जोखिम कमांड मानचित्र",
  "Main ward priority view. Each tile combines safety, AQI, and complaint severity.":
    "मुख्य वार्ड प्राथमिकता दृश्य. प्रत्येक टाइल सुरक्षा, AQI और शिकायत गंभीरता को जोड़ती है.",
  "AQI Forecast With Risk Threshold": "जोखिम सीमा के साथ AQI पूर्वानुमान",
  "Shows city average, ward peak, and the AQI 200 danger threshold.":
    "शहर औसत, वार्ड उच्चांक और AQI 200 खतरे की सीमा दिखाता है.",
  "Complaint Funnel": "शिकायत प्रक्रिया प्रवाह",
  "Compact view of the civic response pipeline.": "नागरिक प्रतिक्रिया प्रक्रिया का संक्षिप्त दृश्य.",
  "SLA Health": "SLA स्थिति",
  "Healthy queue, urgent queue, breaches, and closures.": "स्वस्थ कतार, तत्काल कतार, उल्लंघन और बंद केस.",
  "Detailed Intelligence": "विस्तृत जानकारी",
  "Category heat, response pressure, and recommendations": "श्रेणी हीट, प्रतिक्रिया दबाव और सिफारिशें",
  "Command Recommendations": "कमांड सिफारिशें",

  "Settings and account controls": "सेटिंग्स और खाता नियंत्रण",
  "Multilingual civic service": "बहुभाषी नागरिक सेवा",
  "Manage language, appearance, sign-in safety, alerts, permissions, privacy, help, and suggestions from one official account area.":
    "भाषा, रूप, साइन-इन सुरक्षा, अलर्ट, अनुमतियां, गोपनीयता, सहायता और सुझाव एक आधिकारिक खाता क्षेत्र से प्रबंधित करें.",
  "Save settings": "सेटिंग्स सहेजें",
  Language: "भाषा",
  Multilingual: "बहुभाषी",
  "Preferred language": "पसंदीदा भाषा",
  Appearance: "रूप",
  Display: "डिस्प्ले",
  Light: "लाइट",
  Dark: "डार्क",
  System: "सिस्टम",
  "Mobile Number and 2FA": "मोबाइल नंबर और 2FA",
  "Sign-in safety": "साइन-इन सुरक्षा",
  "Mobile number": "मोबाइल नंबर",
  "Mobile OTP two-factor authentication": "मोबाइल OTP दो-स्तरीय प्रमाणीकरण",
  Notifications: "सूचनाएं",
  Alerts: "अलर्ट",
  "SMS alerts": "SMS अलर्ट",
  "Email updates": "ईमेल अपडेट",
  "App notifications": "ऐप सूचनाएं",
  "Emergency advisories": "आपातकालीन सलाह",
  "Safety zone alerts": "सुरक्षा क्षेत्र अलर्ट",
  "Warn me when my device enters a high-risk safety zone.": "जब मेरा डिवाइस उच्च-जोखिम सुरक्षा क्षेत्र में जाए तो मुझे चेतावनी दें.",
  "Safety and Privacy": "सुरक्षा और गोपनीयता",
  Permissions: "अनुमतियां",
  "Location access": "स्थान अनुमति",
  "Camera access": "कैमरा अनुमति",
  Suggestions: "सुझाव",
  Feedback: "प्रतिक्रिया",
  "Help Center": "सहायता केंद्र",
  Support: "सहायता",
  "Delete account": "खाता हटाएं",

  "Autonomous response workspace": "स्वचालित प्रतिक्रिया कार्यक्षेत्र",
  "Agentic civic action loop": "एजेंटिक नागरिक कार्रवाई प्रवाह",
  "Complaints become classified cases, routed notices, SLA timers, escalations, and AQI interventions.":
    "शिकायतें वर्गीकृत केस, भेजे गए नोटिस, SLA टाइमर, बढ़ाए गए केस और AQI कार्रवाइयों में बदलती हैं.",
  "File a Complaint": "शिकायत दर्ज करें",
  Complaint: "शिकायत",
  Ward: "वार्ड",
  "Evidence photo": "साक्ष्य फोटो",
  "Take or upload image": "फोटो लें या अपलोड करें",
  "Submit Complaint": "शिकायत जमा करें",
  "Load Sample Complaint": "नमूना शिकायत लोड करें",
  "Active Grievances": "सक्रिय शिकायतें",
  "Scan AQI": "AQI स्कैन करें",
  "Predictive Interventions": "पूर्वानुमानित हस्तक्षेप",

  "Welcome back": "वापस स्वागत है",
  "Create your PunaRaksha account": "अपना PunaRaksha खाता बनाएं",
  "Start with verified access": "सत्यापित प्रवेश से शुरू करें",
  "Continue your work": "अपना काम जारी रखें",
  "Full name": "पूरा नाम",
  Email: "ईमेल",
  Password: "पासवर्ड",
  Role: "भूमिका",
  Citizen: "नागरिक",
  "Ward officer request": "वार्ड अधिकारी अनुरोध",
  "Admin request": "प्रशासन अनुरोध",
  "Create account": "खाता बनाएं",
  "Please wait": "कृपया प्रतीक्षा करें",
  "Already have an account?": "पहले से खाता है?",
  "Need an account?": "खाता चाहिए?",

  "Admin console": "प्रशासन कंसोल",
  "Users and Roles": "उपयोगकर्ता और भूमिकाएं",
  "Manage citizen, officer, and admin access for PunaRaksha.": "PunaRaksha के लिए नागरिक, अधिकारी और प्रशासन प्रवेश प्रबंधित करें.",
  "Total grievances": "कुल शिकायतें",
  "Open grievances": "खुली शिकायतें",
  Interventions: "हस्तक्षेप",
  Accounts: "खाते",
  Name: "नाम",
  Created: "बनाया गया",
};

const dictionaries: Record<LanguageCode, TranslationMap> = {
  en: {},
  mr,
  hi,
};

const dynamicRules: Array<{
  pattern: RegExp;
  replace: Record<Exclude<LanguageCode, "en">, (...values: string[]) => string>;
}> = [
  {
    pattern: /^(\d+) mapped$/,
    replace: {
      mr: (count) => `${count} नकाशात`,
      hi: (count) => `${count} मानचित्रित`,
    },
  },
  {
    pattern: /^(\d+) wards$/,
    replace: {
      mr: (count) => `${count} प्रभाग`,
      hi: (count) => `${count} वार्ड`,
    },
  },
  {
    pattern: /^(\d+) cases$/,
    replace: {
      mr: (count) => `${count} प्रकरणे`,
      hi: (count) => `${count} केस`,
    },
  },
  {
    pattern: /^(\d+) cases in this demo session$/,
    replace: {
      mr: (count) => `या सत्रात ${count} प्रकरणे`,
      hi: (count) => `इस सत्र में ${count} केस`,
    },
  },
  {
    pattern: /^(.+) highest risk$/,
    replace: {
      mr: (ward) => `${ward} सर्वाधिक जोखीम`,
      hi: (ward) => `${ward} सबसे अधिक जोखिम`,
    },
  },
];

export function translateText(text: string, language: LanguageCode) {
  if (language === "en") {
    return text;
  }

  const dictionary = dictionaries[language];
  const direct = dictionary[text];
  if (direct) {
    return direct;
  }

  for (const rule of dynamicRules) {
    const match = text.match(rule.pattern);
    if (match) {
      return rule.replace[language](...match.slice(1));
    }
  }

  return text;
}
