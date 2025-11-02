import React from 'react'
import styles from "./Footer.module.scss"
import logo from "@/assets/images/ag.gencfit2.png"
import fond_logo from "../../../assets/images/fond_logo.png";
import { useTranslation } from 'react-i18next';

const Footer = () => {

  const { t, ready } = useTranslation();
  if (!ready) return null

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        <div className={styles.footerLeft}>
          <img src={logo} alt={t('footer.logoAlt')} className={styles.logo} />
          <img src={fond_logo} className={styles.fondLogo} />
        </div>

        <div className={styles.footerRight}>
          <div className={styles.contactSection}>
            <p className={styles.address}>{t('footer.address.line1')}<br />{t('footer.address.line2')}</p>
            <div className={styles.contactInfo}>
              <p className={styles.phone}>{t('footer.phone')}</p>
              <p className={styles.email}>{t('footer.email')}</p>
            </div>
          </div>
          <div className={styles.navigationLinks}>
            <div className={styles.footerLinks}>
              <ul className={styles.list}>
                <li className={styles.listItem}>{t('footer.links.about')}</li>
                <li className={styles.listItem}>{t('footer.links.partners')}</li>
                <li className={styles.listItem}>{t('footer.links.services')}</li>
                <li className={styles.listItem}>{t('footer.links.contact')}</li>
              </ul>

              <ul className={styles.list}>
                <li className={styles.listItem}>Facebook</li>
                <li className={styles.listItem}>Twitter</li>
                <li className={styles.listItem}>LinkedIn</li>
                <li className={styles.listItem}>Instagram</li>
              </ul>
            </div>
            <div className={styles.footerBottom}>
              © 2025 {t('footer.rights')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
