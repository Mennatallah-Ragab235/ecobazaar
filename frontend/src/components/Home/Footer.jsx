import { useNavigate } from "react-router-dom";
import "../../assets/Footer.css";

export default function Footer() {
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">

      <div className="footer-top">

        <div className="footer-brand">
          <div className="footer-logo">
            <span>🌿</span> EcoBazaar
          </div>
          <p>منصتك الموثوقة للمنتجات الصديقة للبيئة</p>
        </div>

        {/* ── روابط سريعة ── */}
        <div className="footer-col">
          <h4>روابط سريعة</h4>
          <ul>
            <li onClick={() => goTo("/")}>الرئيسية</li>
            <li onClick={() => goTo("/products")}>تصفح المنتجات</li>
            <li onClick={() => goTo("/policies/about")}>من نحن</li>
            <li onClick={() => goTo("/policies/contact")}>اتصل بنا</li>
          </ul>
        </div>

        {/* ── خدمة العملاء ── */}
        <div className="footer-col">
          <h4>خدمة العملاء</h4>
          <ul>
            <li onClick={() => goTo("/policies/return-policy")}>سياسة الاسترجاع والاستبدال</li>
            <li onClick={() => goTo("/policies/privacy-policy")}>سياسة الخصوصية</li>
            <li onClick={() => goTo("/policies/sellers-policy")}>سياسة البائعين</li>
            <li onClick={() => goTo("/policies/escrow-policy")}>نظام الحساب الوسيط</li>
          </ul>
        </div>

        {/* ── تواصل ── */}
        <div className="footer-col">
          <h4>تواصل معنا</h4>
          <p className="footer-contact">
            <a href="mailto:info@ecobazaar.com">info@ecobazaar.com</a>
          </p>
          <p className="footer-contact">+20 123 456 7890</p>
          <p className="footer-contact">القاهرة – مصر</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2024 EcoBazaar. جميع الحقوق محفوظة.</p>
      </div>

    </footer>
  );
}