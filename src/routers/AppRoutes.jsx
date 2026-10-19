import { Routes, Route } from "react-router-dom";
import SignIn from "../pages/auth/SignIn.jsx";
import AdminDashboard from "../layouts/AdminDashboard.jsx";
import ProductManagement from "../pages/home/ProductManagement.jsx";
import CategoryManagement from "../pages/home/CategoryManagement.jsx";
import RevenueStatistics from "../pages/home/RevenueStatistics.jsx";
import CouponManagement from "../pages/home/CouponManagement.jsx";
import AdminRoute from "./AdminRoute.jsx";
import CreateProduct from "../pages/home/CreateProduct.jsx";
import OrderManagement from "../pages/home/OrderManagement.jsx";
import UserManagement from "../pages/home/UserManagement.jsx";
import ShopManagement from "../pages/home/ShopManagement.jsx";
import AdminHome from "../pages/home/AdminHome.jsx";
import ReviewManagement from "../pages/home/ReviewManagement.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ======================================================= */}
      {/* 🛡️ 1. Tuyến Bảo Vệ (AdminRoute) */}
      <Route element={<AdminRoute />}>
        {/* 🏢 2. Layout Admin (AdminDashboard) */}
        <Route element={<AdminDashboard />}>
          <Route path="/" element={<AdminHome />} />
          <Route path="/revenue" element={<RevenueStatistics />} />
          <Route path="/coupons" element={<CouponManagement />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/product-types" element={<CategoryManagement />} />
          <Route path="/orders" element={<OrderManagement/>} />
          <Route path="/shops" element={<ShopManagement />} />
          {/* ✅ Thêm tuyến cho CreateProduct */}
          <Route path="/add-product" element={<CreateProduct />} />
          <Route path="/add-product/:id" element={<CreateProduct />} />
           <Route path="/orders" element={<OrderManagement />} /> 
           <Route path="/users" element={<UserManagement />} />
           <Route path="/reviews" element={<ReviewManagement />}
/>
        </Route>
      </Route>

      {/* ======================================================= */}
      {/* 🔓 Tuyến Công Khai (Trang Đăng nhập) */}
      <Route path="/signIn" element={<SignIn />} />
    </Routes>
  );
}
