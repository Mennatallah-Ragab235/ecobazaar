import { Outlet } from "react-router-dom";
import SellerSidebar from "./SellerSidebar";
import SellerNavbar from "./SellerNavbar";

export default function SellerLayout() {
  return (
    <div className="seller-layout">
      <SellerNavbar />
      <div className="seller-body">
        <SellerSidebar />
<main className="seller-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}