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
import Header from "./components/Admin/Header";
import Dashboard from "./components/Admin/Dashboard";
import Aside from "./components/Admin/Aside";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminSellers from "./pages/Admin/AdminSellers";
import AdminBuyers from "./pages/Admin/AdminBuyers";
import AdminProducts from "./pages/Admin/AdminProducts"; // أو المسار عندك

import SellerProducts from "./pages/Seller/SellerProducts";
import SellerOrders from "./pages/Seller/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import OrderSuccess from "./pages/OrderSuccess";
import Profile from "./pages/Profile";
import OrderDetails from "./pages/OrderDetails";



import "./App.css";



const clearCartUI = () => {
  setCartCount(0);
};

const AUTH_ROUTES = ["/login", "/register/buyer", "/register/seller"];
const API_URL = "http://localhost:5000";

/* ================= LAYOUT ================= */
function Layout({ children, cartCount, searchVal, setSearchVal }) {
  const location = useLocation();

  const isAuth = AUTH_ROUTES.includes(location.pathname);

  const isSellerOrAdmin =
    location.pathname.toLowerCase().startsWith("/seller") ||
    location.pathname.toLowerCase().startsWith("/admin");

  return (
    <div className="app" dir="ltr">
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

/* ================= HOME ================= */
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

/* ================= ADMIN LAYOUT ================= */
function AdminLayout({ children }) {
  return (
    <div className="admin-page">
      <Header />
      <div className="admin-body">
        <Aside />
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================= APP ================= */
function App() {
  const [cartCount, setCartCount] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  /* ================= GET CART COUNT ================= */
 const fetchCartCount = useCallback(async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setCartCount(0);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;

    const data = await res.json();

    const count = (data.items || []).reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    setCartCount(count); // ✅ ده المهم
  } catch (err) {
    console.error("Cart fetch error:", err);
  }
}, []);

  /* ================= ADD TO CART ================= */
  const addToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
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
useEffect(() => {
  fetchCartCount();
}, [fetchCartCount]);

  return (
    <BrowserRouter>
      <Layout
        cartCount={cartCount}
        searchVal={searchVal}
        setSearchVal={setSearchVal}
      >
        <Routes>
          {/* ========== HOME ========== */}
          <Route
            path="/"
            element={
              <HomePage
                onAddToCart={addToCart}
                searchVal={searchVal}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            }
          />

          {/* ========== AUTH ========== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register/buyer" element={<RegisterBuyer />} />
          <Route path="/register/seller" element={<RegisterSeller />} />

          {/* ========== SELLER ========== */}
          <Route path="/seller/addproduct" element={<AddProduct />} />
          <Route path="/seller/products" element={<SellerProducts />} />
<Route path="/seller/orders" element={<SellerOrders />} />
          {/* ========== ADMIN ========== */}
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/sellers"
            element={
              <AdminLayout>
                <AdminSellers />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/buyers"
            element={
              <AdminLayout>
                <AdminBuyers />
              </AdminLayout>
            }
          />

 <Route
            path="/admin/products"
            element={
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            }
          />
          {/* ========== SHOP ========== */}
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route
            path="/products"
            element={<ProductsPage onAddToCart={addToCart} searchVal={searchVal} />}
          />
          <Route path="/cart" element={<CartPage refreshCart={fetchCartCount} />} />
          <Route path="/checkout" element={<Checkout
  refreshCart={fetchCartCount}
  setCartCount={setCartCount}
/>} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/order/:id" element={<OrderDetails />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

