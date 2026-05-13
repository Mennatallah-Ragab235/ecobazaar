import "../../assets/Pages.css";
import "../../assets/Policies.css";


export default function PrivacyPolicy() {
  return (
    <div className="policy-page" dir="rtl">

      <div className="policy-hero">
        <div className="policy-hero-icon">🔒</div>
        <h1>سياسة الخصوصية وحماية البيانات</h1>
        <p>بياناتك ملكك — نحميها كما نحمي البيئة</p>
      </div>

      <div className="policy-body">

        <div className="policy-highlight">
          <span className="policy-highlight-icon">🛡️</span>
          <div>
            <strong>التزامنا بخصوصيتك</strong>
            <p>لا نبيع بياناتك لأي طرف — إطلاقاً. بياناتك تُستخدم فقط لتحسين تجربتك وتنفيذ طلباتك.</p>
          </div>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">١</span> البيانات التي نجمعها</h2>
          <div className="policy-cards-grid">
            <div className="policy-card">
              <div className="policy-card-icon">👤</div>
              <h3>بيانات التسجيل</h3>
              <p>الاسم — البريد الإلكتروني — رقم الهاتف — العنوان — كلمة المرور (مشفّرة بالكامل)</p>
            </div>
            <div className="policy-card">
              <div className="policy-card-icon">🛒</div>
              <h3>بيانات المعاملات</h3>
              <p>سجل الطلبات — عناوين التوصيل (بيانات الدفع تُعالَج بواسطة Paymob ولا تُخزَّن لدينا)</p>
            </div>
            <div className="policy-card">
              <div className="policy-card-icon">📱</div>
              <h3>بيانات الاستخدام</h3>
              <p>المنتجات التي تصفحتها — التقييمات — بيانات الجهاز للأمان فقط</p>
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">٢</span> كيف نستخدم بياناتك</h2>
          <div className="policy-table">
            <div className="policy-table-row header">
              <span>الغرض</span>
              <span>التفاصيل</span>
            </div>
            <div className="policy-table-row">
              <span>تنفيذ طلباتك</span>
              <span>الشحن — التواصل مع المندوب — الإشعارات</span>
            </div>
            <div className="policy-table-row">
              <span>خدمة العملاء</span>
              <span>حل النزاعات والرد على الاستفسارات</span>
            </div>
            <div className="policy-table-row">
              <span>تحسين المنصة</span>
              <span>تطوير تجربة المستخدم وتحليل الاستخدام</span>
            </div>
            <div className="policy-table-row">
              <span>الأمان</span>
              <span>كشف الاحتيال وحماية حسابك</span>
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">٣</span> مشاركة البيانات</h2>
          <div className="policy-list">
            <div className="policy-list-item yes">✓ Bosta للشحن: الاسم والعنوان فقط لتوصيل طلبك</div>
            <div className="policy-list-item yes">✓ Paymob للدفع: يعالج بياناتك مباشرة على خوادمه الآمنة</div>
            <div className="policy-list-item no">✗ لا نبيع بياناتك لأي طرف ثالث</div>
            <div className="policy-list-item no">✗ لا نشارك بياناتك مع أي جهات تسويقية خارجية</div>
          </div>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">٤</span> حقوقك كمستخدم</h2>
          <div className="policy-rights-grid">
            <div className="policy-right-item">
              <span className="right-icon">📋</span>
              <h3>حق الوصول</h3>
              <p>طلب نسخة من جميع بياناتك المخزنة لدينا</p>
            </div>
            <div className="policy-right-item">
              <span className="right-icon">✏️</span>
              <h3>حق التصحيح</h3>
              <p>تعديل بياناتك في أي وقت من صفحة حسابك</p>
            </div>
            <div className="policy-right-item">
              <span className="right-icon">🗑️</span>
              <h3>حق الحذف</h3>
              <p>طلب حذف حسابك وجميع بياناتك نهائياً</p>
            </div>
            <div className="policy-right-item">
              <span className="right-icon">🔕</span>
              <h3>حق الاعتراض</h3>
              <p>إيقاف الرسائل التسويقية في أي وقت</p>
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h2><span className="policy-num">٥</span> أمان البيانات</h2>
          <div className="policy-list">
            <div className="policy-list-item yes">✓ تشفير SSL/HTTPS لجميع البيانات المنقولة</div>
            <div className="policy-list-item yes">✓ تشفير كلمات المرور باستخدام bcrypt</div>
            <div className="policy-list-item yes">✓ لا تُخزَّن بيانات البطاقات البنكية على خوادمنا</div>
            <div className="policy-list-item yes">✓ مراجعة دورية لإجراءات الأمان</div>
          </div>
        </div>

        <div className="policy-contact-bar">
          <span>📧 privacy@ecobazaar.com</span>
          <span>نرد على استفسارات الخصوصية خلال 48 ساعة</span>
        </div>

      </div>
    </div>
  );
}