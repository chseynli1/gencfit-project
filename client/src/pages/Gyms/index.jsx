import React, { useEffect, useState } from 'react'
import styles from './Gyms.module.scss'
import { useTranslation } from "react-i18next";
import axios from 'axios';
import { Spin } from "antd";
import starIcon from '@/assets/images/starIcon.png'
import locationIcon2 from '@/assets/images/locationIcon2.png'
const Gyms = () => {

  const [gyms, setGyms] = useState([])
  const [loading, setLoading] = useState(true)
  const { t, i18n } = useTranslation();

  useEffect(() => {
    axios
      .get("http://localhost:8001/api/venues")
      .then((res) => {
        const gyms = (res.data.data || []).sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        ).slice(0, 5);;
        setGyms(gyms)
      })
      .catch((err) => console.error("Gym fetch error:", err))
      .finally(() => setLoading(false))
  }, [])

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
          <input type="text" placeholder="Search" />
          <select className={styles.select}>
            <option>9 Kateqoriya</option>
            <option>Fitness</option>
            <option>Rəqs</option>
            <option>Pilates</option>
          </select>
        </div>

        <div className={styles.cards}>
          {
            gyms.map((gym) => {
              return (
                <div className={styles.card}>
                  <div className={styles.cardContent}>
                    <div className="">
                      <h3 className={styles.name}>
                        {gym.name.length > 18 ? gym.name.slice(0, 19) + "..." : gym.name}
                      </h3>
                      <span className={styles.description}>{gym.description}</span>
                    </div>
                    <div className={styles.gymRating}>
                      <img className="" src={starIcon} />
                      <span className="">{gym.rating}</span>
                    </div>
                    <div className={styles.locationGyms}>
                      <img className="" src={locationIcon2} />
                      <span className="">
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
              )
            })
          }


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
