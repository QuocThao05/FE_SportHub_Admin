import { Outlet } from "react-router-dom";
import AdminHeader from './../components/layout/header/AdminHeader';
import AdminSidebar from './../components/layout/header/AdminSidebar';
import "../styles/layout/AdminDashboard.scss";
export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <AdminHeader />
      <div className="admin-body">
        <AdminSidebar />
        <main className="admin-content">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}
