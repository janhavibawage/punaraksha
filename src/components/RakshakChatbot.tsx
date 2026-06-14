import { FormEvent, useMemo, useState } from "react";
import { Bot, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { safetyZones } from "../data/safetyZones";
import { useAuthStore } from "../store/useAuthStore";
import { useGrievanceStore } from "../store/useGrievanceStore";
import { useSettingsStore } from "../store/useSettingsStore";

interface ChatMessage {
  id: string;
  sender: "rakshak" | "user";
  text: string;
}

const quickPrompts = {
  en: ["How do I file a complaint?", "Check case status", "Explain safety alerts", "Officer next steps"],
  mr: ["तक्रार कशी नोंदवू?", "प्रकरण स्थिती तपासा", "सुरक्षा सूचना समजवा", "अधिकारी पुढील पावले"],
  hi: ["शिकायत कैसे दर्ज करूं?", "केस स्थिति देखें", "सुरक्षा अलर्ट समझाएं", "अधिकारी अगले कदम"],
};

export function RakshakChatbot() {
  const user = useAuthStore((state) => state.user);
  const language = useSettingsStore((state) => state.settings.language);
  const grievances = useGrievanceStore((state) => state.grievances);
  const interventions = useGrievanceStore((state) => state.interventions);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: crypto.randomUUID(),
      sender: "rakshak",
      text: introFor("en", undefined),
    },
  ]);

  const currentPrompts = quickPrompts[language];
  const role = user?.role ?? "guest";
  const unresolved = grievances.filter((item) => item.status !== "resolved").length;
  const escalated = grievances.filter((item) => item.status === "escalated").length;

  const headerText = useMemo(() => {
    if (language === "mr") {
      return "तुमचा PunaRaksha सहाय्यक";
    }
    if (language === "hi") {
      return "आपका PunaRaksha सहायक";
    }
    return "Your PunaRaksha assistant";
  }, [language]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(input);
  }

  function submitMessage(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    const response = buildRakshakResponse({
      input: trimmed,
      language,
      role,
      unresolved,
      escalated,
      interventions: interventions.length,
      safetyZones: safetyZones.length,
      redZones: safetyZones.filter((zone) => zone.level === "red").length,
    });

    setMessages((items) => [
      ...items,
      { id: crypto.randomUUID(), sender: "user", text: trimmed },
      { id: crypto.randomUUID(), sender: "rakshak", text: response },
    ]);
    setInput("");
    setOpen(true);
  }

  return (
    <div className="fixed bottom-5 right-4 z-50 sm:right-6" data-no-translate>
      {open ? (
        <section className="mb-3 flex h-[560px] max-h-[calc(100vh-110px)] w-[min(calc(100vw-2rem),390px)] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-3 bg-slate-950 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-civic">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Rakshak</h2>
                <p className="text-xs text-slate-300">{headerText}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label="Close Rakshak"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={[
                  "max-w-[88%] rounded-lg px-3 py-2 text-sm leading-6",
                  message.sender === "rakshak"
                    ? "bg-white text-slate-700 shadow-sm"
                    : "ml-auto bg-civic text-white",
                ].join(" ")}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {currentPrompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => submitMessage(prompt)}
                  className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-civic hover:text-civic"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={language === "mr" ? "Rakshak ला विचारा..." : language === "hi" ? "Rakshak से पूछें..." : "Ask Rakshak..."}
                className="min-h-11 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-civic focus:bg-white focus:ring-4 focus:ring-teal-100"
              />
              <button
                type="submit"
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-civic text-white hover:bg-teal-800"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setMessages((items) => {
            if (items.length === 1 && items[0].text === introFor("en", undefined)) {
              return [{ ...items[0], text: introFor(language, role) }];
            }
            return items;
          });
        }}
        className="ml-auto flex min-h-14 items-center gap-3 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-2xl transition hover:bg-civic"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-civic">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          Rakshak
          <span className="block text-xs font-medium text-slate-300">AI help</span>
        </span>
      </button>
    </div>
  );
}

