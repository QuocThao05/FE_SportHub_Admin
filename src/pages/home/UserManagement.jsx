import React, { useState, useEffect, useMemo } from "react";
import { Search, User } from "lucide-react";
import { message, Spin, Modal, Select, Input } from "antd";
import userManagementService from "../../services/userManagementService";
import "../../styles/pages/home/UserManagement.scss";

const { TextArea } = Input;

const STATUS_OPTIONS = [
  { value: "PENDING", label: "PENDING" },
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
  { value: "BLOCKED", label: "BLOCKED" },
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");

  const itemsPerPage = 8;

  /* ======================= LOAD USERS ====================== */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userManagementService.getAllUsers();
      const data = res.data?.data || [];
      const usersWithId = data.map((user) => ({ ...user, _id: user._id || user.id }));
      setUsers(usersWithId);
    } catch (error) {
      console.error("Fetch users error:", error);
      message.error("Lấy danh sách người dùng thất bại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ====================== FILTER + SORT ====================== */
  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user) =>
      [user.username, user.email, user.provider, user.status, user.phone].some(
        (v) => v && v.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        return sortConfig.direction === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }
    return filtered;
  }, [users, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ========================== SORT ========================== */
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  /* =================== OPEN MODAL THAY ĐỔI =================== */
  const openStatusModal = (user, status) => {
    setSelectedUser(user);
    setNewStatus(status);
    setReason("");
    setIsModalOpen(true);
  };

  /* =================== CONFIRM CHANGE STATUS =================== */
  const handleConfirmStatus = async () => {
    if (!reason.trim()) {
      return message.warning("Vui lòng nhập lý do!");
    }

    try {
      const res = await userManagementService.updateUserStatus(selectedUser._id, {
        status: newStatus,
        reason: reason,
      });

      const updatedUser = res.data?.data;

      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? updatedUser || { ...u, status: newStatus }
            : u
        )
      );

      message.success("Cập nhật trạng thái thành công!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Update status error:", error);
      message.error("Cập nhật trạng thái thất bại!");
    }
  };

  return (
    <div className="user-management">
      <div className="user-management__container">
        {/* Header */}
        <div className="user-management__header">
          <h1 className="user-management__title">
            <User size={24} /> Quản lý người dùng
          </h1>
          <p className="user-management__subtitle">
            Quản lý {filteredUsers.length} người dùng
          </p>
        </div>

        {/* Search */}
        <div className="user-management__filters">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm username, email, provider, trạng thái, phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Table */}
        <Spin spinning={loading} tip="Đang tải..." size="large">
          <div style={{ minHeight: 250 }}>
            <table className="user-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("username")}>Tên</th>
                  <th onClick={() => handleSort("email")}>Email</th>
                  <th onClick={() => handleSort("provider")}>Provider</th>
                  <th onClick={() => handleSort("tier")}>Hạng KH</th>
                  <th onClick={() => handleSort("loyaltyPoints")}>Điểm</th>
                  <th onClick={() => handleSort("status")}>Trạng thái</th>
                  <th onClick={() => handleSort("phone")}>SĐT</th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.provider || "-"}</td>
                      <td style={{ fontWeight: 'bold', color: user.tier === 'PLATINUM' ? '#0984e3' : (user.tier === 'GOLD' ? '#e1b12c' : '#7f8fa6') }}>
                        {user.tier || "BRONZE"}
                      </td>
                      <td style={{ color: '#d63031', fontWeight: 'bold' }}>
                        {user.loyaltyPoints ? user.loyaltyPoints.toLocaleString() : 0}
                      </td>
                      <td>
                        <Select
                          value={user.status}
                          style={{ width: 150 }}
                          onChange={(value) => openStatusModal(user, value)}
                          options={STATUS_OPTIONS}
                        />
                      </td>
                      <td>{user.phone || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Spin>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{ fontWeight: currentPage === i + 1 ? "bold" : "normal" }}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Modal reason */}
      <Modal
        title="Xác nhận thay đổi trạng thái"
        open={isModalOpen}
        okText="Xác nhận"
        cancelText="Hủy"
        onCancel={() => setIsModalOpen(false)}
        onOk={handleConfirmStatus}
      >
        <p>
          Bạn đang thay đổi trạng thái người dùng: <b>{selectedUser?.username}</b>
        </p>

        <p>
          Trạng thái mới: <b>{newStatus}</b>
        </p>

        <p>Lý do thay đổi:</p>
        <TextArea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhập lý do..."
        />
      </Modal>
    </div>
  );
}
