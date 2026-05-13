import "../../assets/Pages.css";
import "../../assets/Policies.css";

export default function EscrowPolicy() {
  return (
    <div className="policy-page" dir="rtl">

      <div className="policy-hero">
        <div className="policy-hero-icon">🔐</div>
        <h1>نظام الحساب الوسيط (Escrow)</h1>
        <p>أموالك محفوظة حتى تتأكد — لا خسارة ولا احتيال</p>
      </div>

      <div className="policy-body">

        <div className="policy-highlight">
          <span className="policy-highlight-icon">📊</span>
          <div>
            <strong>95% من مستخدمينا طالبوا بهذا النظام</strong>
            <p>في استبياننا أكد 95% من المشاركين أن ضمان المال قبل الدفع هو أهم عامل للثقة. Escrow يلبي هذا بشكل كامل.</p>
          </div>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">١</span> ما هو نظام Escrow؟</h2>
          <p>Escrow هو <strong>حساب وسيط محايد</strong> يحتفظ بالمبلغ المدفوع من المشتري حتى يتأكد من استلام المنتج وجودته. البائع لا يستلم أمواله إلا بعد تأكيد المشتري — هذا يحمي الطرفين.</p>
          <div className="policy-cards-grid three">
            <div className="policy-card">
              <div className="policy-card-icon">🛍️</div>
              <h3>للمشتري</h3>
              <p>أموالك محفوظة حتى تتأكد من المنتج — لا خسارة إطلاقاً</p>
            </div>
            <div className="policy-card accent">
              <div className="policy-card-icon">🔒</div>
              <h3>للمنصة</h3>
              <p>سجل كامل لكل معاملة يحمي الجميع ويمنع الاحتيال</p>
            </div>
            <div className="policy-card">
              <div className="policy-card-icon">🏪</div>
              <h3>للبائع</h3>
              <p>ضمان الحصول على المال بعد إثبات التوصيل الناجح</p>
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">٢</span> مراحل نظام Escrow</h2>
          <div className="escrow-flow">
            <div className="escrow-step">
              <div className="escrow-step-circle">1</div>
              <div className="escrow-step-content">
                <h3>الدفع</h3>
                <p>يدفع المشتري ← المبلغ يُحجز في الحساب الوسيط</p>
              </div>
            </div>
            <div className="escrow-arrow">↓</div>
            <div className="escrow-step">
              <div className="escrow-step-circle">2</div>
              <div className="escrow-step-content">
                <h3>إشعار البائع</h3>
                <p>البائع يستلم إشعار الطلب الجديد ويجهز المنتج</p>
              </div>
            </div>
            <div className="escrow-arrow">↓</div>
            <div className="escrow-step">
              <div className="escrow-step-circle">3</div>
              <div className="escrow-step-content">
                <h3>الشحن</h3>
                <p>البائع يشحن المنتج عبر Bosta ويصل رقم التتبع</p>
              </div>
            </div>
            <div className="escrow-arrow">↓</div>
            <div className="escrow-step highlight-step">
              <div className="escrow-step-circle green">4</div>
              <div className="escrow-step-content">
                <h3>المعاينة مع المندوب 🌟</h3>
                <p>المشتري يعاين المنتج في وجود المندوب قبل تأكيد الاستلام</p>
              </div>
            </div>
            <div className="escrow-arrow">↓</div>
            <div className="escrow-split">
              <div className="escrow-step yes-step">
                <div className="escrow-step-circle green">✓</div>
                <div className="escrow-step-content">
                  <h3>تأكيد الاستلام</h3>
                  <p>الأموال تُحوَّل للبائع فوراً (90% له — 10% عمولة)</p>
                </div>
              </div>
              <div className="escrow-step no-step">
                <div className="escrow-step-circle red">✗</div>
                <div className="escrow-step-content">
                  <h3>رفض المنتج</h3>
                  <p>المندوب يأخذ المنتج فوراً والمبلغ يُعاد للمشتري</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">٣</span> توزيع الأموال عند التأكيد</h2>
          <div className="policy-table">
            <div className="policy-table-row header">
              <span>البند</span>
              <span>النسبة / المدة</span>
            </div>
            <div className="policy-table-row">
              <span>عمولة EcoBazaar</span>
              <span>10% تُخصم تلقائياً</span>
            </div>
            <div className="policy-table-row">
              <span>صافي أرباح البائع</span>
              <span className="green-text">90% تُحوَّل فوراً ✓</span>
            </div>
            <div className="policy-table-row">
              <span>حالة عدم الرد (14 يوم)</span>
              <span>تُحرَّر الأموال تلقائياً للبائع</span>
            </div>
            <div className="policy-table-row">
              <span>الحد الأدنى للسحب</span>
              <span>100 جنيه مصري</span>
            </div>
            <div className="policy-table-row">
              <span>مدة معالجة السحب</span>
              <span>1-3 أيام عمل</span>
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">٤</span> في حالة النزاع</h2>
          <div className="policy-steps">
            <div className="policy-step">
              <span className="step-num">1</span>
              <span>المشتري يفتح بلاغاً مع الصور والأدلة</span>
            </div>
            <div className="policy-step">
              <span className="step-num">2</span>
              <span>الأموال تُوقف مؤقتاً خلال فترة المراجعة</span>
            </div>
            <div className="policy-step">
              <span className="step-num">3</span>
              <span>فريق EcoBazaar يراجع النزاع خلال 24-48 ساعة</span>
            </div>
            <div className="policy-step">
              <span className="step-num">4</span>
              <span>القرار النهائي بناءً على الأدلة — إعادة للمشتري أو تحرير للبائع</span>
            </div>
          </div>
        </div>

        <div className="policy-footer-note">
          <strong>بسيط. آمن. مستدام. 🌿</strong>
          <p>نظام Escrow يجعل EcoBazaar الأكثر أماناً في سوق المنتجات البيئية في مصر.</p>
        </div>

        <div className="policy-contact-bar">
          <span>📧 info@ecobazaar.com</span>
          <span>📞 20+ 123 456 7890</span>
        </div>

      </div>
    </div>
  );
}