import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "./Chatbot.module.scss";
import { MessageCircle, X, Send, Home, Sparkles, Inbox } from "lucide-react";
import api from "@/api";
import HomeTab from "./tabs/HomeTab";
import AITab from "./tabs/AITab";
import MessagesTab from "./tabs/MessagesTab";


const TABS = [
  { key: "home", label: "Əsas səhifə", icon: Home },
  { key: "ai", label: "Gənc AI", icon: Sparkles },
  { key: "inbox", label: "İsmarıclar", icon: Inbox },
];


const Chatbot = ({
  defaultEntityType, // "venue" | "partner" | "blog"
  defaultEntityId,   // string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("chatbot_activeTab") || "home");


  const toggleChat = () => setIsOpen((v) => !v);


  // ---- Auth state (token dəyişəndə avtomatik yenilə) ----
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));


  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("token"));
    const interval = setInterval(checkAuth, 1000);
    const onAuthChange = () => checkAuth();
    window.addEventListener("authChange", onAuthChange);
    window.addEventListener("storage", checkAuth);


    // Override setItem/removeItem to emit custom event when token dəyişir
    const _set = localStorage.setItem.bind(localStorage);
    const _remove = localStorage.removeItem.bind(localStorage);
    localStorage.setItem = (k, v) => { _set(k, v); if (k === "token") window.dispatchEvent(new Event("authChange")); };
    localStorage.removeItem = (k) => { _remove(k); if (k === "token") window.dispatchEvent(new Event("authChange")); };


    return () => {
      clearInterval(interval);
      window.removeEventListener("authChange", onAuthChange);
      window.removeEventListener("storage", checkAuth);
      localStorage.setItem = _set; // restore
      localStorage.removeItem = _remove; // restore
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("chatbot_activeTab", activeTab);
  }, [activeTab]);


  // ---- Mesaj storage-u və API yalnız AI tab-da istifadə olunduğu üçün AITab-a prop verəcəyik ----
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("chatbot_messages");
      return saved ? JSON.parse(saved) : [{ from: "bot", text: "Salam! Necə kömək edə bilərəm?" }];
    } catch {
      return [{ from: "bot", text: "Salam! Necə kömək edə bilərəm?" }];
    }
  });
  useEffect(() => {
    localStorage.setItem("chatbot_messages", JSON.stringify(messages));
  }, [messages]);


  const CHAT_ENDPOINT = import.meta.env.VITE_CHAT_ENDPOINT || "/chat";

  const sendMessage = async (content) => {
    const txt = content.trim();
    if (!txt) return;
    setMessages((p) => [...p, { from: "user", text: txt }]);
    try {
      const res = await api.post(CHAT_ENDPOINT, { message: txt });
      const reply = res?.data?.reply || "Cavab gəlmədi.";
      setMessages((p) => [...p, { from: "bot", text: reply }]);
    } catch (e) {
      console.error("chat error", e);
      setMessages((p) => [...p, { from: "bot", text: "Xəta baş verdi. Yenidən cəhd edin." }]);
    }
  };

  if (!isLoggedIn) return null; // yalnız login olanlara göstər


  return (
    <>
      <button
        className={`${styles.chatFab} ${isOpen ? styles.isOpen : ""}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Chatbotu bağla" : "Chatbotu aç"}
      >
        {isOpen ? <X style={{ background: "none" }} size={22} /> : <MessageCircle size={24} />}
      </button>


      {isOpen && (
        <div className={styles.chatSheet} role="dialog" aria-label="GəncFİT Chatbot">
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.titleWrap}>
              <span className={styles.title}>Gəncfit</span>
              <span className={styles.subtitle}>Tez-tez verilən suallar</span>
            </div>
          </div>


          {/* Content body switches by tab */}
          <div className={styles.body}>
            {activeTab === "home" && <HomeTab />}
            {activeTab === "ai" && (
              <AITab messages={messages} onSend={sendMessage} />
            )}
            {activeTab === "inbox" && (
              <MessagesTab
                defaultEntityType={defaultEntityType}
                defaultEntityId={defaultEntityId}
              />
            )}
          </div>


          {/* Bottom Nav */}
          <nav className={styles.bottomNav} aria-label="Chatbot naviqasiya">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                  onClick={() => setActiveTab(t.key)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={22} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
};


export default Chatbot;