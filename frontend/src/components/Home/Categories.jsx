import "../../assets/Categories.css";


export const CATEGORIES = [
  { value: "العناية الشخصية", label: "العناية الشخصية", icon: "🧴" },
  { value: "المنزل والحديقة", label: "المنزل والحديقة", icon: "🏠" },
  { value: "الملابس والأزياء", label: "الملابس والأزياء", icon: "👕" },
  { value: "الأطعمة العضوية", label: "الأطعمة العضوية", icon: "🥗" },
];

// ✔️ أضيفي ده (ده اللي كان ناقص)
export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value);



export default function Categories({ selectedCategory, setSelectedCategory }) {
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
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.value ? "" : cat.value
                )
              }
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
