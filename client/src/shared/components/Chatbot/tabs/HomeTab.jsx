import React, { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import styles from "./HomeTab.module.scss";

// FAQ nümunə datası. Siz backend-dən və ya fayldan dolduracaqsınız.
const SAMPLE_FAQ = [
    { q: "Gəncfit nədir?", a: "Gəncfit idman və əyləncə məkanlarını birləşdirən platformadır." },
    { q: "Hansı yaş qrupları istifadə edə bilər?", a: "Bütün yaş qrupları üçün açıqdır, valideyn icazəsi tələb oluna bilər." },
    { q: "Ödənişlidirmi?", a: "Əsas istifadə pulsuzdur, bəzi premium xüsusiyyətlər ödənişlidir." },
];


const HomeTab = ({ items = SAMPLE_FAQ }) => {
    const [query, setQuery] = useState("");
    const [openIndex, setOpenIndex] = useState(null);


    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return items.filter((i) => i.q.toLowerCase().includes(q));
    }, [items, query]);


    return (
        <div className={styles.homeTab}>
            <p className={styles.lead}>Gəncfit haqqında ən çox soruşulanlara cavablar buradadır.</p>


            <div className={styles.searchBox}>
                <Search size={18} />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Kömək üçün axtarın.."
                    aria-label="FAQ axtar"
                />
            </div>


            <div className={styles.accordion}>
                {filtered.map((item, idx) => {
                    const open = idx === openIndex;
                    return (
                        <div key={idx} className={`${styles.accItem} ${open ? styles.open : ""}`}>
                            <button
                                className={styles.accHeader}
                                onClick={() => setOpenIndex(open ? null : idx)}
                                aria-expanded={open}
                            >
                                <span>{item.q}</span>
                                <ChevronDown size={18} />
                            </button>
                            <div className={styles.accPanel} role="region">
                                <p>{item.a}</p>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className={styles.empty}>Nəticə tapılmadı.</div>
                )}
            </div>
        </div>
    );
};
export default HomeTab;