import { useNavigate } from "react-router-dom";

export default function SellerNavbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="ap-navbar">
      <div className="ap-navbar-left">
        <span className="ap-logo-icon">🌿</span>
        <div>
          <div className="ap-logo-name">EcoBazaar</div>
          <div className="ap-logo-sub">لوحة البائع</div>
        </div>
      </div>

      <div className="ap-navbar-right">
        <div className="profile-wrapper">
          <button className="nav-btn user-btn">
            👤 {user?.fullName}
          </button>

          <button onClick={handleLogout} className="logout-btn">
            خروج
          </button>
        </div>
      </div>
    </div>
  );
}