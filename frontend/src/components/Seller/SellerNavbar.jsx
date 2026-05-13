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
  <img src="/images/Logo.png"  
        
        alt="EcoBazaar Logo"
        className="ap-logo"
    />
             <div>
          <div className="ap-logo-name">EcoBazaar</div>
          <div className="ap-logo-sub">لوحة البائع</div>
        </div>
      </div>

      <div className="ap-navbar-right">
        <div className="profile-wrapper">
          <button className="nav-btn user-btn">
            👤 {user?.storeName}
          </button>

          <button onClick={handleLogout} className="logout-btn">
            خروج
          </button>
        </div>
      </div>
    </div>
  );
}