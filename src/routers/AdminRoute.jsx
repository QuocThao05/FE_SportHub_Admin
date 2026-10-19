import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { Spin } from "antd";

const REQUIRED_ROLE = "ADMIN";

export default function AdminRoute() {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <Spin fullscreen />;
  }

  if (!user) {
    return <Navigate to="/signIn" replace />;
  }

  const isAdmin = user.roles?.some(
    (role) => role.name === REQUIRED_ROLE
  );

  if (!isAdmin) {
    return <Navigate to="/signIn" replace />;
  }

  return <Outlet />;
}