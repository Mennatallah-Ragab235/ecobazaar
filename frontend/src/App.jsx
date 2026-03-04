import { useState } from "react";
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
import "./App.css";
import AddProduct from "./pages/Seller/AddProduct";
import Header from "./components/Admin/Header";
import Dashboard from "./components/Admin/Dashboard";
import Aside from "./components/Admin/Aside";
import SellerProducts from "./pages/Seller/SellerProducts";




const AUTH_ROUTES = ["/login", "/register/buyer", "/register/seller"];




function Layout({ children, cartCount, searchVal, setSearchVal }) {
  const location = useLocation();
  const isAuth = AUTH_ROUTES.includes(location.pathname);
  const isSellerOrAdmin = location.pathname.toLowerCase().startsWith("/seller") || location.pathname.toLowerCase().startsWith("/admin");

  return (
    <div className="app" dir="ltr">
      {!isAuth && !isSellerOrAdmin && <Navbar cartCount={cartCount} searchVal={searchVal} setSearchVal={setSearchVal} />}
      {children}
      {!isAuth && !isSellerOrAdmin && <Footer />}
    </div>
  );
}



function HomePage({ onAddToCart, searchVal }) {
  return (
    <>
      <Hero />
      <Categories />
      <Featuredproducts onAddToCart={onAddToCart} searchVal={searchVal} />
      <Stats />
      <JoinSection />
      <Features />
    </>
  );
}





function Admin() {
  return (
    <div className="admin-page">
      <Header />
      <div className="admin-body">
        <Aside />
        <Dashboard />
      </div>
    </div>
  );
}

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [searchVal, setSearchVal] = useState(""); // <-- هنا الstate للبحث
  const addToCart = () => setCartCount((c) => c + 1);

  return (
    <BrowserRouter>
      <Layout cartCount={cartCount} searchVal={searchVal} setSearchVal={setSearchVal}>
        <Routes>
          <Route path="/"                  element={<HomePage onAddToCart={addToCart} searchVal={searchVal} />}/>
          <Route path="/login"             element={<Login />} />
          <Route path="/register/buyer"    element={<RegisterBuyer />} />
          <Route path="/register/seller"   element={<RegisterSeller />} />
          <Route path="/seller/addproduct" element={<AddProduct />} />
          <Route path="/seller/products"   element={<SellerProducts />} />
          <Route path="/admin"             element={<Admin/>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}


// function Layout({ children, cartCount }) {
//   const location = useLocation();

//   const isAuth = AUTH_ROUTES.includes(location.pathname);
// const isSellerOrAdmin = location.pathname.toLowerCase().startsWith("/seller") || location.pathname.toLowerCase().startsWith("/admin");

//   return (
//     <div className="app" dir="ltr">
//       {!isAuth && !isSellerOrAdmin && <Navbar cartCount={cartCount} />}
//       {children}
//       {!isAuth && !isSellerOrAdmin && <Footer />}
//     </div>
//   );
// }

// function App() {
//   const [cartCount, setCartCount] = useState(0);
//   const addToCart = () => setCartCount((c) => c + 1);

//   return (
//     <BrowserRouter>
//       <Layout cartCount={cartCount}>
//         <Routes>
//           <Route path="/"                  element={<HomePage onAddToCart={addToCart} />} />
//           <Route path="/login"             element={<Login />} />
//           <Route path="/register/buyer"    element={<RegisterBuyer />} />
//           <Route path="/register/seller"   element={<RegisterSeller />} />
//           <Route path="/seller/addproduct" element={<AddProduct />}/>;
//           <Route path="/seller/products" element={<SellerProducts />} />
//           <Route path="/admin"             element={<Admin/>} />

//         </Routes>
//       </Layout>
//     </BrowserRouter>
//   );
// }

export default App;