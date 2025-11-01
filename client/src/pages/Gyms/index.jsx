import React, { useEffect, useMemo, useState } from 'react'
import styles from './Gyms.module.scss'
import { useTranslation } from "react-i18next";
import api from "@/api";
import { Spin } from "antd";
import starIcon from '@/assets/images/starIcon.png'
import locationIcon2 from '@/assets/images/locationIcon2.png'
import { useNavigate } from 'react-router';

// --- Kateqoriya törətmə (istədiyin kimi saxla/uzat)
const CATEGORY_KEYWORDS = {
  Fitness: ["fitness", "gym", "muscle", "fitnes"],
  "Rəqs": ["rəqs", "dance", "ballet", "balet", "latın"],
  Pilates: ["pilates", "reformer"],
  Yoga: ["yoga", "yogi"],
  Atçılıq: ["atçılıq", "horse", "equine", "manez", "stables"],
  Karting: ["karting", "kart", "sürət", "track"],
  "Dövrlər": ["crossfit", "wod", "interval", "functional"],
  "Döyüş idm.": ["mma", "boks", "taekvondo", "karate", "judo", "kickboks"],
};

const normalize = (s = "") =>
  s.toLowerCase()
    .replaceAll("ə", "e").replaceAll("ı", "i").replaceAll("ö", "o")
    .replaceAll("ü", "u").replaceAll("ş", "s").replaceAll("ç", "c").replaceAll("ğ", "g");

const deriveCategory = (v) => {
  const bag = normalize(`${v?.name || ""} ${v?.description || ""}`);
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some(kw => bag.includes(normalize(kw)))) return cat;
  }
  if (v?.venue_type === "entertainment") return "Əyləncə";
  if (v?.venue_type === "sports") return "İdman";
  return "Digər";
};

const INITIAL_VISIBLE = 5;

const Gyms = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [locFilter, setLocFilter] = useState("");

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [expanded, setExpanded] = useState(false);

  const { t } = useTranslation();

  const navigate = useNavigate();


  const openDetail = (g) => {
    const id = g?.id || g?._id;
    if (!id) {
      console.warn("ID tapılmadı:", g);
      return;
    }
    navigate(`/details/venue/${id}`);
  };

  useEffect(() => {
    api.get("/venues")
      .then((res) => {
        const list = (res.data?.data || [])
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map(v => ({ ...v, id: v.id || v._id, category: deriveCategory(v) }));
        setGyms(list);
      })
      .catch((err) => console.error("Gym fetch error:", err))
      .finally(() => setLoading(false))
  }, [])

  const { categories, locations } = useMemo(() => {
    const c = new Set(), l = new Set();
    gyms.forEach(g => {
      if (g.category) c.add(g.category);
      if (g.location) l.add(g.location);
    });
    const order = [
      "Fitness", "Pilates", "Yoga", "Rəqs", "Atçılıq", "Karting",
      "Dövrlər", "Döyüş idm.", "İdman", "Əyləncə", "Digər"
    ];
    const cats = Array.from(c).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return { categories: cats, locations: Array.from(l) };
  }, [gyms]);

  const filteredGyms = useMemo(() => {
    const q = normalize(searchTerm.trim());
    return gyms.filter((g) => {
      const bag = normalize(`${g.name || ""} ${g.description || ""}`);
      const matchesTerm = !q || bag.includes(q);
      const matchesCat = !category || g.category === category;
      const matchesLoc = !locFilter || g.location === locFilter;
      return matchesTerm && matchesCat && matchesLoc;
    });
  }, [gyms, searchTerm, category, locFilter]);

  const visibleGyms = useMemo(() => {
    return expanded ? filteredGyms : filteredGyms.slice(0, visibleCount);
  }, [filteredGyms, expanded, visibleCount]);

  useEffect(() => {
    setExpanded(false);
    setVisibleCount(INITIAL_VISIBLE);
  }, [searchTerm, category, locFilter]);

  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <Spin size="large" tip={t("loading")} />
      </div>
    );
  }

  return (
    <div className={styles.gymsContainer}>
      <div className={styles.gyms}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Axtarış..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Bütün kateqoriyalar</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className={styles.select}
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value)}
          >
            <option value="">Bütün məkanlar</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className={styles.cards}>
          {visibleGyms.length > 0 ? (
            visibleGyms.map((gym) => (
              <div key={gym.id} className={styles.card} onClick={() => openDetail(gym)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openDetail(gym)}>
                <div className={styles.cardContent}>
                  <div>
                    <h3 className={styles.name}>
                      {gym.name.length > 18 ? gym.name.slice(0, 19) + "..." : gym.name}
                    </h3>
                    <span className={styles.description}>{gym.description}</span>
                  </div>

                  <div className={styles.gymRating}>
                    <img src={starIcon} alt="rating" />
                    <span>{gym.rating || 0}</span>
                  </div>

                  <div className={styles.locationGyms}>
                    <img src={locationIcon2} alt="location" />
                    <span>
                      {gym.location?.length > 13 ? gym.location.slice(0, 12) + "..." : gym.location}
                    </span>
                  </div>

                </div>

                <img
                  src={gym.image || "https://via.placeholder.com/150"}
                  alt={gym.name}
                  className={styles.cardImage}
                />
              </div>
            ))
          ) : (
            <p className={styles.noResults}>Uyğun nəticə tapılmadı.</p>
          )}
        </div>

        {filteredGyms.length > INITIAL_VISIBLE && (
          <div className={styles.moreWrap}>
            {!expanded ? (
              <button
                type="button"
                className={styles.moreBtn}
                onClick={() => setExpanded(true)}
              >
                Daha çox göstər ({filteredGyms.length - visibleGyms.length})
              </button>
            ) : (
              <button
                type="button"
                className={styles.moreBtn}
                onClick={() => { setExpanded(false); setVisibleCount(INITIAL_VISIBLE); }}
              >
                Daha az göstər
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.map}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.782880987674!2d49.8671!3d40.4093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d9c9f5a88f1%3A0xa0b0f0e25e67b3d0!2sBaku!5e0!3m2!1sen!2saz!4v1693748230000!5m2!1sen!2saz"
          allowFullScreen
          loading="lazy"
          className={styles.mapIframe}
        ></iframe>
      </div>
    </div>
  )
}

export default Gyms
