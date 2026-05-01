import SellerSidebar from "./SellerSidebar";
import SellerNavbar from "./SellerNavbar";

export default function SellerLayout({ children }) {
  return (
    <div className="seller-layout">
      <SellerNavbar />

      <div className="seller-body">
        <SellerSidebar />

        <main className="seller-content">
          {children}
        </main>
      </div>
    </div>
  );
}