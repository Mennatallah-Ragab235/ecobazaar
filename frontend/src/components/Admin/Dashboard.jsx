import "../../assets/Admin.css";

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
    fetch("/api/orders/admin/stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"60vh" }}>
      <FaSpinner style={{ fontSize: 40, color: "#4caf50" }} />
    </div>
  );

  return (
    <main dir="rtl" style={{ padding: 24, background: "#f9f9f9", minHeight: "100vh" }}>

      {/* عنوان */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: "bold", color: "#222" }}>لوحة التحكم الإدارية</h2>
        <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>نظرة عامة شاملة على أداء المنصة</p>
      </div>

      {/* إجراءات تحتاج اهتمامك */}
      <div style={{ background:"#fff", borderRadius:12, padding:20, marginBottom:24, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <FaExclamationCircle color="#ff9800" />
          <span style={{ fontWeight:"bold", fontSize:15 }}>إجراءات تحتاج اهتمامك</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          <div style={{ border:"1px solid #eee", borderRadius:10, padding:16, position:"relative", background:"#fafafa" }}>
            <span style={{ position:"absolute", top:10, left:10, background:"#ff9800", color:"#fff", borderRadius:"50%", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:"bold" }}>{stats?.pendingOrders || 0}</span>
            <div style={{ fontSize:28, fontWeight:"bold" }}>{stats?.pendingOrders || 0}</div>
            <div style={{ color:"#666", fontSize:13, marginTop:4 }}>طلبات بائعين جدد</div>
          </div>
          <div style={{ border:"1px solid #eee", borderRadius:10, padding:16, position:"relative", background:"#fafafa" }}>
            <span style={{ position:"absolute", top:10, left:10, background:"#f44336", color:"#fff", borderRadius:"50%", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:"bold" }}>{stats?.pendingProducts || 0}</span>
            <div style={{ fontSize:28, fontWeight:"bold" }}>{stats?.pendingProducts || 0}</div>
            <div style={{ color:"#666", fontSize:13, marginTop:4 }}>منتجات تحتاج موافقة</div>
          </div>
          <div style={{ border:"1px solid #eee", borderRadius:10, padding:16, position:"relative", background:"#fafafa" }}>
            <span style={{ position:"absolute", top:10, left:10, background:"#4caf50", color:"#fff", borderRadius:"50%", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:"bold" }}>{stats?.processingOrders || 0}</span>
            <div style={{ fontSize:28, fontWeight:"bold" }}>{stats?.processingOrders || 0}</div>
            <div style={{ color:"#666", fontSize:13, marginTop:4 }}>طلبات تحتاج معالجة</div>
          </div>
        </div>
      </div>

      {/* 4 كروت إحصائيات */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <div style={{ background:"#fff", borderRadius:12, padding:"20px 16px", boxShadow:"0 2px 8px rgba(0,0,0,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:13, color:"#888", marginBottom:4 }}>الطلبات</div>
            <div style={{ fontSize:24, fontWeight:"bold" }}>{stats?.totalOrders || 0}</div>
            <div style={{ color:"#4caf50", fontSize:12, marginTop:4 }}>↗ +23.5%</div>
          </div>
          <FaShoppingCart size={32} color="#ddd" />
        </div>
        <div style={{ background:"#fff", borderRadius:12, padding:"20px 16px", boxShadow:"0 2px 8px rgba(0,0,0,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:13, color:"#888", marginBottom:4 }}>المشترين</div>
            <div style={{ fontSize:24, fontWeight:"bold" }}>{stats?.totalBuyers || 0}</div>
            <div style={{ color:"#4caf50", fontSize:12, marginTop:4 }}>↗ +145</div>
          </div>
          <FaUsers size={32} color="#ddd" />
        </div>
        <div style={{ background:"#fff", borderRadius:12, padding:"20px 16px", boxShadow:"0 2px 8px rgba(0,0,0,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:13, color:"#888", marginBottom:4 }}>البائعين النشطين</div>
            <div style={{ fontSize:24, fontWeight:"bold" }}>{stats?.totalSellers || 0}</div>
            <div style={{ color:"#4caf50", fontSize:12, marginTop:4 }}>↗ +12</div>
          </div>
          <FaStore size={32} color="#ddd" />
        </div>
        <div style={{ background:"#fff", borderRadius:12, padding:"20px 16px", boxShadow:"0 2px 8px rgba(0,0,0,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:13, color:"#888", marginBottom:4 }}>إجمالي المبيعات</div>
            <div style={{ fontSize:22, fontWeight:"bold" }}>{stats?.totalSales?.toLocaleString() || 0}</div>
            <div style={{ fontSize:12, color:"#888" }}>جنيه</div>
            <div style={{ color:"#4caf50", fontSize:12 }}>↗ +18.2%</div>
          </div>
          <FaMoneyBillWave size={32} color="#ddd" />
        </div>
      </div>

      {/* رسمين بيانيين */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
        <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
          <h3 style={{ margin:"0 0 16px 0", fontSize:15, fontWeight:"bold", color:"#333" }}>إحصائيات المبيعات الشهرية</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#888" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
          <h3 style={{ margin:"0 0 16px 0", fontSize:15, fontWeight:"bold", color:"#333" }}>عدد الطلبات الشهرية</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#555" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* جدولين */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
        <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:"bold", color:"#333" }}>أحدث الطلبات</h3>
            <button onClick={() => navigate("/admin/orders")} style={{ background:"transparent", border:"1px solid #ccc", borderRadius:8, padding:"4px 14px", cursor:"pointer", fontSize:13, color:"#555" }}>عرض الكل</button>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"2px solid #f0f0f0" }}>
                <th style={{ padding:"8px 10px", textAlign:"right", color:"#888", fontWeight:"bold", fontSize:12 }}>الحالة</th>
                <th style={{ padding:"8px 10px", textAlign:"right", color:"#888", fontWeight:"bold", fontSize:12 }}>المبلغ</th>
                <th style={{ padding:"8px 10px", textAlign:"right", color:"#888", fontWeight:"bold", fontSize:12 }}>العميل</th>
                <th style={{ padding:"8px 10px", textAlign:"right", color:"#888", fontWeight:"bold", fontSize:12 }}>رقم الطلب</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders || []).map((order, i) => (
                <tr key={order._id} style={{ borderBottom:"1px solid #f5f5f5" }}>
                  <td style={{ padding:"10px", textAlign:"right" }}>
                    <span style={{ background: order.status === "delivered" ? "#4caf50" : order.status === "processing" ? "#2196f3" : order.status === "cancelled" ? "#f44336" : "#ff9800", color:"#fff", padding:"2px 10px", borderRadius:20, fontSize:11 }}>
                      {order.status === "pending"    && "قيد الانتظار"}
                      {order.status === "delivered"  && "التوصيل"}
                      {order.status === "processing" && "المعالجة"}
                      {order.status === "cancelled"  && "ملغي"}
                    </span>
                  </td>
                  <td style={{ padding:"10px", textAlign:"right", color:"#444" }}>{order.total} جنيه</td>
                  <td style={{ padding:"10px", textAlign:"right", color:"#444" }}>{order.user?.fullName || "—"}</td>
                  <td style={{ padding:"10px", textAlign:"right", color:"#444" }}>#ORD-{String(i + 1).padStart(3, "0")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:"bold", color:"#333" }}>البائعين الجدد</h3>
            <button onClick={() => navigate("/admin/sellers")} style={{ background:"transparent", border:"1px solid #ccc", borderRadius:8, padding:"4px 14px", cursor:"pointer", fontSize:13, color:"#555" }}>عرض الكل</button>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"2px solid #f0f0f0" }}>
                <th style={{ padding:"8px 10px", textAlign:"right", color:"#888", fontWeight:"bold", fontSize:12 }}>الحالة</th>
                <th style={{ padding:"8px 10px", textAlign:"right", color:"#888", fontWeight:"bold", fontSize:12 }}>المبيعات</th>
                <th style={{ padding:"8px 10px", textAlign:"right", color:"#888", fontWeight:"bold", fontSize:12 }}>المنتجات</th>
                <th style={{ padding:"8px 10px", textAlign:"right", color:"#888", fontWeight:"bold", fontSize:12 }}>اسم المتجر</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentSellers || []).map((seller) => (
                <tr key={seller._id} style={{ borderBottom:"1px solid #f5f5f5" }}>
                  <td style={{ padding:"10px", textAlign:"right" }}>
                    <span style={{ background: seller.isActive ? "#4caf50":"#f44336", color:"#fff", padding:"2px 10px", borderRadius:20, fontSize:11 }}>
                      {seller.isActive ? "نشط" : "مراجعة"}
                    </span>
                  </td>
                  <td style={{ padding:"10px", textAlign:"right", color:"#444" }}>{seller.totalSales || 0} جنيه</td>
                  <td style={{ padding:"10px", textAlign:"right", color:"#444" }}>{seller.productCount || 0}</td>
                  <td style={{ padding:"10px", textAlign:"right", color:"#444" }}>{seller.storeName || seller.fullName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* إجراءات سريعة */}
      <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
        <h3 style={{ margin:"0 0 16px 0", fontSize:15, fontWeight:"bold", color:"#333" }}>إجراءات سريعة</h3>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <button onClick={() => navigate("/admin/orders")}  style={{ background:"#f5f5f5", border:"none", borderRadius:10, padding:"12px 20px", cursor:"pointer", fontSize:14, fontWeight:"bold", color:"#333" }}>🛒 إدارة الطلبات</button>
          <button onClick={() => navigate("/admin/buyers")}  style={{ background:"#f5f5f5", border:"none", borderRadius:10, padding:"12px 20px", cursor:"pointer", fontSize:14, fontWeight:"bold", color:"#333" }}>👥 إدارة المشترين</button>
          <button onClick={() => navigate("/admin/sellers")} style={{ background:"#f5f5f5", border:"none", borderRadius:10, padding:"12px 20px", cursor:"pointer", fontSize:14, fontWeight:"bold", color:"#333" }}>🏪 إدارة البائعين</button>
          <button onClick={() => navigate("/admin")}         style={{ background:"#f5f5f5", border:"none", borderRadius:10, padding:"12px 20px", cursor:"pointer", fontSize:14, fontWeight:"bold", color:"#333" }}>📦 إدارة المنتجات</button>
        </div>
      </div>

    </main>
  );
}

export default Dashboard;