import "../../assets/Pages.css";

export default function ContactUsPage() {
  return (
    <div className="page-container">

      <h1>📩 اتصل بنا</h1>

      <p className="sub-text">
        لو عندك أي استفسار أو مشكلة، تقدر تتواصل معانا مباشرة عبر البريد الإلكتروني 💚
      </p>

      <div className="contact-card">

        <div className="contact-item">
          <span>📧 البريد الإلكتروني:</span>

          <a href="mailto:support@ecobazaar.com">
            support@ecobazaar.com
          </a>
        </div>

        <div className="contact-item">
          <span>📱 الهاتف:</span>
          <p>01000000000</p>
        </div>

      </div>

    </div>
  );
}