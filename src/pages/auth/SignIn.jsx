import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Modal, Button, message } from "antd";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { signIn, signInWithGoogle, setUser } from "../../stores/slices/authSlice";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase/firebaseConfig";

import "../../styles/pages/auth/SignIn.scss";
import LogoTrainUp from "../../asset/LogoTrainUp.png";

import { signInSchema } from "../../util/validators";
import { ERROR_CODES } from "../../util/constants";
import authService from "../../services/authService";

// Định nghĩa vai trò cần thiết (PHẢI KHỚP VỚI BACKEND)
const REQUIRED_ROLE = "ADMIN";

export default function AdminSignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const { loading: storeLoading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(signInSchema),
  });
    
  /**
   * Helper function: Kiểm tra xem user có role ADMIN hay không
   * @param {object} userData - Đối tượng chứa thuộc tính 'roles'
   * @returns {boolean}
   */
  const checkIsAdmin = (userData) => {
    // Kiểm tra xem trong mảng roles có bất kỳ role nào có name trùng với REQUIRED_ROLE không
    return userData?.roles?.some(role => role.name === REQUIRED_ROLE);
  };

  // ✅ Đăng nhập thường
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // resultAction là response object {status, code, message, data: { user_info, roles, token...}}
      const response = await dispatch(signIn(data)).unwrap();

      // 🛑 CHỈNH SỬA: Lấy user data từ thuộc tính 'data' của response
      const loggedInUser = response.data; 
      
      console.log(" check role ", loggedInUser);
      
      if (checkIsAdmin(loggedInUser)) {
        console.log(" zô rồi ");
        
        // Nếu là ADMIN, cho phép vào
        message.success("🎉 Đăng nhập thành công!");
        navigate("/"); 
      } else {
        // 🛑 Nếu không phải ADMIN, HỦY ĐĂNG NHẬP
        await authService.logout(); 
        
        // Hiển thị thông báo
        message.error("Tài khoản này không có quyền truy cập quản trị!");
      }
    } catch (error) {
      const errCode = error?.code;
      const errMessage = error?.message || "Đăng nhập thất bại, vui lòng thử lại!";

      switch (errCode) {
        case ERROR_CODES.EMAIL_NOT_FOUND:
          setError("email", { type: "manual", message: "❌ Email không tồn tại!" });
          break;
        case ERROR_CODES.INVALID_PASSWORD:
          setError("password", { type: "manual", message: "❌ Mật khẩu không chính xác!" });
          break;
        case ERROR_CODES.ACCOUNT_DISABLED:
          setError("email", { type: "manual", message: "❌ Tài khoản chưa được xác thực!" });
          break;
        default:
          setServerMessage(errMessage);
          setErrorModal(true);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Đăng nhập Google
  const handleGoogleSignIn = async () => {
    try {
      message.info("🔗 Đang mở đăng nhập Google...");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const resultAction = await dispatch(signInWithGoogle({ idToken }));

      if (signInWithGoogle.fulfilled.match(resultAction)) {
        // 1. Lấy thông tin User đầy đủ (bao gồm Role) từ API backend
        const userInfoRes = await authService.getCurrentUser();

        // 🛑 CHỈNH SỬA: Lấy user data từ thuộc tính 'data' của response (Giả định getCurrentUser trả về cấu trúc tương tự)
        const loggedInUser = userInfoRes.data;
        dispatch(setUser(loggedInUser)); // Cập nhật user vào Redux

        console.log(" check role ", loggedInUser);
        
        // 2. Kiểm tra Role
        if (checkIsAdmin(loggedInUser)) {
        console.log(" zô rồi ");

          // Nếu là ADMIN, cho phép vào
          message.success(`Đăng nhập thành công với Google: ${user.displayName}`);
          navigate("/");
        } else {
          // 🛑 Nếu không phải ADMIN, HỦY ĐĂNG NHẬP
          await authService.logout(); 
          
          // Hiển thị thông báo
          message.error("Tài khoản Google này không có quyền truy cập quản trị!");
        }

      } else {
        message.error("Đăng nhập Google thất bại!");
      }
    } catch (error) {
      console.error("❌ Google Sign-In Error:", error);
      message.error("Đăng nhập Google thất bại!");
    }
  };

  return (
    <div className="admin-login-container">
      {/* ... Giữ nguyên phần render JSX ... */}
      <div className="login-card">
        <div className="logo-section">
          <img src={LogoTrainUp} alt="TrainUp Logo" className="logo" />
          <h2> Admin </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email quản trị"
              {...register("email")}
              className="input-control"
            />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                {...register("password")}
                className="input-control"
              />
              <span onClick={() => setShowPassword(!showPassword)} className="eye-icon">
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <button className="btn-login" type="submit" disabled={loading || storeLoading}>
            {loading ? <span className="spinner"></span> : "Đăng Nhập"}
          </button>
        </form>

        <div className="divider">
          <span></span>
          <p>Hoặc</p>
          <span></span>
        </div>

        <button className="btn-google" onClick={handleGoogleSignIn}>
          <FcGoogle size={22} /> Đăng nhập bằng Google
        </button>
      </div>

      {/* Modal lỗi */}
      <Modal
        open={errorModal}
        footer={[
          <Button key="ok" type="primary" onClick={() => setErrorModal(false)}>
            Đóng
          </Button>,
        ]}
        onCancel={() => setErrorModal(false)}
        centered
      >
        <div style={{ textAlign: "center" }}>
          <h2>⚠️ Đăng nhập thất bại!</h2>
          <p>{serverMessage}</p>
        </div>
      </Modal>
    </div>
  );
}