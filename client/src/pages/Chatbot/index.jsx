import React, { useEffect, useState, useCallback } from "react";
import styles from "./Chatbot.module.scss";
import { Send, MessageCircle, X } from "lucide-react";
import api from "@/api";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("chatbot_messages");
      return saved
        ? JSON.parse(saved)
        : [{ from: "bot", text: "Salam! Necə kömək edə bilərəm?" }];
    } catch (error) {
      console.error("LocalStorage data error:", error);
      return [{ from: "bot", text: "Salam! Necə kömək edə bilərəm?" }];
    }
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  // Reactive login state - localStorage-dan token və ya user məlumatını yoxla
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("token");
  });

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    // Əsas yoxlama funksiyası
    checkAuthStatus();

    // Custom event yaratmaq üçün
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    // Hər 1 saniyədən bir yoxla (fallback kimi)
    const interval = setInterval(checkAuthStatus, 1000);

    // Custom event əlavə et
    window.addEventListener('authChange', handleAuthChange);
    
    // Storage event-i (digər tablar üçün)
    window.addEventListener("storage", checkAuthStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  // Login/logout zamanı bu funksiyanı çağırın
  useEffect(() => {
    // Auth funksiyalarınızda bu event-i trigger edin
    // Məsələn: login və logout funksiyalarınızda
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    // localStorage setItem override et
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, arguments);
      if (key === 'token') {
        window.dispatchEvent(new Event('authChange'));
      }
    };

    // localStorage removeItem override et
    localStorage.removeItem = function(key) {
      originalRemoveItem.apply(this, arguments);
      if (key === 'token') {
        window.dispatchEvent(new Event('authChange'));
      }
    };

    return () => {
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);

  // 💾 Mesajları localStorage-da saxla
  useEffect(() => {
    try {
      localStorage.setItem("chatbot_messages", JSON.stringify(messages));
    } catch (error) {
      console.error("LocalStorage save error:", error);
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = trimmedInput;
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await api.post("/chat", {
        message: userMessage,
      });

      const botReply = res.data?.reply || "Cavab gəlmədi.";
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    } catch (err) {
      console.error("API error:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Xəta baş verdi. Yenidən cəhd et." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messagesEndRef = React.useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  return (
    <>
      {isLoggedIn && (
        <div
          className={styles.chatIcon}
          onClick={toggleChat}
          role="button"
          aria-label={isOpen ? "Chatbot bağla" : "Chatbot aç"}
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleChat()}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={26} />}
        </div>
      )}

      {isLoggedIn && isOpen && (
        <div className={styles.chatBox} role="dialog" aria-label="Chatbot pəncərəsi">
          <div className={styles.header}>
            <span>AI Chatbot 🤖</span>
            <X
              size={18}
              className={styles.closeBtn}
              onClick={toggleChat}
              role="button"
              aria-label="Chatbot bağla"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleChat()}
            />
          </div>

          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={`${msg.from}-${i}-${msg.text.substring(0, 10)}`}
                className={msg.from === "user" ? styles.userMsg : styles.botMsg}
                role="article"
                aria-label={msg.from === "user" ? "İstifadəçi mesajı" : "Bot mesajı"}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div
                className={styles.typingBubble}
                aria-live="polite"
                aria-label="Bot yazır"
              >
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <input
              type="text"
              placeholder="Mesajınızı yazın..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Mesaj yazmaq üçün input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Mesajı göndər"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;