import "../../assets/Admin.css";
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
    { icon: <FaBox />, label: "المنتجات", path: "/admin/products" },
    { icon: <FaShoppingCart />, label: "الطلبات", path: "/admin/orders" },
    { icon: <FaStore />, label: "البائعين", path: "/admin/sellers" },
    { icon: <FaUsers />, label: "المشترين", path: "/admin/buyers" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={location.pathname === item.path ? "active" : ""}
              onClick={() => navigate(item.path)}
              style={{ cursor: "pointer" }}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="bottom">
        <span className="logout" onClick={handleLogout} style={{ cursor: "pointer" }}>
          <FaSignOutAlt className="icon" />
          <p>تسجيل الخروج</p>
        </span>
      </div>
    </aside>
  );
}

export default Aside;