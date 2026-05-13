import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/Navbar.css";
// import logo from "../../../public/images/Logo.png";

export default function Navbar({ cartCount, searchVal, setSearchVal }) {
  const handleSearchChange = (e) => setSearchVal(e.target.value);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();



  // جلب بيانات اليوزر من localStorage
const token = localStorage.getItem("token");
const user = token ? (() => {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
})() : null;
  // إغلاق الـ dropdown لما تضغط بره
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


const handleLogout = () => {
  localStorage.clear(); // ← امسح كل حاجة بدل removeItem واحدة واحدة
  navigate("/login");
};
  const handleProfileClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setDropdownOpen((prev) => !prev);
  };

  const handleDashboard = () => {
    setDropdownOpen(false);
    const role = user?.role;
    if (role === "seller") navigate("/seller/addproduct");
    else navigate("/");
  };
const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    navigate("/products?search=" + searchVal);
  }
};

  
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="nav-logo">
          <div className="ap-navbar-left">
     <img src="/images/Logo.png"  
        
        alt="EcoBazaar Logo"
        className="ap-logo"
    />

</div>
          <span className="logo-text" onClick={() => navigate("/")} >EcoBazaar</span>
        </div>

        <div className="nav-search">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
        type="text"
        placeholder="... ابحث عن المنتجات الصديقة للبيئة"
        value={searchVal}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}/>

        </div>

    <div className="nav-links">
  <span onClick={() => navigate("/about")}>من نحن</span>
  <span onClick={() => navigate("/contact")}>اتصل بنا</span>
  <span onClick={() => navigate("/products")}>المنتجات</span>
</div>

        <div className="nav-actions">
 
              <button className="nav-btnH        " onClick={() => navigate("/cart")}>            
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* ── Profile Button + Dropdown ── */}
          <div className="profile-wrapper" ref={dropdownRef}>
            <button className="nav-btnH        " onClick={handleProfileClick}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>

            {dropdownOpen && user && (
              <div className="profile-dropdown">
                {/* معلومات اليوزر */}
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">
                    {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="dropdown-name">{user.fullName}</div>
                    <div className="dropdown-email">{user.email}</div>
                  </div>
                </div>

                <div className="dropdown-divider" />

                {/* الملف الشخصي */}
                <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/profile"); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  الملف الشخصي
                </button>

              

            

                <div className="dropdown-divider" />

                {/* تسجيل الخروج */}
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}