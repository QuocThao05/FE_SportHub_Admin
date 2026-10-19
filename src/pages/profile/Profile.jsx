import React, { useState, useEffect, useCallback } from "react";
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import "../../styles/pages/profile/Profile.scss";
import mediaService from "../../services/mediaService";
import { toast } from 'react-toastify';
import { updateProfile, fetchCurrentUser } from "../../stores/slices/authSlice";

export default function Profile() {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.auth.user);
    const isAuth = useSelector((state) => state.auth.isAuthenticated);

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formError, setFormError] = useState(null);

    const { register, handleSubmit, watch, formState: { isSubmitting }, reset,} = useForm({
        defaultValues: {
            username: '',
            phone: '',
            street: '',
            ward: '',
            district: '',
            province: '',
            avatarFile: null,
            coverFile: null,
        }
    });

    // ✅ Khi load trang hoặc F5 -> tự fetch user nếu đã login
    useEffect(() => {
        if (isAuth && !currentUser) {
            dispatch(fetchCurrentUser());
        }
    }, [isAuth, currentUser, dispatch]);

    // ✅ Khi currentUser thay đổi -> reset form để tránh trắng
    useEffect(() => {
        if (currentUser) {
            reset({
                username: currentUser.username || '',
                phone: currentUser.phone || '',
                street: currentUser.address?.street || '',
                ward: currentUser.address?.ward || '',
                district: currentUser.address?.district || '',
                province: currentUser.address?.province || '',
                avatarFile: null,
                coverFile: null,
            });
        }
    }, [currentUser, reset]);

    const avatarFileWatch = watch('avatarFile');
    const coverFileWatch = watch('coverFile');

    // ⚡️ Hàm handle xem trước ảnh (tối ưu bằng useCallback)
    const handlePreview = useCallback((file, setPreview) => {
        if (!file) return setPreview(null);
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        return () => URL.revokeObjectURL(previewUrl);
    }, []);

    // ✅ Xem trước avatar & cover
    useEffect(() => {
        const file = avatarFileWatch?.[0];
        return handlePreview(file, setAvatarPreview);
    }, [avatarFileWatch, handlePreview]);

    useEffect(() => {
        const file = coverFileWatch?.[0];
        return handlePreview(file, setCoverPreview);
    }, [coverFileWatch, handlePreview]);

    // 💡 Upload file lên S3 (dùng presigned URL)
    const handleS3Upload = async (file, mediaType) => {
        if (!file) return null;
        const uploadRes = await mediaService.generateUploadUrl(file.name, file.type, mediaType);

        console.log(" test media ", uploadRes);
        
        const { preSignedUploadUrl, s3Key } = uploadRes;
        await mediaService.uploadFileToS3(preSignedUploadUrl, file, file.type);
        return s3Key;
    };

    // 🚀 Submit form
    const onSubmit = async (formData) => {
        const fileToUploadAvatar = formData.avatarFile?.[0];
        const fileToUploadCover = formData.coverFile?.[0];

        const { street, ward, district, province, ...textPayload } = formData;

        let currentPayload = {
            ...textPayload,
            address: { street, ward, district, province, country: "Việt Nam" },
        };

        setIsUploading(true);
        setFormError(null);

        try {
            if (fileToUploadAvatar) {
                const s3Key = await handleS3Upload(fileToUploadAvatar, 'user_avatar');
                currentPayload.newAvatarKey = s3Key;
            }

            if (fileToUploadCover) {
                const s3Key = await handleS3Upload(fileToUploadCover, 'user_cover');
                currentPayload.newCoverKey = s3Key;
            }

            await dispatch(updateProfile({ data: currentPayload })).unwrap();
            toast.success("Cập nhật hồ sơ thành công!");

            await dispatch(fetchCurrentUser()); // ✅ Gọi lại user mới nhất sau update

            reset({ avatarFile: null, coverFile: null });
            setAvatarPreview(null);
            setCoverPreview(null);

        } catch (error) {
            console.error('🚨 Lỗi cập nhật:', error);
            const msg = error.message || 'Có lỗi xảy ra khi cập nhật.';
            setFormError(msg);
            toast.error(msg);
        } finally {
            setIsUploading(false);
        }
    };

    // ✅ Nếu chưa có user (đang loading) -> hiển thị skeleton hoặc loading
    if (!currentUser) {
        return <div className="profile-loading">Đang tải thông tin người dùng...</div>;
    }

    const displayedAvatarUrl = avatarPreview || currentUser.avatarUrl || '/default-avatar.jpg';
    const displayedCoverUrl = coverPreview || currentUser.coverUrl || '/default-cover.jpg';

    return (
        <div className="profile-container">
            <div className="profile-card">

                {/* --- HEADER: ẢNH BÌA & AVATAR --- */}
                <div className="profile-header">
                    <div className="cover-image-container">
                        <img src={displayedCoverUrl} alt="Cover" className="cover-image" />
                        <label htmlFor="cover-upload" className="cover-upload-btn" style={{ cursor: 'pointer' }}>
                            {isUploading || isSubmitting ? "Đang tải..." : "Đổi ảnh bìa"}
                        </label>
                    </div>

                    <div className="avatar-upload-section">
                        <img src={displayedAvatarUrl} alt="avatar" className="profile-avatar" />
                        <label htmlFor="avatar-upload" className="profile-avatar-btn" style={{ cursor: 'pointer' }}>
                            <span>Đổi ảnh</span>
                        </label>
                    </div>
                </div>

                {formError && <p style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>{formError}</p>}

                <input type="file" id="avatar-upload" style={{ display: 'none' }} accept="image/*"
                    {...register("avatarFile")} disabled={isUploading || isSubmitting} />
                <input type="file" id="cover-upload" style={{ display: 'none' }} accept="image/*"
                    {...register("coverFile")} disabled={isUploading || isSubmitting} />

                {/* --- BODY --- */}
                <div className="profile-body">

                    {/* Sidebar */}
                    <div className="profile-sidebar">
                        <h2 className="profile-title">Thông tin Hồ sơ</h2>
                        <div className="profile-group">
                            <label>Email (Không đổi)</label>
                            <input type="email" value={currentUser.email} readOnly />
                        </div>

                        <div className="profile-actions">
                            <button type="submit" className="profile-update-btn"
                                disabled={isUploading || isSubmitting} form="profile-form">
                                {isUploading || isSubmitting ? "Đang xử lý..." : "Lưu Thay Đổi"}
                            </button>
                            <button type="button" className="profile-password-btn">
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>

                    {/* Form Chính */}
                    <form className="profile-form" onSubmit={handleSubmit(onSubmit)} id="profile-form">
                        <div className="profile-group">
                            <label>Họ và tên</label>
                            <input type="text" {...register("username")} placeholder="Nhập họ và tên của bạn" />
                        </div>

                        <div className="profile-group">
                            <label>Số điện thoại</label>
                            <input type="text" {...register("phone")} placeholder="Nhập số điện thoại" />
                        </div>

                        <div className="profile-group">
                            <label>Địa chỉ hiện tại</label>
                            <div className="profile-address-grid">
                                <input type="text" placeholder="Số nhà, Đường" {...register("street")} />
                                <input type="text" placeholder="Phường/Xã" {...register("ward")} />
                                <input type="text" placeholder="Quận/Huyện" {...register("district")} />
                                <input type="text" placeholder="Tỉnh/Thành phố" {...register("province")} />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
