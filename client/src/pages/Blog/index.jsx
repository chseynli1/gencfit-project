import { useEffect, useState } from "react";
import api from "@/api";
import { Spin } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./Blog.module.scss";
import { blogTranslations } from "../../../public/locales/blogTranslations.js";

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    api
      .get("/blogs?page=1&limit=30")
      .then((res) => {
        const blogs = (res.data.data || []).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setBlogs(blogs);
      })
      .catch((err) => console.error("Blog fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <Spin size="large" tip={t("loading")} />
      </div>
    );
  }


  const categories = [
    { key: "idman-sağlamlıq", title: t("categories.idman-saglamliq") },
    { key: "motivasiya", title: t("categories.motivasiya") },
    { key: "incəsənət", title: t("categories.incesenet") }
  ];

  return (
    <div className={styles.blogs}>
      {categories.map((cat) => {
        const filteredBlogs = blogs.filter((b) => b.category === cat.key);
        if (!filteredBlogs.length) return null;

        return (
          <section
            key={cat.key}
            className={`${styles.categorySection} ${styles[cat.key]}`}
          >
            <div className={styles.blogsTitle}>
              <h2 className={styles.blogsHeader}>{cat.title}</h2>
              <span className={styles.line}></span>
            </div>
            <div className={styles.blogsCards}>
              {filteredBlogs.map((blog) => {
                const translated = blogTranslations[blog.id];
                const title =
                  i18n.language === "az"
                    ? blog.title
                    : translated?.title[i18n.language] || blog.title;
                const content =
                  i18n.language === "az"
                    ? blog.content
                    : translated?.content[i18n.language] || blog.content;

                return (
                  <div key={blog.id} className={styles.blogsCard}>
                    {blog.image && (
                      <img
                        src={blog.image}
                        alt={title}
                        className={styles.blogsImg}
                      />
                    )}
                    <div className={styles.blogsContent}>
                      <h3 className={styles.title}>{title}</h3>
                      <p className={styles.subtitle}>{content.slice(0, 82)}...</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default BlogPage;
