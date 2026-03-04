import "../../assets/Admin.css";

function Header() {
    return (
      <header className="header">
        <div className="left">
 <div>
            <span className="ap-logo-icon">🌿</span>
          </div>
          <div>
            <div className="ap-logo-name">EcoBazaar</div>
            <div className="ap-logo-sub">لوحة الادمن</div>
          </div>
        </div>

    
        <div className="admin">
          <div className="avatar">Admin</div>
        </div>
      </header>
    );
  }
  
  export default Header;