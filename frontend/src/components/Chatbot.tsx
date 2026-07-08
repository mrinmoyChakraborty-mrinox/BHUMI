import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, RefreshCw, Sparkles, Wifi, WifiOff } from "lucide-react";
import { getWsUrl } from "../config/env";
import { Message, Language } from "../types";

interface ChatbotProps {
  language: Language;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1">
      <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

export default function Chatbot({ language }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      const ws = new WebSocket(getWsUrl());
      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => {
        setIsConnected(false);
        setIsTyping(false);
        reconnectTimer.current = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "typing") {
            setIsTyping(true);
          } else if (data.type === "response") {
            setIsTyping(false);
            const modelMsg: Message = {
              id: Math.random().toString(),
              role: "model",
              text: data.text,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, modelMsg]);
            if (autoSpeak) speakText(data.text);
          } else if (data.type === "error") {
            setIsTyping(false);
            alert(data.message || "Chatbot error");
          }
        } catch {}
      };
      wsRef.current = ws;
    } catch {}
  }, [autoSpeak]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === "hi" ? "hi-IN" : language === "bn" ? "bn-IN" : language === "te" ? "te-IN" : "en-IN";
      rec.onstart = () => setIsListening(true);
      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) setInput(transcript);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      setRecognition(rec);
    }
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const greetings = {
      en: "Namaste! I am your Krishi AI Assistant. How can I help you with your crop cycle, soil health, weather, or government schemes today?",
      hi: "नमस्ते! मैं आपका कृषि एआई सहायक हूँ। आज मैं आपकी फसल चक्र, मिट्टी के स्वास्थ्य, मौसम या सरकारी योजनाओं में किस प्रकार मदद कर सकता हूँ?",
      bn: "নমস্কার! আমি আপনার কৃষি এআই সহকারী। আজ আমি আপনার ফসল চক্র, মাটির স্বাস্থ্য, আবহাওয়া বা সরকারী প্রকল্পগুলিতে কীভাবে সহায়তা করতে পারি?",
      te: "నమస్కారం! నేను మీ కృషి AI అసిస్టెంట్. మీ పంట చక్రం, నేల ఆరోగ్యం, వాతావరణం లేదా ప్రభుత్వ పథకాల గురించి నేను ఎలా సహాయపడగలను?",
    };
    setMessages([{
      id: "greet",
      role: "model",
      text: greetings[language],
      timestamp: new Date(),
    }]);
  }, [language]);

  const sendMessage = useCallback((textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const historyPayload = messages.slice(1).map((msg) => ({
      role: msg.role,
      text: msg.text,
    }));

    wsRef.current.send(JSON.stringify({
      type: "message",
      message: text,
      history: historyPayload,
      language,
      location: "Guntur, Andhra Pradesh",
    }));
  }, [input, messages, language]);

  const toggleListen = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome/Safari.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      recognition.start();
    }
  };

  const speakText = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*#`_\-]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === "hi" ? "hi-IN" : language === "bn" ? "bn-IN" : language === "te" ? "te-IN" : "en-IN";
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSuggestionClick = (query: string) => sendMessage(query);

  const labels = {
    en: {
      inputPlaceholder: "Ask about crops, seeds, pests, or schemes...",
      speakBtn: "Speak",
      muteBtn: "Stop Voice",
      voiceActive: "Voice active",
      voiceMute: "Auto Read",
      suggestionHeader: "Frequently Asked Questions",
      s1: "Suggest best fertilizer for Paddy (Rice)",
      s2: "PM Kisan installment eligibility",
      s3: "Pest remedy for leaf rust",
    },
    hi: {
      inputPlaceholder: "फसलों, बीजों, कीड़ों या योजनाओं के बारे में पूछें...",
      speakBtn: "बोलें",
      muteBtn: "आवाज बंद करें",
      voiceActive: "आवाज सक्रिय है",
      voiceMute: "स स्वतः पढ़ें",
      suggestionHeader: "अक्सर पूछे जाने वाले प्रश्न",
      s1: "धान के लिए सबसे अच्छा उर्वरक सुझाएं",
      s2: "पीएम किसान किस्त की पात्रता क्या है?",
      s3: "पत्ती के रस्ट कीट का जैविक उपचार क्या है?",
    },
    bn: {
      inputPlaceholder: "ফসল, বীজ, কীটপতঙ্গ বা সরকারি প্রকল্প সম্পর্কে জিজ্ঞাসা করুন...",
      speakBtn: "বলুন",
      muteBtn: "কণ্ঠস্বর বন্ধ করুন",
      voiceActive: "কণ্ঠস্বর সক্রিয়",
      voiceMute: "স্বয়ংক্রিয় শ্রবণ",
      suggestionHeader: "প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী",
      s1: "ধানের জন্য সেরা সার সুপারিশ করুন",
      s2: "পিএম কিষাণ কিস্তির যোগ্যতা",
      s3: "পাতার মরিচা রোগের জৈব প্রতিকার",
    },
    te: {
      inputPlaceholder: "పంటలు, విత్తనాలు, తెగుళ్ళు లేదా పథకాల గురించి అడగండి...",
      speakBtn: "మాట్లాడండి",
      muteBtn: "వాయిస్ ఆపండి",
      voiceActive: "వాయిస్ యాక్టివ్",
      voiceMute: "స్వయంచాలకంగా చదవండి",
      suggestionHeader: "తరచుగా అడిగే ప్రశ్నలు",
      s1: "వరికి ఉత్తమ ఎరువును సూచించండి",
      s2: "PM కిసాన్ వాయిదా అర్హత",
      s3: "ఆకు తుప్పు తెగులు నివారణ",
    },
  }[language];

  return (
    <div className="flex flex-col h-[520px] bg-white border-2 border-stone-900 rounded-3xl shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] overflow-hidden" id="chatbot-container">
      <div className="bg-stone-50 border-b-2 border-stone-900 px-4 py-3 flex items-center justify-between" id="chat-header">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          )}
          <span className="font-display font-black text-stone-900 text-sm">Krishi AI Assistant</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setAutoSpeak(!autoSpeak);
              if (autoSpeak) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
            }}
            className={`p-1.5 rounded-xl border-2 border-stone-900 text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] cursor-pointer ${
              autoSpeak ? "bg-amber-400 text-stone-900" : "bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-stone-900" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
            <span className="hidden sm:inline">{labels.voiceMute}</span>
          </button>

          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 text-stone-800 hover:bg-stone-50 border-2 border-stone-900 rounded-xl transition shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] cursor-pointer"
            title="Reset Chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/40" id="chat-messages-scroller">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] border-2 border-stone-900 ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white rounded-tr-none font-bold"
                  : "bg-white text-stone-900 rounded-tl-none whitespace-pre-wrap leading-relaxed font-medium"
              }`}
            >
              <div>{msg.text}</div>

              {msg.role === "model" && (
                <div className="flex justify-between items-center mt-2.5 pt-2 border-t-2 border-stone-100 text-[10px] text-stone-500 font-mono">
                  <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button
                    onClick={() => speakText(msg.text)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded border border-stone-900 transition cursor-pointer font-bold ${
                      isSpeaking ? "bg-red-500 text-white animate-pulse" : "bg-amber-100 text-stone-950 hover:bg-amber-200"
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    <span>{isSpeaking ? labels.muteBtn : labels.speakBtn}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-stone-900 rounded-2xl px-5 py-3.5 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] rounded-tl-none">
              <TypingDots />
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div className="space-y-3 pt-4" id="chat-suggestions-tag">
            <div className="text-xs font-bold text-stone-700 flex items-center gap-1 font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{labels.suggestionHeader}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleSuggestionClick(labels.s1)}
                className="text-left bg-white border-2 border-stone-900 hover:border-emerald-600 p-3 rounded-xl text-xs text-stone-900 hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition font-bold cursor-pointer"
              >
                🌾 {labels.s1}
              </button>
              <button
                onClick={() => handleSuggestionClick(labels.s2)}
                className="text-left bg-white border-2 border-stone-900 hover:border-emerald-600 p-3 rounded-xl text-xs text-stone-900 hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition font-bold cursor-pointer"
              >
                🏦 {labels.s2}
              </button>
              <button
                onClick={() => handleSuggestionClick(labels.s3)}
                className="text-left bg-white border-2 border-stone-900 hover:border-emerald-600 p-3 rounded-xl text-xs text-stone-900 hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition font-bold cursor-pointer"
              >
                🌱 {labels.s3}
              </button>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t-2 border-stone-900 bg-white flex gap-3" id="chat-inputs-form">
        <button
          onClick={toggleListen}
          className={`p-3 rounded-2xl border-2 border-stone-900 transition flex items-center justify-center shrink-0 cursor-pointer shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-stone-50 text-stone-800 hover:bg-stone-100"
          }`}
          title="Speak your query"
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 bg-stone-50 border-2 border-stone-900 rounded-2xl px-4 py-2.5 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
          placeholder={isListening ? "Listening..." : labels.inputPlaceholder}
          disabled={isListening}
        />

        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || !isConnected}
          className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] text-white flex items-center justify-center shrink-0 transition cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