function buildRakshakResponse({
  input,
  language,
  role,
  unresolved,
  escalated,
  interventions,
  safetyZones,
  redZones,
}: {
  input: string;
  language: "en" | "mr" | "hi";
  role: string;
  unresolved: number;
  escalated: number;
  interventions: number;
  safetyZones: number;
  redZones: number;
}) {
  const text = input.toLowerCase();
  const isAuthority = role === "officer" || role === "admin";

  if (text.includes("complaint") || text.includes("तक्रार") || text.includes("शिकायत")) {
    return localize(language, {
      en: "To file a complaint, open Agents, write the issue, choose the ward, add an evidence photo if available, then submit. PunaRaksha will classify, route, and set the SLA automatically.",
      mr: "तक्रार नोंदवण्यासाठी Agents उघडा, समस्या लिहा, प्रभाग निवडा, पुरावा फोटो असल्यास जोडा आणि सबमिट करा. PunaRaksha वर्गीकरण, रूटिंग आणि SLA आपोआप सेट करेल.",
      hi: "शिकायत दर्ज करने के लिए Agents खोलें, समस्या लिखें, वार्ड चुनें, उपलब्ध हो तो साक्ष्य फोटो जोड़ें और सबमिट करें. PunaRaksha वर्गीकरण, रूटिंग और SLA अपने आप सेट करेगा.",
    });
  }

  if (text.includes("status") || text.includes("case") || text.includes("स्थिती") || text.includes("स्थिति")) {
    return localize(language, {
      en: `Current view shows ${unresolved} open case(s), ${escalated} escalated case(s), and ${interventions} active intervention plan(s). Use Agents for case details and Dashboard for ward-level risk.`,
      mr: `सध्या ${unresolved} खुली प्रकरणे, ${escalated} वाढवलेली प्रकरणे आणि ${interventions} सक्रिय हस्तक्षेप योजना दिसत आहेत. तपशीलासाठी Agents आणि प्रभाग जोखमीसाठी Dashboard वापरा.`,
      hi: `अभी ${unresolved} खुले केस, ${escalated} बढ़ाए गए केस और ${interventions} सक्रिय हस्तक्षेप योजनाएं दिख रही हैं. विवरण के लिए Agents और वार्ड जोखिम के लिए Dashboard इस्तेमाल करें.`,
    });
  }

  if (text.includes("safety") || text.includes("zone") || text.includes("location") || text.includes("gps") || text.includes("सुरक्षा")) {
    if (isAuthority) {
      return localize(language, {
        en: "Live GPS safety alerts are citizen-only for privacy. Officers and admins can still review ward risk, complaint patterns, and interventions from the dashboard.",
        mr: "गोपनीयतेसाठी लाईव्ह GPS सुरक्षा सूचना फक्त नागरिकांसाठी आहेत. अधिकारी आणि प्रशासन डॅशबोर्डवर प्रभाग जोखीम, तक्रार नमुने आणि हस्तक्षेप पाहू शकतात.",
        hi: "गोपनीयता के लिए लाइव GPS सुरक्षा अलर्ट केवल नागरिकों के लिए हैं. अधिकारी और प्रशासन डैशबोर्ड पर वार्ड जोखिम, शिकायत पैटर्न और हस्तक्षेप देख सकते हैं.",
      });
    }

    return localize(language, {
      en: `Safety alerts use real browser GPS permission. PunaRaksha has ${safetyZones} mapped Pune safety zones, including ${redZones} red zones. Start alerts from the dashboard and use Test alert for demo.`,
      mr: `सुरक्षा सूचना खऱ्या ब्राउझर GPS परवानगीवर चालतात. PunaRaksha मध्ये ${safetyZones} पुणे सुरक्षा क्षेत्रे आहेत, त्यात ${redZones} लाल क्षेत्रे आहेत. डॅशबोर्डवरून सूचना सुरू करा आणि डेमोसाठी Test alert वापरा.`,
      hi: `सुरक्षा अलर्ट असली ब्राउज़र GPS अनुमति पर चलते हैं. PunaRaksha में ${safetyZones} पुणे सुरक्षा क्षेत्र हैं, जिनमें ${redZones} लाल क्षेत्र हैं. डैशबोर्ड से अलर्ट शुरू करें और डेमो के लिए Test alert इस्तेमाल करें.`,
    });
  }

  if (text.includes("officer") || text.includes("admin") || text.includes("authority") || text.includes("अधिकारी")) {
    return localize(language, {
      en: "For authority workflow: check Dashboard risk first, open Agents for active grievances, scan AQI, resolve completed cases, and use Admin to manage roles if you are an admin.",
      mr: "अधिकारी कार्यप्रवाह: आधी Dashboard वर जोखीम पाहा, सक्रिय तक्रारींसाठी Agents उघडा, AQI स्कॅन करा, पूर्ण प्रकरणे सोडवा आणि admin असल्यास roles व्यवस्थापित करा.",
      hi: "अधिकारी कार्यप्रवाह: पहले Dashboard पर जोखिम देखें, सक्रिय शिकायतों के लिए Agents खोलें, AQI स्कैन करें, पूर्ण केस हल करें और admin होने पर roles प्रबंधित करें.",
    });
  }

  return localize(language, {
    en: "I can help with complaints, case status, safety alerts, evidence checks, dashboard meaning, and officer workflows. Tell me what you want to do next.",
    mr: "मी तक्रारी, प्रकरण स्थिती, सुरक्षा सूचना, पुरावा तपासणी, डॅशबोर्ड अर्थ आणि अधिकारी कार्यप्रवाहात मदत करू शकतो. पुढे काय करायचे ते सांगा.",
    hi: "मैं शिकायत, केस स्थिति, सुरक्षा अलर्ट, साक्ष्य जांच, डैशबोर्ड समझ और अधिकारी कार्यप्रवाह में मदद कर सकता हूं. आगे क्या करना है बताएं.",
  });
}

function introFor(language: "en" | "mr" | "hi", role: string | undefined) {
  return localize(language, {
    en: `Namaste, I am Rakshak. I can help ${role === "officer" || role === "admin" ? "your authority team" : "you"} use PunaRaksha faster.`,
    mr: `नमस्कार, मी Rakshak आहे. मी ${role === "officer" || role === "admin" ? "तुमच्या अधिकारी टीमला" : "तुम्हाला"} PunaRaksha जलद वापरायला मदत करतो.`,
    hi: `नमस्ते, मैं Rakshak हूं. मैं ${role === "officer" || role === "admin" ? "आपकी अधिकारी टीम" : "आपको"} PunaRaksha तेज़ी से इस्तेमाल करने में मदद करता हूं.`,
  });
}

function localize(language: "en" | "mr" | "hi", values: Record<"en" | "mr" | "hi", string>) {
  return values[language] ?? values.en;
}
