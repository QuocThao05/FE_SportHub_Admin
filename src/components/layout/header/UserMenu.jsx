import { FaUserCircle } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiChevronDown } from "react-icons/fi";
import { Spin, message } from "antd";
import '../../../styles/components/UserMenu.scss';
import { logout, setUser } from "../../../stores/slices/authSlice";
import authService from "../../../services/authService";

export default function UserMenu() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const dropdownRef = useRef(null);

  const handleMoveSignIn = () => navigate("/signIn");

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await authService.logout();
      dispatch(logout());
      message.success("Bạn đã đăng xuất thành công!");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      message.error("Đăng xuất thất bại, vui lòng thử lại!");
    } finally {
      setLoadingLogout(false);
      setShowDropdown(false);
    }
  };

  // 👉 Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Tự động fetch user sau login
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (user !== null) {
          const res = await authService.getCurrentUser();
          dispatch(setUser(res.data.data));
        }
      } catch (error) {
        console.error("Không thể lấy thông tin người dùng:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="nav__actions" ref={dropdownRef}>
      

      {user ? (
        <div className="user-logged">
          <div
            className="username-wrapper"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="user-avatar"
              />
            ) : (
              <FaUserCircle className="user-avatar-icon" />
            )}
            <FiChevronDown className={`arrow ${showDropdown ? "open" : ""}`} />
          </div>

          {/* 🔹 Dropdown menu */}
          <div
            className={`user-dropdown-menu ${showDropdown ? "active" : ""}`}
          >
            <div
              className="dropdown-item"
              onClick={() => {
                navigate("/profile");
                setShowDropdown(false);
              }}
            >
              Hồ sơ của tôi
            </div>

            {user.provider === "LOCAL" && (
              <div
                className="dropdown-item"
                onClick={() => {
                  navigate("/change-password");
                  setShowDropdown(false);
                }}
              >
                Đổi mật khẩu
              </div>
            )}

            <div className="dropdown-item" onClick={handleLogout}>
              {loadingLogout ? <Spin size="small" /> : "Đăng xuất"}
            </div>
          </div>
        </div>
      ) : (
        <>
          <button className="btn login" onClick={handleMoveSignIn}>
            Đăng nhập
          </button>
        </>
      )}
    </div>
  );
}
