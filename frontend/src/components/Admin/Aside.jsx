import "../../assets/Admin.css";
import { useNavigate } from "react-router-dom"; // ← مهم جدًا

import {
    FaThLarge,
    FaBox,
    FaShoppingCart,
    FaStore,
    FaUsers,
    FaCog,
    FaSignOutAlt,
  } from "react-icons/fa";
  



  function Aside() {
const navigate = useNavigate(); // لازم داخل الـ component

  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login"); // توجيه لصفحة login
  };

    return (
      <aside className="sidebar">
        <div>
          
          <ul>
            <li>
              <FaThLarge className="icon" />
              لوحة التحكم
            </li>
            <li className="active">
              <FaBox className="icon" />
              المنتجات
            </li>
            <li>
              <FaShoppingCart className="icon" />
              الطلبات
            </li>
            <li>
              <FaStore className="icon" />
              البائعين
            </li>
            <li>
              <FaUsers className="icon" />
              المشترين
            </li>
          </ul>
        </div>
  
        <div className="bottom">
          
  
          <span className="logout">
            <FaSignOutAlt className="icon" />
            <p onClick={handleLogout}>← تسجيل الخروج</p>
          </span>
        </div>
      </aside>
    );
  }
  
  export default Aside;