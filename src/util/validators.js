import * as yup from "yup";

// ✅ Regex chung
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^(?:\+84|0)\d{9,10}$/;

// ✅ Họ và tên: chỉ cho phép chữ cái và khoảng trắng (VD: "Nguyễn Khắc Sơn", "Lệ Thị Hiền Trang")
export const usernameRegex = /^[A-Za-zÀ-ỹ\s]+$/;

// ✅ Mật khẩu: ít nhất 8 ký tự, chứa ít nhất 1 ký tự đặc biệt
export const passwordRegex = /^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// ✅ Schema Đăng ký
export const signUpSchema = yup.object().shape({
  username: yup
    .string()
    .required("⚠️ Vui lòng nhập họ và tên")
    .matches(usernameRegex, "⚠️ Họ và tên không được chứa số hoặc ký tự đặc biệt")
    .max(50, "⚠️ Họ và tên không được quá 50 ký tự")
    .min(5, "⚠️ Họ và tên phải có ít nhất 5 ký tự"),

  email: yup
    .string()
    .required("⚠️ Vui lòng nhập email")
    .matches(emailRegex, "⚠️ Email không hợp lệ"),

  phone: yup
    .string()
    .required("⚠️ Vui lòng nhập số điện thoại")
    .matches(phoneRegex, "⚠️ Số điện thoại không hợp lệ"),

  password: yup
    .string()
    .required("⚠️ Vui lòng nhập mật khẩu")
    .matches(
      passwordRegex,
      "⚠️ Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất 1 ký tự đặc biệt"
    ),
});

// ✅ Schema Đăng nhập
export const signInSchema = yup.object().shape({
  email: yup
    .string()
    .email("❌ Email không đúng định dạng!")
    .required("❌ Email không được bỏ trống!"),

  password: yup
    .string()
    .required("❌ Mật khẩu không được bỏ trống!")
});

export const categorySchema = yup.object().shape({
  name: yup
    .string()
    .required("⚠️ Vui lòng nhập tên danh mục")
    .max(100, "⚠️ Tên danh mục không được quá 100 ký tự"),
    
  description: yup
    .string()
    .max(255, "⚠️ Mô tả không được quá 255 ký tự"),

  active: yup
    .boolean()
    .required("⚠️ Vui lòng chọn trạng thái danh mục"),
});

// ✅ Schema Cập nhật địa chỉ (Shop/Profile)
export const addressUpdateSchema = yup.object().shape({
  street: yup
    .string()
    .trim()
    .required("Vui lòng nhập địa chỉ (street)")
    .max(255, "Địa chỉ (street) không được quá 255 ký tự"),
  // provinceId/districtId/wardCode may come as string from selects; transform to number
  provinceId: yup
    .number()
    .transform((value, original) => {
      if (original === null || original === undefined || original === "") return undefined;
      const n = Number(original);
      return Number.isNaN(n) ? original : n;
    })
    .required("Vui lòng chọn tỉnh/thành")
    .typeError("Mã tỉnh/thành không hợp lệ"),
  districtId: yup
    .number()
    .transform((value, original) => {
      if (original === null || original === undefined || original === "") return undefined;
      const n = Number(original);
      return Number.isNaN(n) ? original : n;
    })
    .required("Vui lòng chọn quận/huyện")
    .typeError("Mã quận/huyện không hợp lệ"),
  wardCode: yup
    .number()
    .transform((value, original) => {
      if (original === null || original === undefined || original === "") return undefined;
      const n = Number(original);
      return Number.isNaN(n) ? original : n;
    })
    .required("Vui lòng chọn phường/xã")
    .typeError("Mã phường/xã không hợp lệ"),
  country: yup.string().required("Vui lòng nhập quốc gia").max(100, "Quốc gia không được quá 100 ký tự"),
});




