import "../../assets/JoinSection.css";
import { useNavigate } from "react-router-dom";

export default function JoinSection() {
  const navigate = useNavigate();
  return (
    <section className="join-section" id="join-section">
      <div className="section-container">
        <div className="section-header">
          <h2>انضم إلى EcoBazaar</h2>
          <p>اختر كيف تريد أن تكون جزءاً من مجتمعنا البيئي</p>
        </div>
        <div className="join-cards">
          <div className="join-card">
            <div className="join-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h3>انضم كمشتري</h3>
            <p>تسوق منتجات صديقة للبيئة من بائعين موثوقين</p>
            <ul className="join-features">
              <li>✓ الوصول لآلاف المنتجات</li>
              <li>✓ دفع آمن وحماية كاملة</li>
              <li>✓ شحن سريع</li>
            </ul>
            <button className="btn-join" onClick={() => navigate("/register/buyer")}>
              ← سجل كمشتري الآن
            </button>
          </div>
          <div className="join-card">
            <div className="join-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h3>انضم كبائع</h3>
            <p>ابدأ ببيع منتجاتك الصديقة للبيئة اليوم</p>
            <ul className="join-features">
              <li>✓ وصول لآلاف العملاء</li>
              <li>✓ عمولة تنافسية</li>
              <li>✓ دعم في متواصل</li>
            </ul>
            <button className="btn-join" onClick={() => navigate("/register/seller")}>
              ← سجل كبائع الآن
            </button>
          </div>
        </div>
        <div className="already-have-account  btn-join  join-icon">
                        <p onClick={() => navigate("/login")}>               ← تسجيل الدخول   </p>

              {" "} <span> لديك حساب بالفعل؟ </span>
             
        </div>
      </div>
    </section>
  );
}