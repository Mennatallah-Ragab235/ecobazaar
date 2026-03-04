
import "../../assets/Hero.css";
import "./Featuredproducts.jsx"
export default function Hero() {
  return (
    <section className="hero" >
      <div className="hero-content">
        <span className="hero-badge">🌱 منصة التجارة البيئية الأولى في مصر</span>
        <h1 className="hero-title">تسوّق منتجات صديقة للبيئة</h1>
        <p className="hero-desc">
          اكتشف مجموعة واسعة من المنتجات المستدامة من بائعين محليين موثوقين. معاً نبني مستقبلاً أخضر.
        </p>
        <div className="hero-actions">
        <a href="#featured-products" class="btn-primary">تصفح المنتجات</a>
          <a href="#join-section" className="btn-secondary">انضم إلينا</a>
        </div>
      </div>
      <div className="hero-image">
        <img
          src="../images/Eco-friendly products.jpg"
          alt="Eco products"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1542601906897-f3b0b3e63c3e?w=700&q=80";
          }}
        />
      </div>
    </section>
  );
}