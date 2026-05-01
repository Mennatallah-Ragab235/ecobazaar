import "../../assets/Admin.css";

function Header() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user?.fullName;

  return (
    <header className="header">
      <div className="left">
        <div>
          <span className="ap-logo-icon">🌿</span>
        </div>
        <div>
          <div className="ap-logo-name">EcoBazaar</div>
          <div className="ap-logo-sub">لوحة الإدارة</div>
        </div>
      </div>
      <div className="admin">
        <div className="avatar" title={user?.fullName || "Admin"}>
          {initials}
        </div>
      </div>
    </header>
  );
}

export default Header;