import "../../assets/Features.css";

const features = [
  {
    icon: "🌿",
    title: "منتجات بيئية",
    desc: "جميع منتجاتنا صديقة للبيئة",
  },
  {
    icon: "🛡️",
    title: "دفع آمن",
    desc: "حماية كاملة للمدفوعات",
  },
  {
    icon: "🚚",
    title: "شحن سريع",
    desc: "توصيل لجميع أنحاء الجمهورية",
  },
];

export default function Features() {
  return (
    <section className="features">
      <div className="section-container">
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}