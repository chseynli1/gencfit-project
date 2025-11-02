import { Urls } from '../../constants/Urls';
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import { useTranslation } from 'react-i18next';
import logo from "../../../assets/images/gencfit.png";
import fond_logo2 from "../../../assets/images/fond_logo2.png";
import GlobeIcon from '@/assets/images/LanguageSelector.svg';
import { FiSearch } from 'react-icons/fi';
import { useSearch } from '@/context/SearchContext';
import { LogOut } from 'lucide-react';
import { toCanonicalCategory } from "@/shared/utils/categories";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001";
const resolveImg = (src) => (src ? (src.startsWith('http') ? src : `${API_BASE}${src}`) : null);

const Header = ({ onSearchResults }) => {
  const { setResults } = useSearch();
  const [isOpen, setIsOpen] = React.useState(false);
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState(null);
  const [userInitials, setUserInitials] = React.useState('U');

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const { i18n, t, ready } = useTranslation();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const toggleLangMenu = () => setLangMenuOpen((prev) => !prev);
  const toggleSearch = () => setSearchOpen((prev) => !prev);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setLangMenuOpen(false);
  };

  const categories = [
    { name: 'Yoqa və meditasiya', count: '8 zal', image: '/images/yoqa.jpg' },
    { name: 'Fitness', count: '20 zal', image: '/images/fitness.jpg' },
    { name: 'Rəqs kursları', count: '12 zal', image: '/images/dance.jpg' },
    { name: 'Şahmat', count: '22 klub', image: '/images/chess.jpg' },
    { name: 'Döyüş sənətləri', count: '17 zal', image: '/images/fight.jpg' },
    { name: 'Oxçuluq', count: '10 klub', image: '/images/archery.jpg' },
    { name: 'Karting', count: '4 mərkəz', image: '/images/karting.jpg' },
    { name: 'Atçılıq', count: '5 mərkəz', image: '/images/horse.jpg' },
  ];

  // Search suggestions (inline)
  useEffect(() => {
    if (searchText.trim()) {
      const filtered = categories.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
      onSearchResults?.(filtered);
    } else {
      onSearchResults?.([]);
    }
  }, [searchText]);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchText.trim();
    if (!term) return;

    // Canonical tapırıq (Yoqa və meditasiya → Yoga, Rəqs kursları → Rəqs və s.)
    const canonical = toCanonicalCategory(term);
    if (canonical) {
      navigate(`/venues?category=${encodeURIComponent(canonical)}`);
    } else {
      navigate(`/venues?q=${encodeURIComponent(term)}`);
    }

    setSearchOpen(false);
    setSearchText("");
  };

  // Centralized auth state reader
  useEffect(() => {
    const readAuth = () => {
      const storedLogin = localStorage.getItem('isLoggedIn') === 'true';
      const token = localStorage.getItem('token');
      setIsLoggedIn(storedLogin || !!token);

      const savedImg = localStorage.getItem('profile_image');
      setProfileImage(savedImg || null);

      const fullName = localStorage.getItem('fullName') || '';
      if (fullName) {
        const initials = fullName
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0]?.toUpperCase() || '')
          .join('') || 'U';
        setUserInitials(initials);
      } else {
        setUserInitials('U');
      }
    };

    readAuth();
    const onLoginChange = () => readAuth();

    window.addEventListener('loginStatusChanged', onLoginChange);
    window.addEventListener('storage', onLoginChange);
    return () => {
      window.removeEventListener('loginStatusChanged', onLoginChange);
      window.removeEventListener('storage', onLoginChange);
    };
  }, []);

  const handleLogout = () => {
    // Açıq modalda təsdiq üçün saxlayırıq; real çıxış modalın "Bəli" düyməsindədir
    setConfirmOpen(true);
  };

  if (!ready) return null;

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img className={styles.logoImg} src={logo} alt="GencFit" />
        <img className={styles.fondImg} src={fond_logo2} />
      </div>

      <button className={styles.burger} onClick={toggleMenu} aria-label="Menu">
        ☰
      </button>

      <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
        <Link to={Urls.HOME}>{t('home')}</Link>
        <Link to={Urls.ABOUT}>{t('about')}</Link>
        <Link to={Urls.GYMS}>{t('gyms')}</Link>
        <Link to={Urls.PARTNERS}>{t('partners')}</Link>
        <Link to={Urls.BLOG}>{t('blog')}</Link>
        <Link to={Urls.CONTACT}>{t('contact')}</Link>
      </nav>

      <div className={styles.languageWrapper}>
        {/* Search */}
        <div className={`${styles.searchWrapper} ${searchOpen ? styles.open : ''}`} ref={searchRef}>
          {!searchOpen && (
            <button className={styles.searchBtn} onClick={toggleSearch} aria-label="Search">
              <FiSearch size={20} />
            </button>
          )}
          {searchOpen && (
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                placeholder={t('search')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoFocus
              />
              <button type="submit" aria-label="Submit search">
                <FiSearch size={20} />
              </button>
            </form>
          )}
          {searchOpen && searchText && (
            <ul className={styles.suggestions}>
              {categories
                .filter((c) =>
                  c.name.toLowerCase().includes(searchText.toLowerCase())
                )
                .map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      const canonical = toCanonicalCategory(item.name);
                      if (canonical)
                        navigate(`/venues?category=${encodeURIComponent(canonical)}`);
                      else
                        navigate(`/venues?q=${encodeURIComponent(item.name)}`);
                      setSearchOpen(false);
                      setSearchText("");
                    }}
                  >
                    {item.name}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Language */}
        <div className={styles.languageSelector}>
          <button onClick={toggleLangMenu} className={styles.langBtn} aria-label="Change language">
            <img src={GlobeIcon} alt="language selector" width={24} height={24} />
          </button>
          {langMenuOpen && (
            <ul className={styles.dropdown}>
              <li onClick={() => handleLanguageChange('az')}>AZ</li>
              <li onClick={() => handleLanguageChange('en')}>EN</li>
              <li onClick={() => handleLanguageChange('ru')}>RU</li>
            </ul>
          )}
        </div>

        {/* Auth / Profile */}
        <div className={styles.authWrapper}>
          {isLoggedIn ? (
            <>
              <Link to="/profile" title="Profilə keç">
                {profileImage ? (
                  <img
                    src={resolveImg(profileImage)}
                    alt="Profile"
                    className={styles.profileAvatar}
                    onError={(e) => {
                      // Şəkil açılmırsa avtomatik baş hərflərə keçək
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <button className={styles.profileCircleBtn} aria-label="Profile initials">
                    {userInitials}
                  </button>
                )}
              </Link>

              {/* Logout ikon düyməsi */}
              <button
                className={styles.logoutIconBtn}
                onClick={handleLogout}
                aria-label="Logout"
                title="Çıxış"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link to={Urls.LOGIN}>
              <button className={styles.register}>{t('registerText')}</button>
            </Link>
          )}
        </div>
      </div>

      {/* Logout təsdiq modalı */}
      {confirmOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>Çıxmaq istədiyinizə əminsinizmi?</h3>
            <p className={styles.modalText}>
              Hesabdan çıxış etdikdən sonra yenidən daxil olmalı olacaqsınız.
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.modalBtnSecondary}
                onClick={() => setConfirmOpen(false)}
              >
                Xeyr
              </button>
              <button
                className={styles.modalBtnPrimary}
                onClick={() => {
                  // Real logout
                  localStorage.removeItem('isLoggedIn');
                  localStorage.removeItem('token');
                  localStorage.removeItem('fullName');
                  localStorage.removeItem('profile_image');

                  setIsLoggedIn(false);
                  setProfileImage(null);
                  setUserInitials('U');
                  setConfirmOpen(false);

                  navigate('/');
                  window.dispatchEvent(new Event('loginStatusChanged'));
                }}
              >
                Bəli
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
