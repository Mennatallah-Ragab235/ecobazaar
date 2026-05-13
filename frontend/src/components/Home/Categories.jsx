import "../../assets/Categories.css";
import { useNavigate } from "react-router-dom";

export const CATEGORIES = [
  { value: "العناية الشخصية", label: "العناية الشخصية", icon: "🧴" },
  { value: "المنزل والحديقة", label: "المنزل والحديقة", icon: "🏠" },
  { value: "العطور والشموع الطبيعية", label: "العطور والشموع الطبيعية", icon: "🕯️" },
  { value: "الحرف اليدوية", label: "الحرف اليدوية", icon: "🧺" },
];

// ✔️ أضيفي ده (ده اللي كان ناقص)
export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value);



export default function Categories({ selectedCategory, setSelectedCategory }) {
  const navigate = useNavigate();


  return (
    
    <section className="categories" id="products">
      <div className="section-container">
        <div className="section-header">
          <h2>تصفح حسب الفئة</h2>
          <p>اكتشف منتجاتك المفضلة من خلال فئاتنا المتنوعة</p>
        </div>

        <div className="categories-grid">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.value}
              className={`category-card ${
                selectedCategory === cat.value ? "active" : ""
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
           onClick={() => {
  navigate(`/products?category=${encodeURIComponent(cat.value)}`);
}}
            >
              <span className="cat-icon">{cat.icon}</span>
              <h3 className="cat-name">{cat.label}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
