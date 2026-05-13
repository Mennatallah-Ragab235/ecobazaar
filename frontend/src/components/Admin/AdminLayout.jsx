import { Outlet } from "react-router-dom";
import Aside from "./Aside";
import Header from "./Header";


export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Header />
     <div className="admin-body">
      <Aside />
<main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
      
  );
}


