// src/components/Chatbot/tabs/MessagesTab.jsx
import React, { useState, useMemo } from "react";
import styles from "./MessagesTab.module.scss";
import api from "@/api";
import { Star, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// Backend mətn açarı (.env ilə dəyişmək üçün)
const REVIEW_TEXT_KEY = import.meta.env.VITE_REVIEW_TEXT_KEY || "comment";
// Default entity (əgər prop verilmirsə)
const ENV_DEFAULT_ENTITY_TYPE = import.meta.env.VITE_DEFAULT_REVIEW_ENTITY_TYPE || "";
const ENV_DEFAULT_ENTITY_ID   = import.meta.env.VITE_DEFAULT_REVIEW_ENTITY_ID   || "";

const MessagesTab = ({ defaultEntityType, defaultEntityId }) => {
  // UI: yalnız ulduz + textarea
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  const showRating = hoverRating || rating;

  // Entity mənbəyi: 1) props → 2) env
  const entity_type = (defaultEntityType || ENV_DEFAULT_ENTITY_TYPE || "").toLowerCase();
  const entity_id   = defaultEntityId || ENV_DEFAULT_ENTITY_ID || "";

  const canSubmit = useMemo(() => {
    return ["venue", "partner", "blog"].includes(entity_type) && !!entity_id;
  }, [entity_type, entity_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setOk(false);

    if (!canSubmit) {
      return setErr("Konfiqurasiya səhvidir: entity_type/entity_id yoxdur.");
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return setErr("Ulduz reytinqi 1–5 aralığında olmalıdır.");
    }
    if (comment.trim().length < 10) {
      return setErr("Rəy ən azı 10 simvol olmalıdır.");
    }

    setSubmitting(true);
    try {
      const payload = {
        entity_type,
        entity_id,
        rating: Number(rating),
      };
      payload[REVIEW_TEXT_KEY] = comment.trim();

      await api.post("/reviews", payload);

      setOk(true);
      setComment("");
      setRating(0);
      setHoverRating(0);
    } catch (e) {
      console.log("review submit error:", e?.response?.status, e?.response?.data);
      const apiErr = e?.response?.data;
      const msg =
        apiErr?.message ||
        apiErr?.error ||
        (Array.isArray(apiErr?.errors) && apiErr.errors.map(x => x.msg || x.message).join(" • ")) ||
        e?.message ||
        "Göndərərkən xəta baş verdi.";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.messagesTab}>
      <h3 className={styles.title}>Rəyinizi bölüşün</h3>
      {!canSubmit && (
        <div className={`${styles.alert} ${styles.danger}`} style={{ marginBottom: 12 }}>
          <AlertCircle size={16} />
          <span>
            Admin üçün: <code>defaultEntityType</code> və <code>defaultEntityId</code> prop-u verin<br/>
            və ya <code>VITE_DEFAULT_REVIEW_ENTITY_TYPE</code>, <code>VITE_DEFAULT_REVIEW_ENTITY_ID</code> .env-də təyin edin.
          </span>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.ratingRow} aria-label="Ulduz reytinqi">
          {[1,2,3,4,5].map(v => (
            <button
              type="button"
              key={v}
              className={`${styles.starBtn} ${ (hoverRating || rating) >= v ? styles.filled : "" }`}
              onMouseEnter={() => setHoverRating(v)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(v)}
              aria-label={`${v} ulduz`}
            >
              <Star size={22} />
            </button>
          ))}
          <span className={styles.ratingText}>
            {(hoverRating || rating) ? `${(hoverRating || rating)}/5` : "Ulduz seçin"}
          </span>
        </div>

        <label className={styles.label}>
          Rəy mətni
          <textarea
            className={styles.textarea}
            rows={4}
            placeholder="Təcrübənizi qısa təsvir edin…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
          />
          <span className={styles.counter}>{comment.length}/1000</span>
        </label>

        {err && (
          <div className={`${styles.alert} ${styles.danger}`}>
            <AlertCircle size={16} />
            <span>{err}</span>
          </div>
        )}
        {ok && (
          <div className={`${styles.alert} ${styles.success}`}>
            <CheckCircle2 size={16} />
            <span>Rəy uğurla göndərildi.</span>
          </div>
        )}

        <button type="submit" className={styles.submit} disabled={submitting || !canSubmit} aria-busy={submitting}>
          {submitting ? <Loader2 size={18} className={styles.spin} /> : null}
          {submitting ? "Göndərilir…" : "Göndər"}
        </button>
      </form>
    </div>
  );
};

export default MessagesTab;
