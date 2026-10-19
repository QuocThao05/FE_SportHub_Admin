import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Switch, message } from "antd";
import { Plus, Edit, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import couponService from "../../services/couponService";
import "../../styles/pages/home/Home.scss";

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponService.getAllCoupons();
      if (data) setCoupons(data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (coupon = null) => {
    setIsModalOpen(true);
    if (coupon) {
      setEditingId(coupon.id);
      form.setFieldsValue({
        ...coupon,
        dates: [
          coupon.startDate ? dayjs(coupon.startDate) : null,
          coupon.endDate ? dayjs(coupon.endDate) : null,
        ]
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        startDate: values.dates && values.dates[0] ? values.dates[0].toISOString() : null,
        endDate: values.dates && values.dates[1] ? values.dates[1].toISOString() : null,
      };
      delete payload.dates;

      if (editingId) {
        await couponService.updateCoupon(editingId, payload);
        message.success("Cập nhật mã khuyến mãi thành công");
      } else {
        await couponService.createCoupon(payload);
        message.success("Tạo mã khuyến mãi thành công");
      }
      handleCloseModal();
      fetchCoupons();
    } catch (error) {
      message.error("Lỗi lưu khuyến mãi");
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa mã này?",
      onOk: async () => {
        try {
          await couponService.deleteCoupon(id);
          message.success("Xóa thành công");
          fetchCoupons();
        } catch (error) {
          message.error("Lỗi khi xóa");
        }
      }
    });
  };

  const columns = [
    {
      title: "Mã Coupon",
      dataIndex: "code",
      key: "code",
      render: (text) => <strong>{text}</strong>
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (text) => text === "PERCENTAGE" ? "Phần trăm (%)" : "Tiền mặt (VNĐ)"
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (val, record) => record.type === "PERCENTAGE" ? `${val}%` : `${val.toLocaleString()}đ`
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minOrderAmount",
      key: "minOrderAmount",
      render: (val) => val ? `${val.toLocaleString()}đ` : "0đ"
    },
    {
      title: "Đã dùng / Giới hạn",
      key: "usage",
      render: (_, record) => `${record.usageCount || 0} / ${record.usageLimit || "∞"}`
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <span style={{ color: isActive ? 'green' : 'red' }}>
          {isActive ? 'Hoạt động' : 'Đã tắt'}
        </span>
      )
    },
    {
      title: "Loại mã",
      dataIndex: "isPublic",
      key: "isPublic",
      render: (isPublic) => (
        <span style={{ color: isPublic !== false ? '#0984e3' : '#d63031', fontWeight: 'bold' }}>
          {isPublic !== false ? 'Công khai' : 'Độc quyền'}
        </span>
      )
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button icon={<Edit size={16} />} onClick={() => handleOpenModal(record)} />
          <Button danger icon={<Trash2 size={16} />} onClick={() => handleDelete(record.id)} />
        </div>
      )
    }
  ];

  return (
    <div className="admin-home">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Quản lý Khuyến mãi</h1>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => handleOpenModal()}>
          Tạo mã mới
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={coupons} 
        rowKey="id" 
        loading={loading}
        style={{ marginTop: '20px' }}
      />

      <Modal
        title={editingId ? "Sửa mã khuyến mãi" : "Tạo mã khuyến mãi mới"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="code" label="Mã Coupon (Ví dụ: SUMMER2024)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <Form.Item name="type" label="Loại giảm giá" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select>
                <Select.Option value="PERCENTAGE">Theo Phần Trăm (%)</Select.Option>
                <Select.Option value="FIXED_AMOUNT">Theo Số Tiền (VNĐ)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="value" label="Giá trị giảm" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <Form.Item name="minOrderAmount" label="Đơn tối thiểu (VNĐ)" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="maxDiscount" label="Giảm tối đa (VNĐ, áp dụng cho %)" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item name="usageLimit" label="Giới hạn số lượt dùng (để trống nếu không giới hạn)">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="dates" label="Thời gian áp dụng">
            <DatePicker.RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái kích hoạt" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>

          <Form.Item name="isPublic" label="Công khai (Tắt để làm mã độc quyền)" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Công khai" unCheckedChildren="Độc quyền" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button onClick={handleCloseModal}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
