import "../../assets/Pages.css";
import "../../assets/Policies.css";

export default function SellersPolicy() {
  return (
    <div className="policy-page" dir="rtl">

      <div className="policy-hero">
        <div className="policy-hero-icon">🏪</div>
        <h1>سياسة البائعين والتحقق منهم</h1>
        <p>منصة انتقائية — نقبل الأفضل لضمان ثقة مشتريينا</p>
      </div>

      <div className="policy-body">

        <div className="policy-highlight">
          <span className="policy-highlight-icon">🌿</span>
          <div>
            <strong>EcoBazaar ليست سوقاً مفتوحاً</strong>
            <p>كل بائع يمر بعملية تحقق صارمة لضمان أن جميع المنتجات صديقة للبيئة وذات جودة عالية.</p>
          </div>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">١</span> شروط القبول كبائع</h2>
          <div className="policy-list">
            <div className="policy-list-item yes">✓ منتجاتك طبيعية أو هاند ميد أو صديقة للبيئة</div>
            <div className="policy-list-item yes">✓ تقديم هوية شخصية سارية للتحقق</div>
            <div className="policy-list-item yes">✓ تقديم صور حقيقية للمنتجات عند التسجيل</div>
            <div className="policy-list-item yes">✓ الموافقة الكاملة على شروط الخدمة وسياسات المنصة</div>
            <div className="policy-list-item no">✗ لا يُسمح ببيع منتجات تحتوي على مواد ضارة بالبيئة</div>
          </div>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">٢</span> عملية مراجعة المنتجات</h2>
          <div className="policy-steps">
            <div className="policy-step">
              <span className="step-num">1</span>
              <span>ترفع المنتج مع صور حقيقية ووصف مفصل</span>
            </div>
            <div className="policy-step">
              <span className="step-num">2</span>
              <span>فريق EcoBazaar يراجع المنتج خلال 48 ساعة عمل</span>
            </div>
            <div className="policy-step">
              <span className="step-num">3</span>
              <span>التحقق من: الصور الحقيقية — المكونات — الوصف الدقيق</span>
            </div>
            <div className="policy-step">
              <span className="step-num">4</span>
              <span>المنتج المقبول يظهر في المتجر مباشرة</span>
            </div>
            <div className="policy-step">
              <span className="step-num">5</span>
              <span>المنتج المرفوض يصله توضيح بأسباب الرفض وإمكانية التعديل</span>
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">٣</span> معايير جودة المنتجات</h2>
          <div className="policy-table">
            <div className="policy-table-row header">
              <span>المعيار</span>
              <span>المطلوب</span>
            </div>
            <div className="policy-table-row">
              <span>الصور</span>
              <span>حقيقية وواضحة — لا صور مستعارة من الإنترنت</span>
            </div>
            <div className="policy-table-row">
              <span>الوصف</span>
              <span>دقيق ومفصل — المكونات — طريقة الاستخدام — الصلاحية</span>
            </div>
            <div className="policy-table-row">
              <span>التسعير</span>
              <span>عادل ومنطقي — لا تلاعب بالأسعار</span>
            </div>
            <div className="policy-table-row">
              <span>المخزون</span>
              <span>تحديث الكميات فوراً عند النفاد</span>
            </div>
            <div className="policy-table-row">
              <span>الاستجابة</span>
              <span>الرد على طلبات الشحن خلال 24 ساعة</span>
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">٤</span> العمولة والرسوم</h2>
          <div className="policy-cards-grid">
            <div className="policy-card accent">
              <div className="policy-card-icon">💰</div>
              <h3>عمولة المبيعات</h3>
              <p className="big-num">10%</p>
              <p>من قيمة كل عملية بيع ناجحة فقط</p>
            </div>
            <div className="policy-card">
              <div className="policy-card-icon">🆓</div>
              <h3>رسوم التسجيل</h3>
              <p className="big-num">مجانية</p>
              <p>لا رسوم للانضمام أو الاشتراك</p>
            </div>
            <div className="policy-card">
              <div className="policy-card-icon">⭐</div>
              <h3>المنتجات المميزة</h3>
              <p>Featured Products</p>
              <p>رسوم إضافية حسب المدة والموضع</p>
            </div>
          </div>
          <p style={{marginTop:"16px", color:"#555", fontSize:"14px"}}>
            💡 يُحوَّل صافي أرباحك (90%) فور تأكيد المشتري للاستلام عبر نظام Escrow الآمن.
          </p>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">٥</span> أسباب إيقاف أو حذف الحساب</h2>
          <div className="policy-list">
            <div className="policy-list-item no">✗ رفع منتجات مخالفة لمعايير البيئة أو الجودة</div>
            <div className="policy-list-item no">✗ التواصل مع المشترين خارج المنصة للتحايل على نظام الدفع</div>
            <div className="policy-list-item no">✗ تقييمات سلبية متكررة دون تحسين (أقل من 2.5 نجمة)</div>
            <div className="policy-list-item no">✗ الاحتيال أو تقديم معلومات مضللة</div>
            <div className="policy-list-item no">✗ رفض الاستجابة للشكاوى أو طلبات الاسترجاع المشروعة</div>
          </div>
        </div>

        <div className="policy-contact-bar">
          <span>📧 sellers@ecobazaar.com</span>
          <span>انضم الآن وابدأ البيع لجمهور مهتم فعلاً بالاستدامة</span>
        </div>

      </div>
    </div>
  );
}