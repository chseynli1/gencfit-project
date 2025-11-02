// src/pages/ExperienceSection.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./ExperienceSection.module.scss";
import { toCanonicalCategory } from "@/shared/utils/categories";

// Şəkillər
import img1 from "@/assets/images/expierence/1.png"; // Yoga
import img2 from "@/assets/images/expierence/2.png"; // Fitness
import img3 from "@/assets/images/expierence/3.png"; // Rəqs
import img4 from "@/assets/images/expierence/4.png"; // Şahmat
import img5 from "@/assets/images/expierence/5.png"; // Döyüş idm.
import img6 from "@/assets/images/expierence/6.png"; // Oxçuluq
import img7 from "@/assets/images/expierence/7.png"; // Karting
import img8 from "@/assets/images/expierence/8.png"; // Atçılıq

// Kateqoriya → şəkil map (canonical adlarla)
const CATEGORY_IMAGE_MAP = {
  Yoga: img1,
  Fitness: img2,
  "Rəqs": img3,
  "Şahmat": img4,
  "Döyüş idm.": img5,
  "Oxçuluq": img6,
  "Karting": img7,
  "Atçılıq": img8,
};

// Fallback üçün sıra (əgər nə canonical tapılmasa, nə də item.image olsa)
const imageList = [img1, img2, img3, img4, img5, img6, img7, img8];

const safeIsUrlish = (s) =>
  typeof s === "string" && (s.startsWith("http") || s.startsWith("/"));

const ExperienceSection = ({ searchResults }) => {
  const { t, ready } = useTranslation();
  const navigate = useNavigate();

  const baseItems = useMemo(() => {
    if (!ready) return [];
    const arr = t("experience.items", { returnObjects: true });
    return Array.isArray(arr) ? arr : [];
  }, [t, ready]);

  const dataToRender = useMemo(() => {
    if (Array.isArray(searchResults) && searchResults.length) return searchResults;
    return baseItems;
  }, [searchResults, baseItems]);

  const getImageFor = (item, index) => {
    const raw = item?.title || item?.name || item?.key || "";
    const canonical = toCanonicalCategory(raw);
    const byCategory = canonical ? CATEGORY_IMAGE_MAP[canonical] : null;

    // 1) yalnız etibarlı görünən explicit yol varsa istifadə et,
    //    əks halda kateqoriya şəkli, o da yoxdursa fallback siyahı
    if (safeIsUrlish(item?.image)) return item.image;
    if (byCategory) return byCategory;
    return imageList[index % imageList.length];
  }

  const handleOpenCategory = (item) => {
    const raw = item?.title || item?.name || item?.key || "";
    const canonical = toCanonicalCategory(raw);
    if (canonical) {
      navigate(`/venues?category=${encodeURIComponent(canonical)}`);
    } else {
      navigate(`/venues?q=${encodeURIComponent(raw)}`);
    }
  };
  if (!ready) return null;

  return (
    <section className={styles.experienceSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t("experience.title")}</h2>
        <p className={styles.subtitle}>{t("experience.subtitle")}</p>

        <div className={styles.cardGrid}>
          {dataToRender.map((item, index) => {
            const raw = item?.title || item?.name || item?.key || "";
            const canonical = toCanonicalCategory(raw);
            const primarySrc = getImageFor(item, index);
            const fallbackSrc = (canonical && CATEGORY_IMAGE_MAP[canonical]) || imageList[index % imageList.length];

            return (
              <button
                type="button"
                className={styles.card}
                key={index}
                onClick={() => handleOpenCategory(item)}
              >
                <div className={styles.cardImage}>
                  <img
                    src={primarySrc}
                    alt={item?.title || item?.name || "category"}
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src !== fallbackSrc) {
                        e.currentTarget.src = fallbackSrc;
                      }
                    }}
                  />
                </div>

                <div className={styles.cardText}>
                  <h4>{item?.title || item?.name}</h4>
                  <div className={styles.cardFooter}>
                    {item?.count ? (
                      <span className={styles.cardSpan}>{item.count}</span>
                    ) : (
                      <span className={styles.cardSpan} aria-hidden="true" />
                    )}
                    <span className={styles.arrowBtn} aria-hidden="true">
                      <ChevronRight size={18} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>









        <div
          className={styles.moreBtn}
          onClick={() => navigate("/venues")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/venues")}
        >
          {t("experience.more")}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
