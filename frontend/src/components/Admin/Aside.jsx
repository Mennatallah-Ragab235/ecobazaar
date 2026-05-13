import "../../assets/AdminLayout.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaThLarge, FaBox, FaShoppingCart,
  FaStore, FaUsers, FaSignOutAlt,
} from "react-icons/fa";

function Aside() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <FaThLarge />, label: "لوحة التحكم", path: "/admin" },
    { icon: <FaBox />,     label: "المنتجات",    path: "/admin/products" },
    { icon: <FaShoppingCart />, label: "الطلبات", path: "/admin/orders" },
    { icon: <FaStore />,   label: "البائعين",    path: "/admin/sellers" },
    { icon: <FaUsers />,   label: "المشترين",    path: "/admin/buyers" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="AdminSidebar">
      <nav className="ap-nav">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`ap-nav-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="ap-nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div id="ap-nav-logout" onClick={handleLogout}>
        <span className="ap-nav-icon"><FaSignOutAlt /></span>
        تسجيل الخروج
      </div>
    </aside>
  );
}

export default Aside;