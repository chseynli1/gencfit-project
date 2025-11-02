// src/pages/Chatbot.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./Chatbot.module.scss";
import { MessageCircle, X, Home, Sparkles, Inbox } from "lucide-react";
import api from "@/api";
import HomeTab from "./tabs/HomeTab";
import AITab from "./tabs/AITab";
import MessagesTab from "./tabs/MessagesTab";

const TABS = [
  { key: "home", label: "Əsas səhifə", icon: Home },
  { key: "ai", label: "Gənc AI", icon: Sparkles },
  { key: "inbox", label: "İsmarıclar", icon: Inbox },
];

// 🔑 Hazırkı user ID-ni JWT-dən oxuyan helper
function getCurrentUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || payload?._id || payload?.sub || null;
  } catch {
    return null;
  }
}

const Chatbot = ({ defaultEntityType, defaultEntityId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("chatbot_activeTab") || "home"
  );

  const toggleChat = () => setIsOpen((v) => !v);

  // ---- Auth state (token dəyişəndə avtomatik yenilə) ----
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  const [userId, setUserId] = useState(getCurrentUserId());

  useEffect(() => {
    const checkAuth = () => {
      const has = !!localStorage.getItem("token");
      setIsLoggedIn(has);
      setUserId(getCurrentUserId()); // ✅ user dəyişəndə yenilə
    };

    const interval = setInterval(checkAuth, 1000);
    const onAuthChange = () => checkAuth();
    window.addEventListener("authChange", onAuthChange);
    window.addEventListener("storage", checkAuth);

    // token dəyişəndə custom event emit et
    const _set = localStorage.setItem.bind(localStorage);
    const _remove = localStorage.removeItem.bind(localStorage);
    localStorage.setItem = (k, v) => {
      _set(k, v);
      if (k === "token") window.dispatchEvent(new Event("authChange"));
    };
    localStorage.removeItem = (k) => {
      _remove(k);
      if (k === "token") window.dispatchEvent(new Event("authChange"));
    };

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

  // ---- Per-user storage açarı ----
  const msgKey = useMemo(
    () => (userId ? `chatbot_messages_${userId}` : `chatbot_messages_guest`),
    [userId]
  );

  const defaultWelcome = [{ from: "bot", text: "Salam! Necə kömək edə bilərəm?" }];

  // ---- Mesajlar (per-user saxlanma) ----
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(msgKey);
      return saved ? JSON.parse(saved) : defaultWelcome;
    } catch {
      return defaultWelcome;
    }
  });

  // user dəyişəndə düzgün açardan yüklə
  useEffect(() => {
    try {
      const saved = localStorage.getItem(msgKey);
      setMessages(saved ? JSON.parse(saved) : defaultWelcome);
    } catch {
      setMessages(defaultWelcome);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgKey]);

  // cari user-in açarına persist et
  useEffect(() => {
    localStorage.setItem(msgKey, JSON.stringify(messages));
  }, [messages, msgKey]);

  const CHAT_ENDPOINT = import.meta.env.VITE_CHAT_ENDPOINT || "/chat";

  const sendMessage = async (content) => {
    const txt = content.trim();
    if (!txt) return;

    // ekranda dərhal göstər
    setMessages((p) => [...p, { from: "user", text: txt }]);

    try {
      // (istəyə bağlı) tarixçə keyfiyyət üçün serverə göndərmək olar
      // Burda sadə saxlayırıq: yalnız message
      const res = await api.post(CHAT_ENDPOINT, { message: txt });
      const reply =
        res?.data?.reply ||
        res?.data?.message ||
        "Cavab gəlmədi.";
      setMessages((p) => [...p, { from: "bot", text: reply }]);
    } catch (e) {
      console.error("chat error", e);
      const serverMsg =
        e?.response?.data?.reply ||
        e?.response?.data?.message ||
        e?.message ||
        "Xəta baş verdi. Yenidən cəhd edin.";
      setMessages((p) => [...p, { from: "bot", text: serverMsg }]);
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
        {isOpen ? (
          <X style={{ background: "none" }} size={22} />
        ) : (
          <MessageCircle style={{ background: "none" }} size={24} />
        )}
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

          {/* Content */}
          <div className={styles.body}>
            {activeTab === "home" && <HomeTab />}
            {activeTab === "ai" && <AITab messages={messages} onSend={sendMessage} />}
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
