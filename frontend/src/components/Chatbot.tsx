import { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Message, Language } from "../types";

interface ChatbotProps {
  language: Language;
}

export default function Chatbot({ language }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Web Speech API for voice recognition (Speech-to-Text)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Match language code for recognition
      rec.lang = language === "hi" ? "hi-IN" : language === "bn" ? "bn-IN" : "en-IN";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [language]);

  // Handle auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add initial greeting based on selected language
  useEffect(() => {
    const greetings = {
      en: "Namaste! I am your Krishi AI Assistant. How can I help you with your crop cycle, soil health, weather, or government schemes today?",
      hi: "नमस्ते! मैं आपका कृषि एआई सहायक हूँ। आज मैं आपकी फसल चक्र, मिट्टी के स्वास्थ्य, मौसम या सरकारी योजनाओं में किस प्रकार मदद कर सकता हूँ?",
      bn: "নমস্কার! আমি আপনার কৃষি এআই সহকারী। আজ আমি আপনার ফসল চক্র, মাটির স্বাস্থ্য, আবহাওয়া বা সরকারী প্রকল্পগুলিতে কীভাবে সহায়তা করতে পারি?"
    };
    
    setMessages([
      {
        id: "greet",
        role: "model",
        text: greetings[language],
        timestamp: new Date()
      }
    ]);
  }, [language]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Create user message
    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      text: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Map history for API
      const historyPayload = messages.slice(1).map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          language,
          location: "Nadia, West Bengal"
        })
      });

      const data = await response.json();
      if (data.success) {
        const modelMsg: Message = {
          id: Math.random().toString(),
          role: "model",
          text: data.response,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, modelMsg]);
        
        // Trigger auto speak if selected
        if (autoSpeak) {
          speakText(data.response);
        }
      } else {
        alert(data.error || "Chatbot failed to respond");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleListen = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome/Safari.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      // Stop any active text synthesis before recording
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      recognition.start();
    }
  };

  const speakText = (text: string) => {
    // If speaking, toggle stop
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#`_\-]/g, ""); // strip markdown formatting for cleaner audio
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure voice properties
    utterance.lang = language === "hi" ? "hi-IN" : language === "bn" ? "bn-IN" : "en-IN";
    utterance.rate = 0.95; // slightly slower for better farmer intelligibility
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSuggestionClick = (query: string) => {
    handleSend(query);
  };

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
    }
  }[language];

  return (
    <div className="flex flex-col h-[520px] bg-white border-2 border-stone-900 rounded-3xl shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] overflow-hidden" id="chatbot-container">
      {/* Mini header controls */}
      <div className="bg-stone-50 border-b-2 border-stone-900 px-4 py-3 flex items-center justify-between" id="chat-header">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
          <span className="font-display font-black text-stone-900 text-sm">Krishi AI Assistant</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* TTS Toggle */}
          <button
            onClick={() => {
              setAutoSpeak(!autoSpeak);
              if (autoSpeak) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }
            }}
            className={`p-1.5 rounded-xl border-2 border-stone-900 text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] cursor-pointer ${
              autoSpeak ? "bg-amber-400 text-stone-900" : "bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-stone-900" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
            <span className="hidden sm:inline">{labels.voiceMute}</span>
          </button>

          {/* Reset */}
          <button 
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 text-stone-800 hover:bg-stone-50 border-2 border-stone-900 rounded-xl transition shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] cursor-pointer"
            title="Reset Chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/40" id="chat-messages-scroller">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
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

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-stone-900 rounded-2xl px-4 py-3 text-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-center gap-2 text-stone-700 rounded-tl-none font-bold font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Analyzing agronomic database...</span>
            </div>
          </div>
        )}

        {/* Suggestion tags if chat is starting */}
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

      {/* Input container footer */}
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
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-stone-50 border-2 border-stone-900 rounded-2xl px-4 py-2.5 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
          placeholder={isListening ? "Listening..." : labels.inputPlaceholder}
          disabled={isListening}
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] text-white flex items-center justify-center shrink-0 transition cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
