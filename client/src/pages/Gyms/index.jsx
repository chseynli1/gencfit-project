import React, { useEffect, useState } from 'react'
import styles from './Gyms.module.scss'
import { useTranslation } from "react-i18next";
import api from "@/api";
import { Spin } from "antd";
import starIcon from '@/assets/images/starIcon.png'
import locationIcon2 from '@/assets/images/locationIcon2.png'
const Gyms = () => {

  const [gyms, setGyms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    api
      .get("/venues")
      .then((res) => {
        const gyms = (res.data.data || []).sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        ).slice(0, 5);;
        setGyms(gyms)
      })
      .catch((err) => console.error("Gym fetch error:", err))
      .finally(() => setLoading(false))
  }, [])


  useEffect(() => {
    const filtered = gyms.filter((gym) => {
      const matchesSearch =
        gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gym.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category ? gym.category === category : true;
      return matchesSearch && matchesCategory;
    });
    setFilteredGyms(filtered);
  }, [searchTerm, category, gyms]);

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
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}>
            <option value="">9 Kateqoriya</option>
            <option value="Fitness">Fitness</option>
            <option value="Rəqs">Rəqs</option>
            <option value="Pilates">Pilates</option>
          </select>
        </div>

        <div className={styles.cards}>
          {filteredGyms.length > 0 ? (
            filteredGyms.map((gym) => (
              <div key={gym._id} className={styles.card}>
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
                      {gym.location.length > 13 ? gym.location.slice(0, 12) + "..." : gym.location}
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
      </div>

      <div className={styles.map}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.782880987674!2d49.8671!3d40.4093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d9c9f5a88f1%3A0xa0b0f0e25e67b3d0!2sBaku!5e0!3m2!1sen!2saz!4v1693748230000!5m2!1sen!2saz"
          allowFullScreen
          loading="lazy"
          className={styles.mapIframe}
        ></iframe>
      </div>
    </div >
  )
}

export default Gyms
