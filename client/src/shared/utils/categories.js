// src/utils/categories.js
export const CATEGORY_KEYWORDS = {
  Fitness: ["fitness", "gym", "muscle", "fitnes"],
  "Rəqs": ["rəqs", "reqs", "dance", "ballet", "balet", "latın", "latin"],
  Pilates: ["pilates", "reformer"],
  Yoga: ["yoga", "yogi", "yoqa", "meditasiya", "meditation"],
  Atçılıq: ["atçılıq", "atcilig", "horse", "equine", "manez", "stables"],
  Karting: ["karting", "kart", "sürət", "suret", "track"],
  "Dövrlər": ["crossfit", "wod", "interval", "functional"],
  "Döyüş idm.": ["mma", "boks", "taekvondo", "karate", "judo", "kickboks"],
};

export const normalize = (s = "") =>
  s.toLowerCase()
    .replaceAll("ə", "e").replaceAll("ı", "i").replaceAll("ö", "o")
    .replaceAll("ü", "u").replaceAll("ş", "s").replaceAll("ç", "c").replaceAll("ğ", "g")
    .trim();

export const toCanonicalCategory = (raw = "") => {
  const bag = normalize(raw);
  // Tam ad uyğunluğu varsa
  for (const cat of Object.keys(CATEGORY_KEYWORDS)) {
    if (normalize(cat) === bag) return cat;
  }
  // “Yoqa və meditasiya” kimi halları canonical-a xəritələ
  if (bag.includes("yoqa") || bag.includes("yoga")) return "Yoga";
  if (bag.includes("reqs") || bag.includes("rəqs") || bag.includes("dance")) return "Rəqs";
  if (bag.includes("doyus")) return "Döyüş idm.";
  // tapılmazsa olduğu kimi qaytar (amma adətən boş olur)
  return "";
};

// API obyektindən kateqoriya törət
export const deriveCategory = (v = {}) => {
  const bag = normalize(
    `${v?.name || ""} ${v?.title || ""} ${v?.description || ""} ${v?.about || ""} ${v?.tags?.join?.(" ") || ""}`
  );
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((kw) => bag.includes(normalize(kw)))) return cat;
  }
  if (v?.venue_type === "entertainment") return "Əyləncə";
  if (v?.venue_type === "sports") return "İdman";
  return "Digər";
};
