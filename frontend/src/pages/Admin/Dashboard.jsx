import "../../assets/Admin.css";
import AdminLayout from "../../components/Admin/AdminLayout";
import "../../assets/AdminLayout.css";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  FaShoppingCart, FaUsers, FaStore, FaMoneyBillWave, FaSpinner, FaExclamationCircle
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
fetch("http://localhost:5000/api/orders/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"60vh" }}>
        <FaSpinner style={{ fontSize: 40, color: "#4caf50" }} className="spin" />
      </div>
    );
  }

  const platformRevenue = stats?.platformEarnings || 0;
  const platformPending = stats?.platformPending || 0;
  const feeRate = stats?.platformFeeRate || 10;

  return (
  
    <main dir="rtl" className="dashboard">

      {/* Header */}
      <div className="page-title">لوحة التحكم الإدارية</div>

      {/* 🔥 Revenue Card */}
      <div className="cards" style={{ marginBottom: 24 }}>

        <div className="card green">
          <div className="card-num">
            {platformRevenue.toLocaleString()} EGP
          </div>
          <div className="card-label">
            أرباح المنصة (تم تحصيل {feeRate}%)
          </div>
        </div>

        <div className="card orange">
          <div className="card-num">
            {platformPending.toLocaleString()} EGP
          </div>
          <div className="card-label">
            أرباح معلقة (Pending Fees)
          </div>
        </div>

        <div className="card blue">
          <div className="card-num">
            {stats?.totalSales?.toLocaleString() || 0}
          </div>
          <div className="card-label">
            إجمالي المبيعات
          </div>
        </div>

        <div className="card purple">
          <div className="card-num">
            {stats?.totalOrders || 0}
          </div>
          <div className="card-label">
            إجمالي الطلبات
          </div>
        </div>

      </div>

      {/* Stats */}
      <div className="cards">

        <div className="card green">
          <div className="card-num">{stats?.totalBuyers || 0}</div>
          <div className="card-label">المشترين</div>
        </div>

        <div className="card blue">
          <div className="card-num">{stats?.totalSellers || 0}</div>
          <div className="card-label">البائعين</div>
        </div>

        <div className="card orange">
          <div className="card-num">{stats?.pendingOrders || 0}</div>
          <div className="card-label">طلبات معلقة</div>
        </div>

        <div className="card red">
          <div className="card-num">{stats?.pendingProducts || 0}</div>
          <div className="card-label">منتجات انتظار</div>
        </div>

      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop: 20 }}>

        <div className="table-card" style={{ padding: 20 }}>
          <h3>المبيعات الشهرية</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#2e7d32" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="table-card" style={{ padding: 20 }}>
          <h3>الطلبات الشهرية</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#1565c0" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="table-card" style={{ marginTop: 20, padding: 20 }}>
        <h3>إجراءات سريعة</h3>

        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <button className="action-btn view" onClick={() => navigate("/admin/orders")}>
            الطلبات
          </button>
          <button className="action-btn view" onClick={() => navigate("/admin/sellers")}>
            البائعين
          </button>
          <button className="action-btn view" onClick={() => navigate("/admin/buyers")}>
            المشترين
          </button>
          <button className="action-btn view" onClick={() => navigate("/admin/products")}>
            المنتجات
          </button>
        </div>

      </div>

    </main>
  );
}

export default Dashboard;