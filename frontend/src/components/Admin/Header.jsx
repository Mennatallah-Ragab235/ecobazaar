import "../../assets/AdminLayout.css";

function Header() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="ap-navbar">

      {/* يسار — لوجو + اسم */}
      <div className="ap-navbar-left">
        <img
          src="/images/Logo.png"
          alt="EcoBazaar Logo"
          className="ap-logo"
        />
        <div>
          <div className="ap-logo-name">EcoBazaar</div>
          <div className="ap-logo-sub">لوحة الإدارة</div>
        </div>
      </div>

      {/* يمين — اسم المستخدم */}
      <div className="avatar">
        👤 {user?.fullName || "Admin"}
      </div>

    </div>
  );
}

export default Header;