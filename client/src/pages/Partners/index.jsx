import React, { useEffect, useState } from 'react'
import styles from './Partner.module.scss'
import partnersImg from '@/assets/images/partners.png'
import timeImg from '@/assets/images/time.png'
import activeLifeImg from '@/assets/images/activeLife.png'
import commentImg from '@/assets/images/comment.png'
import usersImg from '@/assets/images/users.png'
import usersVector from '@/assets/images/usersVector.png'
import queryVector from '@/assets/images/queryVector.png'
import searchVector from '@/assets/images/searchVector.png'
import axios from 'axios'
import { CheckCircle } from "lucide-react";
import { uuid } from 'zod'
import { Spin } from 'antd'

const Partners = () => {

  const [reviews, setReviews] = useState([])
  const [leadPhone, setLeadPhone] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadMsg, setLeadMsg] = useState(""); // success / error mesajı
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [venues, setVenues] = useState([])


  useEffect(() => {
    axios
      .get("http://localhost:8001/api/venues")
      .then((res) => {
        const gyms = (res.data.data || []).sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        ).slice(5, 9);;
        setVenues(gyms)
      })
      .catch((err) => console.error("Gym fetch error:", err))
      .finally(() => setLoading(false))
  }, [])


  if (leadLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <Spin size="large" tip={t("loading")} />
      </div>
    );
  }




  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get('http://localhost:8001/api/reviews')

        // backend cavabını yoxlayaq:
        // Əgər res.data massivdirsə -> birbaşa istifadə et
        // Əgər res.data.data massivdirsə -> onu istifadə et
        const reviewsData = Array.isArray(res.data)
          ? res.data
          : res.data.data || []

        setReviews(reviewsData)
      } catch (error) {
        console.error("Rəyləri yükləyərkən xəta baş verdi:", error)
      }
    }

    fetchReviews()
  }, [])

  const renderStars = (rating) => {
    const totalStars = 5
    return [...Array(totalStars)].map((_, index) => (
      <span
        key={index}
        style={{
          color: index < rating ? '#E66F15' : '#E0E0E0', // narıncı və ya boz
          fontSize: '20px',
        }}
      >
        ★
      </span>
    ))
  }


  const sendPartnerInquiry = async () => {
    const trimmed = (leadPhone || "").trim();
    const fullNumber = `+994${trimmed}`;
    if (!trimmed) {
      setLeadMsg("Zəhmət olmasa telefon nömrəsi daxil edin");
      return;
    }

    try {
      setLeadLoading(true);
      setLeadMsg("");

      const { data } = await axios.post("/api/partners/inquiries", { phone: fullNumber });

      if (data?.success) {
        setLeadMsg("");
        setLeadPhone("");
        setSuccessMsg("Sorğunuz qəbul olundu. Qısa müddətdə sizinlə əlaqə saxlanılacaq.");
        setSuccessOpen(true);
      } else {
        setLeadMsg(data?.message || "Sorğu göndərilə bilmədi");
      }
    } catch (err) {
      console.error("Inquiry error:", err);
      const msg = err?.response?.data?.message || "Xəta baş verdi";
      setLeadMsg(msg);
    } finally {
      setLeadLoading(false);
    }
  };

  useEffect(() => {
    if (!successOpen) return;
    const onKey = (e) => e.key === "Escape" && setSuccessOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [successOpen]);





  return (
    <div className={styles.partners}>
      <section className={styles.firstSection}>
        <div className={styles.firstSectionLeft}>
          <div className={styles.textBlock}>
            <h2 className={styles.title}>Birlikdə Daha Çox Gəncə Çataq!</h2>
            <p className={styles.subtitle}>Etibarlı və yenilikçi platformamızda yerinizi alın, brendinizi böyüdün.</p>
          </div>
          <div className={styles.formBlock}>
            <p className={styles.formLabel}>Tərəfdaşlıq üçün müraciət edin</p>
            <div className={styles.formActions}>
              <input
                type="tel"
                className={styles.input}
                placeholder="+994"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
              />
              <button
                className={styles.button}
                onClick={sendPartnerInquiry}
                disabled={leadLoading}
              >
                {leadLoading ? "Göndərilir..." : "Sorğu göndərin"}
              </button>


            </div>
          </div>
        </div>
        <div className={styles.firstSectionRight}>
          <img className={styles.rightImg} src={partnersImg} />
        </div>
      </section>

      {/* Section 2 */}

      <section className={styles.whyUs}>
        <div className={styles.whyUs__intro}>
          <h2>Bizimlə çalışmaq niyə faydalıdır?</h2>
          <p>GəncFit, sağlam həyat tərzini təşviq edən, geniş auditoriyaya sahib peşəkar platformadır. Bizimlə əməkdaşlıq etməklə məhsul və xidmətlərinizi hədəf kütləyə təqdim edə, biznesinizin inkişafına real töhfə verə bilərsiniz.</p>
        </div>
        <div className={styles.whyUs__grid}>
          <div className={styles.whyUs__item}>
            <div className={styles.whyUs__icon}>
              <img src={usersImg} />
            </div>
            <div className="">
              <h3 className={styles.whyUs__title}>Aylıq 10K+ istifadəçi</h3>
              <p className={styles.whyUs__text}>Platformamız ayda on minlərlə istifadəçiyə xidmət göstərir.</p>
            </div>
          </div>

          <div className={styles.whyUs__item}>
            <div className={styles.whyUs__icon}>
              <img src={activeLifeImg} />
            </div>
            <div className="">
              <h3 className={styles.whyUs__title}>90% Aktiv həyat maraqlısı</h3>
              <p className={styles.whyUs__text}>Fəal və sağlamlıqla maraqlanan istifadəçilər brendinizi gözləyir.</p>
            </div>
          </div>

          <div className={styles.whyUs__item}>
            <div className={styles.whyUs__icon}>
              <img src={commentImg} />
            </div>
            <div className="">
              <h3 className={styles.whyUs__title}>95% müsbət istifadəçi rəyi</h3>
              <p className={styles.whyUs__text}>GəncFit istifadəçilərinin əksəriyyəti platformadan və partnyorlardan razıdır.</p>
            </div>
          </div>

          <div className={styles.whyUs__item}>
            <div className={styles.whyUs__icon}>
              <img src={timeImg} />
            </div>
            <div className="">
              <h3 className={styles.whyUs__title}>Yüksək istifadəçi məşğulluğu</h3>
              <p className={styles.whyUs__text4}>Orta istifadəçi platformada 15 dəqiqədən çox vaxt keçirir ki, bu brendinizin diqqət çəkməsi üçün real imkan deməkdir.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className={styles.featuredPartners}>
        <div className={styles.featuredPartnersHeader}>
          <h2>Sektorun qabaqcıl adları platformamızı seçdi.<p> Onlarla siz də tanış olun.</p></h2>
        </div>
        <div className={styles.featuredPartnersCards}>
          {
            venues.map((venues) => {
              return (
                <div className={styles.featuredPartnersCard}>
                <div className={styles.cardImg}>
                  <img src={venues.image} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.title}>{venues.name}</h3>
                  <div className={styles.subTitle}>
                    <div className={styles.venuesRating}>
                      <span className={styles.rating}>★ {venues.rating}</span>
                      <span className={venues.description}>{venues.description}</span>
                    </div>
                    <p className={styles.location}>{venues.location}</p>
                  </div>
                </div>
                </div>
              )
            })
          }
        </div>
      </section>


      {/* Section 4 */}
      <section className={styles.reviews}>
        <div className={styles.reviewsContent}>
          <h2 className={styles.reviewsTitle}>Məmnun istifadəçilər, davamlı İnkişaf</h2>
          <p className={styles.reviewsSubtitle}>Gəncfit platformasının geniş və fəal istifadəçi kütləsi biznesinizin <p>inkişafı üçün ideal mühit yaradır. Sizi bu uğur yoluna dəvət edirik.</p></p>
        </div>
        <div className={styles.reviewsCards}>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id || uuid()} className={styles.reviewCard}>
                <div className={styles.reviewInfo}>
                  <img
                    src={review.user_avatar || "https://res.cloudinary.com/dzsjtq4zd/image/upload/v1756229683/default-avatar-icon-of-social-media-user-vector_abij8s.jpg"}
                    alt={review.user_name}
                    className={styles.reviewImage}
                  />

                  <div className={styles.reviewContent}>
                    <h4 className={styles.reviewName}>{review.user_name}</h4>
                    <p className={styles.stars}>{renderStars(review.rating)}</p>
                  </div>
                </div>

                <div>
                  <p className={styles.reviewComment}>{review.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.loading}>Rəylər yüklənir...</p>
          )}
        </div>
      </section>

      {/* Section 5 */}

      <section className={styles.collobration}>
        <div className={styles.collobrationHeader}>
          <h2>Bizimlə əməkdaşlığa necə başlamaq olar?</h2>
          <p>Sadə bir müraciət, güclü tərəfdaşlığın başlanğıcıdır.</p>
        </div>
        <div className={styles.collaborationContent}>
          <div className={styles.collaborationCard}>
            <div className={styles.collaborationImg}>
              <img src={queryVector} />
            </div>
            <p>Tərəfdaşlıq üçün sorğu göndərin</p>
          </div>
          <div className={styles.collaborationCard}>
            <div className={styles.collaborationImg}>
              <img src={searchVector} />
            </div>
            <p>Müraciətinizə baxaq</p>
          </div>
          <div className={styles.collaborationCard}>
            <div className={styles.collaborationImg}>
              <img src={usersVector} />
            </div>
            <p>Görüşək və tərəfdaşlığa başlayaq</p>
          </div>
        </div>
      </section>

      {/* Section 6 */}
      <section className={styles.querySection}>
        <div className={styles.query}>
          <div className={styles.queryContent}>
            <h2 className={styles.queryTitle}>Tərəfdaşlıq üçün sorğu göndərin</h2>
            <p className={styles.querySubtitle}>Sorğunuzu aldıqdan sonra komandamız sizinlə telefon zəngi və ya ismarıcla əlaqə quracaqdır.</p>
          </div>
          <div className={styles.queryForm}>
            {/* <span className={styles.prefix}>+994</span> */}
            <input className={styles.queryInp} type="tel"
              placeholder="+994"
              value={leadPhone}
              onChange={(e) => {
                // yalnız rəqəmləri qəbul et
                const v = e.target.value.replace(/\D/g, "");
                setLeadPhone(v);
              }} />
            <button className={styles.queryBtn}
              onClick={sendPartnerInquiry}
              disabled={leadLoading}
            >{leadLoading ? "Göndərilir..." : "Sorğu göndər"}</button>
          </div>
        </div>
      </section>


      {successOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={() => setSuccessOpen(false)} // overlay-ə klikdə bağlansın
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()} // içə klik bağlamasın
          >
            <CheckCircle className={styles.modalIcon} aria-hidden="true" />
            <h3 className={styles.modalTitle}>Uğurlu!</h3>
            <p className={styles.modalText}>{successMsg}</p>

            <button
              className={styles.modalBtn}
              onClick={() => setSuccessOpen(false)}
              autoFocus
            >
              Tamam
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Partners
