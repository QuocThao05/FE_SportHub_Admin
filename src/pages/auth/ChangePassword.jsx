import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { message } from "antd";
import "../../styles/pages/auth/ChangePassword.scss";
import userService from "../../services/userService";

const schema = yup.object().shape({
  oldPassword: yup.string().required("Vui lòng nhập mật khẩu cũ"),
  newPassword: yup
    .string()
    .min(6, "Mật khẩu phải ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu mới"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Mật khẩu xác nhận không khớp")
    .required("Vui lòng xác nhận mật khẩu mới"),
});

export default function ChangePassword() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      
      const payload = {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      };

      const res = await userService.ChangePassword(payload);  
      console.log(" ress", res);
      message.success(res.data.message || "Đổi mật khẩu thành công!");
      reset();
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      message.error(err.response?.data?.message || "Đổi mật khẩu thất bại!");
    }
  };

  return (
    <div className="changepassword-container">
      <div className="changepassword-card">
        <h2 className="changepassword-title">Đổi mật khẩu</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="changepassword-group">
            <label>Mật khẩu cũ</label>
            <div className="changepassword-input-wrapper">
              <input
                type={showOld ? "text" : "password"}
                {...register("oldPassword")}
                placeholder="Nhập mật khẩu cũ"
                className={
                  errors.oldPassword
                    ? "changepassword-input error"
                    : "changepassword-input"
                }
              />
              <span
                onClick={() => setShowOld(!showOld)}
                className="changepassword-toggle"
              >
                {showOld ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
            {errors.oldPassword && (
              <p className="changepassword-error">
                {errors.oldPassword.message}
              </p>
            )}
          </div>

          {/* Mật khẩu mới */}
          <div className="changepassword-group">
            <label>Mật khẩu mới</label>
            <div className="changepassword-input-wrapper">
              <input
                type={showNew ? "text" : "password"}
                {...register("newPassword")}
                placeholder="Nhập mật khẩu mới"
                className={
                  errors.newPassword
                    ? "changepassword-input error"
                    : "changepassword-input"
                }
              />
              <span
                onClick={() => setShowNew(!showNew)}
                className="changepassword-toggle"
              >
                {showNew ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
            {errors.newPassword && (
              <p className="changepassword-error">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="changepassword-group">
            <label>Xác nhận mật khẩu</label>
            <div className="changepassword-input-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Xác nhận mật khẩu mới"
                className={
                  errors.confirmPassword
                    ? "changepassword-input error"
                    : "changepassword-input"
                }
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="changepassword-toggle"
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
            {errors.confirmPassword && (
              <p className="changepassword-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button type="submit" className="changepassword-btn">
            Cập nhật mật khẩu mới
          </button>
        </form>
      </div>
    </div>
  );
}
