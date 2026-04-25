import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../assets/Auth.css";

export default function Login() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!form.email || !form.password) {
    setError("Please fill in all fields.");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json(); // ✅ مهم جداً

    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user)); // ← ضيف السطر ده

if (data.user.role === "seller") {
  navigate("/seller/addproduct");
} else if (data.user.role === "admin") {
  navigate("/admin");
} else {
  navigate("/"); // Buyer
}




  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span>🌿</span>
        </div>

        <h1 className="auth-title">تسجيل الدخول</h1>
        <p className="auth-subtitle">
          سجل الدخول الي EcoBazaar وابدأ البيع او الشراء
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              dir="ltr"
            />
          </div>

          <div className="field-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              dir="ltr"

            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : "تسجيل الدخول"}
          </button>
        </form>

        <div className="auth-links">
          <p>ليس لديك حساب ؟</p>
          <p>
            تريد البيع الان ؟{" "}
            <Link to="/register/seller">سجل كبائع</Link>
          </p>
          <p>
            تريد الشراء الان ؟{" "}
            <Link to="/register/buyer">سجل كمشتري</Link>
          </p>
        </div>
      </div>
    </div>
  );
}