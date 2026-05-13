import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Home/Navbar";
import Hero from "./components/Home/Hero";
import Categories from "./components/Home/Categories";
import Featuredproducts from "./components/Home/Featuredproducts";
import Stats from "./components/Home/Stats";
import JoinSection from "./components/Home/Joinsection";
import Features from "./components/Home/Features";
import Footer from "./components/Home/Footer";

import Login from "./pages/Login";
import RegisterBuyer from "./pages/RegisterBuyer";
import RegisterSeller from "./pages/RegisterSeller";

import AddProduct from "./pages/Seller/AddProduct";
import Dashboard from "./pages/Admin/Dashboard";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminSellers from "./pages/Admin/AdminSellers";
import AdminBuyers from "./pages/Admin/AdminBuyers";
import AdminProducts from "./pages/Admin/AdminProducts";

import SellerProducts from "./pages/Seller/SellerProducts";
import SellerOrders from "./pages/Seller/OrdersPage";
import SellerRevenue from "./pages/Seller/SellerRevenue";

import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import OrderSuccess from "./pages/OrderSuccess";
import Profile from "./pages/Profile";
import OrderDetails from "./pages/OrderDetails";
import SellerLayout from "./components/Seller/SellerLayout";
import AdminLayout from "./components/Admin/AdminLayout"; // ← شيله
import About from "./pages/Policies/About";
import Contact from "./pages/Policies/ContactUs";
import ReturnPolicy  from "./pages/Policies/ReturnPolicy";
import PrivacyPolicy from "./pages/Policies/PrivacyPolicy";
import SellersPolicy from "./pages/Policies/SellersPolicy";
import EscrowPolicy  from "./pages/Policies/EscrowPolicy";

import "./App.css";

const AUTH_ROUTES = ["/login", "/register/buyer", "/register/seller"];
const API_URL = "http://localhost:5000";

/* ── Layout ── */
function Layout({ children, cartCount, searchVal, setSearchVal }) {
  const location = useLocation();

  const isAuth = AUTH_ROUTES.includes(location.pathname);
  const isSellerOrAdmin =
    location.pathname.toLowerCase().startsWith("/seller") ||
    location.pathname.toLowerCase().startsWith("/admin");

  return (
    <div className="app" dir="rtl">
      {!isAuth && !isSellerOrAdmin && (
        <Navbar
          cartCount={cartCount}
          searchVal={searchVal}
          setSearchVal={setSearchVal}
        />
      )}

      {children}

      {!isAuth && !isSellerOrAdmin && <Footer />}
    </div>
  );
}

/* ── Home ── */
function HomePage({ onAddToCart, searchVal, selectedCategory, setSelectedCategory }) {
  return (
    <>
      <Hero />
      <Categories
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <Featuredproducts
        onAddToCart={onAddToCart}
        searchVal={searchVal}
        selectedCategory={selectedCategory}
      />
      <Stats />
      <JoinSection />
      <Features />
    </>
  );
}

/* ── App ── */
function App() {
  const [cartCount, setCartCount]           = useState(0);
  const [searchVal, setSearchVal]           = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchCartCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { setCartCount(0); return; }
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setCartCount(0); return; }
      const data = await res.json();
      const count = (data.items || []).reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (err) {
      console.error("Cart fetch error:", err);
    }
  }, []);

  const addToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    try {
      await fetch(`${API_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      await fetchCartCount();
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  useEffect(() => { fetchCartCount(); }, [fetchCartCount]);

  return (
    <BrowserRouter>
      <Layout
        cartCount={cartCount}
        searchVal={searchVal}
        setSearchVal={setSearchVal}
      >
        <Routes>

          {/* ── Home ── */}
          <Route path="/" element={
            <HomePage
              onAddToCart={addToCart}
              searchVal={searchVal}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          } />

          {/* ── Auth ── */}
          <Route path="/login"            element={<Login />} />
          <Route path="/register/buyer"   element={<RegisterBuyer />} />
          <Route path="/register/seller"  element={<RegisterSeller />} />


{/* ── Seller ── */}
<Route path="/seller" element={<SellerLayout />}>
  <Route path="products"   element={<SellerProducts />} />
  <Route path="orders"     element={<SellerOrders />} />
  <Route path="revenue"    element={<SellerRevenue />} />
  <Route path="addproduct" element={<AddProduct />} />
</Route>


<Route path="/admin" element={<AdminLayout />}>
  <Route index         element={<Dashboard />} />
  <Route path="orders"   element={<AdminOrders />} />
  <Route path="sellers"  element={<AdminSellers />} />
  <Route path="buyers"   element={<AdminBuyers />} />
  <Route path="products" element={<AdminProducts />} />
</Route>


          {/* ── Shop ── */}
          <Route path="/products"          element={<ProductsPage onAddToCart={addToCart} searchVal={searchVal} />} />
          <Route path="/product/:id"       element={<ProductDetailsPage />} />
          <Route path="/cart"              element={<CartPage refreshCart={fetchCartCount} />} />
          <Route path="/checkout"          element={<Checkout refreshCart={fetchCartCount} setCartCount={setCartCount} />} />
          <Route path="/order-success"     element={<OrderSuccess />} />
          <Route path="/order/:id"         element={<OrderDetails />} />
          <Route path="/profile"           element={<Profile />} />
   
{/* ── Pages ── */}
<Route path="/policies/about" element={<About />} />
<Route path="/policies/contact" element={<Contact />} />
<Route path="/policies/return-policy"  element={<ReturnPolicy />} />
<Route path="/policies/privacy-policy" element={<PrivacyPolicy />} />
<Route path="/policies/sellers-policy" element={<SellersPolicy />} />
<Route path="/policies/escrow-policy"  element={<EscrowPolicy />} />
 
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;