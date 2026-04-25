import "../../assets/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <span>🌿</span> EcoBazaar
          </div>
          <p>منصتك الموثوقة للمنتجات الصديقة للبيئة</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>روابط سريعة</h4>
          <ul>
            <li><a href="#">الرئيسية</a></li>
            <li><a href="#">تصفح المنتجات</a></li>
            <li><a href="#join-section">انضم إلينا</a></li>
            <li><a href="#">اتصل بنا</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>خدمة العملاء</h4>
          <ul>
            <li><a href="#">مركز المساعدة</a></li>
            <li><a href="#">سياسة الشحن</a></li>
            <li><a href="#">التوصيل</a></li>
            <li><a href="#">سياسة الخصوصية</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>تواصل معنا</h4>
          <p className="footer-contact">info@ecobazaar.com</p>
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