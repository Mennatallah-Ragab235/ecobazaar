import "../../assets/Pages.css";
import "../../assets/Policies.css";


export default function ReturnPolicy() {
  return (
    <div className="policy-page" dir="rtl">

      {/* Hero */}
      <div className="policy-hero">
        <div className="policy-hero-icon">↩️</div>
        <h1>سياسة الاسترجاع والاستبدال</h1>
        <p>حقوقك مضمونة — تسوق بثقة وراحة بال</p>
      </div>

      <div className="policy-body">

        {/* Highlight box */}
        <div className="policy-highlight">
          <span className="policy-highlight-icon">🌟</span>
          <div>
            <strong>ضمان EcoBazaar الذهبي</strong>
            <p>في حالة أي مشكلة مشروعة — استرداد كامل بدون أسئلة. نظام Escrow يحمي أموالك حتى تتأكد من المنتج.</p>
          </div>
        </div>

        {/* Section 1 */}
        <div className="policy-section">
          <h2><span className="policy-num">١</span> نظام المعاينة قبل الدفع</h2>
          <p className="policy-survey-note">📊 94% من مستخدمينا يفضلون هذا النظام</p>
          <p>EcoBazaar توفر لك ميزة حصرية: <strong>معاينة المنتج في وجود المندوب قبل الاستلام النهائي.</strong></p>
          <div className="policy-steps">
            <div className="policy-step">
              <span className="step-num">1</span>
              <span>يصل المندوب بالمنتج إلى بابك</span>
            </div>
            <div className="policy-step">
              <span className="step-num">2</span>
              <span>تعاين المنتج وتتأكد من جودته ومطابقته للوصف</span>
            </div>
            <div className="policy-step">
              <span className="step-num">3</span>
              <span>إذا كنت راضياً → تأكد الاستلام وتُحرَّر الأموال للبائع</span>
            </div>
            <div className="policy-step">
              <span className="step-num">4</span>
              <span>إذا رفضت المنتج → يأخذه المندوب فوراً ويُعاد المبلغ كاملاً</span>
            </div>
          </div>
        </div>

       

        <div className="policy-contact-bar">
          <span>📧 info@ecobazaar.com</span>
          <span>📞 20+ 123 456 7890</span>
          <span>🕐 متاحون 7 أيام في الأسبوع</span>
        </div>

      </div>
    </div>
  );
}