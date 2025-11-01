// src/pages/Detail/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./Detail.module.scss";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "@/api";
import { ArrowLeft, MapPin, Star, Phone, Mail } from "lucide-react";

const endpointByType = {
  venue:   (id) => `/venues/${id}`,
  partner: (id) => `/partners/${id}`,
  blog:    (id) => `/blogs/${id}`,
};

// Query fallback helper (Variant B üçün)
function useQueryParamsFallback() {
  const location = useLocation();
  const sp = new URLSearchParams(location.search);
  return {
    type: sp.get("t") || "",
    id: sp.get("id") || "",
  };
}

const Detail = () => {
  const navigate = useNavigate();

  // Variant A (path param)
  const { type: typeParam, id: idParam } = useParams();
  // Variant B (query) üçün fallback
  const q = useQueryParamsFallback();

  const type = (typeParam || q.type || "").toLowerCase(); // 'venue' | 'partner' | 'blog'
  const id   = idParam || q.id || "";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!type || !id) {
      setErr("Yanlış detail URL-i (type və id tələb olunur).");
      setLoading(false);
      return;
    }
    if (!endpointByType[type]) {
      setErr(`Dəstəklənməyən tip: ${type}`);
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await api.get(endpointByType[type](id));
        const payload = res?.data?.data || res?.data;
        if (mounted) setData(payload);
      } catch (e) {
        console.error(e);
        if (mounted) setErr("Məlumat tapılmadı və ya server xətası.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [type, id]);

  const mapSrc = useMemo(() => {
    const loc = data?.location?.trim();
    if (!loc) return null;
    // API keysiz basic embed – q= paramı ilə ünvanı göstərir
    const q = encodeURIComponent(loc);
    return `https://www.google.com/maps?q=${q}&output=embed`;
  }, [data]);

  if (loading) return <div className={styles.wrap}>Yüklənir…</div>;
  if (err) return (
    <div className={styles.wrap}>
      <p className={styles.error}>{err}</p>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Geri qayıt
      </button>
    </div>
  );
  if (!data) return null;

  const title = data.name || data.title || "Detail";
  const rating = typeof data.rating === "number" ? data.rating : null;
  const amenities = Array.isArray(data.amenities) ? data.amenities : [];

  return (
    <div className={styles.detail}>
      {/* Top actions */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Geri
        </button>
      </div>

      {/* Header */}
      <header className={styles.header}>
        {data.image && (
          <img className={styles.cover} src={data.image} alt={title} />
        )}

        <div className={styles.headerMeta}>
          <h1 className={styles.title}>{title}</h1>

          {data.location && (
            <p className={styles.metaRow}>
              <MapPin size={16} /> <span>{data.location}</span>
            </p>
          )}

          {/* Rating badge */}
          {rating !== null && (
            <div className={styles.ratingBadge}>
              <Star style={{background:"none"}} size={14} />
              <span>{rating}</span>
            </div>
          )}

          {/* Type / Capacity (əgər varsa) */}
          <div className={styles.chips}>
            {data.venue_type && (
              <span className={styles.chip}>
                {data.venue_type === "sports" ? "İdman" :
                 data.venue_type === "entertainment" ? "Əyləncə" : data.venue_type}
              </span>
            )}
            {typeof data.capacity === "number" && (
              <span className={styles.chip}>Tutum: {data.capacity}</span>
            )}
          </div>

          {/* Kontakt */}
          {(data.contact_phone || data.contact_email) && (
            <div className={styles.contacts}>
              {data.contact_phone && (
                <a className={styles.contactBtn} href={`tel:${data.contact_phone}`}>
                  <Phone style={{background:"none"}} size={16} /> {data.contact_phone}
                </a>
              )}
              {data.contact_email && (
                <a className={styles.contactBtn} href={`mailto:${data.contact_email}`}>
                  <Mail style={{background:"none"}} size={16} /> {data.contact_email}
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Description */}
      {data.description && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Haqqında</h2>
          <p className={styles.desc}>{data.description}</p>
        </section>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>İmkanlar</h2>
          <ul className={styles.amenities}>
            {amenities.map((a, i) => (
              <li key={`${a}-${i}`} className={styles.amenity}>{a}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Map */}
      {mapSrc && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Xəritə</h2>
          <div className={styles.mapWrap}>
            <iframe
              src={mapSrc}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="Məkan xəritəsi"
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default Detail;
