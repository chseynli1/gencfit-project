// src/pages/tabs/AITab.jsx
import React, { useEffect, useRef, useState } from "react";
import styles from "./AITab.module.scss";
import { Send } from "lucide-react";

const AITab = ({ messages = [], onSend }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // Mesaj gələndə sona scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    // hər yeni mesajdan sonra "loading" söndür
    setLoading(false);
  }, [messages.length]);

  const handleSend = async () => {
    const txt = input.trim();
    if (!txt) return;
    setLoading(true);
    setInput("");
    try {
      // onSend Promise qaytarmırsa da problem deyil
      await onSend?.(txt);
    } catch (e) {
      // parent error toast edirsə, burda susmaq olar
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.aiTab}>
      <div className={styles.msgList} role="log" aria-live="polite">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.from === "user" ? styles.msgUser : styles.msgBot}
          >
            {m.text}
          </div>
        ))}

        {loading && (
          <div className={`${styles.msgBot} ${styles.typing}`}>
            Yazır<span className={styles.dots}>...</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className={styles.inputBar}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Mesajınızı yazın..."
          aria-label="Mesajınızı yazın"
          rows={1}
        />
        <button
          onClick={handleSend}
          aria-label="Göndər"
          disabled={loading || !input.trim()}
          className={styles.sendBtn}
        >
          <Send style={{background:"none"}} size={18} />
        </button>
      </div>
    </div>
  );
};

export default AITab;
