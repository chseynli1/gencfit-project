// src/pages/VenuesList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/api";
import { Spin } from "antd";
import styles from "./VenuesList.module.scss";
import { toCanonicalCategory, deriveCategory, normalize, CATEGORY_KEYWORDS } from "@/shared/utils/categories";

const INITIAL_VISIBLE = 12;

const VenuesList = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const rawCategory = params.get("category") || "";
  const rawQuery = params.get("q") || "";
  const category = useMemo(() => toCanonicalCategory(rawCategory), [rawCategory]);

  const filterParamProvided = !!(rawCategory || rawQuery);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");

    api.get("/venues")
      .then((res) => {
        const list = (res?.data?.data || [])
          .map((v) => ({
            ...v,
            id: v.id || v._id,
            __cat: deriveCategory(v),
          }))
          .sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

        if (mounted) setVenues(list);
      })
      .catch((e) => mounted && setErr(e?.message || "Yükləmə xətası"))
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  const matchesQuery = (v, raw) => {
    const q = normalize(raw);
    if (!q) return true;
    const bag = normalize(
      `${v?.name || ""} ${v?.title || ""} ${v?.description || ""} ${v?.about || ""} ${v?.address || ""} ${Array.isArray(v?.tags) ? v.tags.join(" ") : ""}`
    );

    // 1) düz mətn keçidi
    if (bag.includes(q)) return true;

    // 2) q üçün keyword xəritəsi (məs: "Şahmat", "Oxçuluq" və s.)
    for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
      if (normalize(cat) === q) {
        return kws.some((kw) => bag.includes(normalize(kw)));
      }
    }
    // əgər q müəyyən kateqoriyalara bənzəyirsə:
    if (q.includes("yoqa") || q.includes("yoga")) {
      return (CATEGORY_KEYWORDS["Yoga"] || []).some((kw) => bag.includes(normalize(kw)));
    }
    if (q.includes("reqs") || q.includes("rəqs") || q.includes("dance")) {
      return (CATEGORY_KEYWORDS["Rəqs"] || []).some((kw) => bag.includes(normalize(kw)));
    }
    if (q.includes("sahmat") || q.includes("şahmat") || q.includes("chess")) {
      // şahmat ayrıca keyword dəsti (istəyə görə genişləndir)
      const chessKW = ["şahmat", "sahmat", "chess"];
      return chessKW.some((kw) => bag.includes(normalize(kw)));
    }
    if (q.includes("oxculuq") || q.includes("oxçuluq") || q.includes("archery")) {
      const archeryKW = ["oxçuluq", "oxculuq", "archery", "bow", "arrow"];
      return archeryKW.some((kw) => bag.includes(normalize(kw)));
    }

    return false;
  };

  const filtered = useMemo(() => {
    if (category) {
      return venues.filter((v) => v.__cat === category);
    }
    if (rawQuery) {
      return venues.filter((v) => matchesQuery(v, rawQuery));
    }
    // Parametr verilməyibsə — yalnız o zaman ALL göstər
    return filterParamProvided ? [] : venues;
  }, [venues, category, rawQuery, filterParamProvided]);

  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  useEffect(() => { setVisible(INITIAL_VISIBLE); }, [category, rawQuery]);

  const title = category
    ? `${category} — məkanlar`
    : rawQuery
    ? `“${rawQuery}” üçün nəticələr`
    : "Bütün məkanlar";

  const openDetail = (v) => v?.id && navigate(`/details/venue/${v.id}`);

  if (loading) {
    return <div className={styles.center}><Spin size="large" /></div>;
  }
  if (err) {
    return <div className={styles.center}><p className={styles.error}>Xəta: {err}</p></div>;
  }

  return (
    <section className={styles.venuesList}>
      <div className={styles.header}>
        <h1>{title}</h1>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}><p>Uyğun məkan tapılmadı.</p></div>
      ) : (
        <div className={styles.grid}>
          {filtered.slice(0, visible).map((v) => {
            const cover = v?.photos?.[0] || v?.image || v?.cover || "https://via.placeholder.com/600x400";
            return (
              <article
                key={v.id}
                className={styles.card}
                onClick={() => openDetail(v)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openDetail(v)}
              >
                <div className={styles.thumb}>
                  <img src={cover} alt={v.name || v.title || "Venue"} />
                </div>
                <div className={styles.body}>
                  <h3>{v.name || v.title}</h3>
                  {v.address && <p className={styles.addr}>{v.address}</p>}
                  <div className={styles.meta}>
                    <span className={styles.badge}>{v.__cat}</span>
                    {v.location && <span className={styles.dot}>&middot;</span>}
                    {v.location && <span>{v.location}</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {filtered.length > visible && (
        <div className={styles.moreWrap}>
          <button className={styles.moreBtn} onClick={() => setVisible((n) => n + INITIAL_VISIBLE)}>
            Daha çox göstər ({filtered.length - visible})
          </button>
        </div>
      )}
    </section>
  );
};

export default VenuesList;
