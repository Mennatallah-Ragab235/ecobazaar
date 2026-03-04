import "../../assets/Categories.css";

const categories = [
  { icon: "🧴", name: "العناية الشخصية", count: 120 },
  { icon: "🏠", name: "المنزل والحديقة", count: 85 },
  { icon: "👕", name: "الأزياء المستدامة", count: 200 },
  { icon: "🥗", name: "الأطعمة العضوية", count: 150 },
];

export default function Categories() {
  return (
    <section className="categories" id="products">
      <div className="section-container">
        <div className="section-header">
          <h2>تصفح حسب الفئة</h2>
          <p>اكتشف منتجاتك المفضلة من خلال فئاتنا المتنوعة</p>
        </div>
        <div className="categories-grid">
          {categories.map((cat, i) => (
            <div className="category-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="cat-icon">{cat.icon}</span>
              <h3 className="cat-name">{cat.name}</h3>
              <p className="cat-count">{cat.count} منتج</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}