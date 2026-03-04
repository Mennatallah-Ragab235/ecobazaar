import "../../assets/Stats.css";

const stats = [
  { value: "1000+", label: "منتج صديق للبيئة" },
  { value: "500+", label: "بائع محلي" },
  { value: "10K+", label: "عميل راضٍ" },
  { value: "50K+", label: "طلب منجز" },
];

export default function Stats() {
  return (
    <section className="stats">
      {stats.map((s, i) => (
        <div className="stat-item" key={i}>
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </section>
  );
}