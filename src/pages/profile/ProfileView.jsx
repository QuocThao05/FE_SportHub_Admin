import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { setUser } from "../../stores/slices/authSlice";
import authService from "../../services/authService";
import { useNavigate } from "react-router-dom";
import "../../styles/pages/profile/ProfileView.scss";

export default function ProfileView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getCurrentUser();
        console.log(" alo alo", res);
        
        dispatch(setUser(res.data.data));
      } catch (error) {
        console.error("Không thể lấy thông tin người dùng:", error);
      }
    };
    fetchUser();
  }, [dispatch]);

  const handleEdit = () => {
    navigate("/profile/edit");
  };

  // ✅ Chặn render nếu user chưa có (tránh lỗi null)
  if (!user) {
    return <div style={{ textAlign: "center", paddingTop: "50px" }}>Đang tải thông tin người dùng...</div>;
  }


  // const handleBack = ( ) => {
  //   navigate('/profile');
  // }

  return (
    <div className="profile-view-container">
      <div className="profile-cover">
        <img
          src={user.coverUrl || "https://placehold.co/1200x300"}
          alt="Ảnh bìa"
          className="cover-img"
        />
      </div>

      <div className="profile-header">
        <div className="avatar-section">
          <img
            src={user.avatarUrl || "https://placehold.co/150x150"}
            alt="Ảnh đại diện"
            className="avatar-img"
          />
          <div className="user-info">
            <h2>{ user.username}</h2>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-edit" onClick={handleEdit}>
            Chỉnh sửa hồ sơ
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="post-section">
          <h3>Bài viết</h3>
          <div className="post-card">
            <p>Bài viết 1 - ví dụ về blog của bạn.</p>
          </div>
          <div className="post-card">
            <p>Bài viết 2 - nội dung mẫu.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
