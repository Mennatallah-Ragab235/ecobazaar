import { useLocation, useNavigate } from "react-router-dom";

export default function SellerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: "📦", label: "المنتجات", path: "/seller/products" },
    { icon: "🛒", label: "الطلبات", path: "/seller/orders" },
    { icon: "💰", label: "الإيرادات", path: "/seller/revenue" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="SellerSidebar">
      <nav className="ap-nav">
        {navItems.map((item) => (
          <div
            key={item.path}
            className={`ap-nav-item ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            <span className="ap-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

        <div
          className="ap-nav-item"
          onClick={() => navigate("/seller/addproduct")}
        >
          <span className="ap-nav-icon">➕</span>
          <span>إضافة منتج</span>
        </div>
      </nav>

      <span id="ap-nav-logout" onClick={handleLogout}>
        ← تسجيل الخروج
      </span>
    </aside>
  );
}