import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Drawer,
  Descriptions,
  Divider,
  Select,
  Input,
  Tooltip,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import orderService from "../../services/orderService";
import "../../styles/pages/home/OrderManagement.scss";

const { Option } = Select;

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---------------------------
  // Status Color
  // ---------------------------
  const statusColors = {
    PENDING: "orange",
    CONFIRMED: "green",
    CANCELLED: "red",
  };

  // ---------------------------
  // Fetch API getAllOrders()
  // ---------------------------
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getAllOrders();
        console.log("Orders API:", data);

        const mapped = data.map((o) => ({
          orderId: o.id,
          orderCode: o.orderNumber,
          customerName: o.shippingAddress?.recipientName || "",
          customerPhone: o.shippingAddress?.phoneNumber || "",
          customerEmail: "",
          shippingAddress: o.shippingAddress?.fullAddress || "",
          note: o.note || "",
          totalAmount: Number(o.totalAmount),
          status: o.status,
          createdAt: o.createdAt,
          items:
            o.items?.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              sizeName: i.sizeName,
              flavorName: i.flavorName,
              quantity: i.quantity,
              price: Number(i.price),
              totalPrice: Number(i.subtotal),
            })) || [],
        }));

        setOrders(mapped);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // ---------------------------
  // Handle status change (local only)
  // ---------------------------
const handleStatusChange = async (value, order) => {
  try {
    const payload = {
  orderId: order.orderId,
  status: value,
  note: order.note || "",
};
    console.log("orderId =", order.orderId);
    console.log("payload =", payload);

    const updated = await orderService.updateStatusOrder(
      order.orderId,
      payload
    );

    console.log(updated);

    setSelectedOrder((prev) => ({
      ...prev,
      status: value,
    }));

    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === order.orderId
          ? { ...o, status: value }
          : o
      )
    );
  } catch (error) {
    console.error(error);
  }
};


  // ---------------------------
  // Filtered Orders
  // ---------------------------
  const filteredOrders = orders
    .filter(
      (o) =>
        o.orderCode.toLowerCase().includes(filterText.toLowerCase()) ||
        o.customerName.toLowerCase().includes(filterText.toLowerCase())
    )
    .filter((o) =>
      filterStatus && filterStatus !== "ALL" ? o.status === filterStatus : true
    );

  // ---------------------------
  // Columns
  // ---------------------------
  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderCode",
      key: "orderCode",
      sorter: (a, b) => a.orderCode.localeCompare(b.orderCode),
    },
    {
      title: "Người đặt",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Số điện thoại",
      dataIndex: "customerPhone",
      key: "customerPhone",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v) => v.toLocaleString() + "₫",
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v) => <Tag color={statusColors[v] || "default"}>{v}</Tag>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined style={{ fontSize: 20, color: "#2563eb" }} />}
            onClick={() => {
              setSelectedOrder(record);
              setOpen(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="order-management">
      <h2>Quản lý đơn hàng</h2>

      {/* Filter */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <Input
          placeholder="Tìm mã đơn hoặc khách hàng"
          style={{ width: 240 }}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />

        <Select
          placeholder="Chọn trạng thái"
          style={{ width: 180 }}
          value={filterStatus}
          onChange={(value) => setFilterStatus(value)}
          allowClear
        >
          <Option value="ALL">Tất cả</Option> {/* ✔ Thêm dòng này */}
          {Object.keys(statusColors).map((s) => (
            <Option key={s} value={s}>
              {s}
            </Option>
          ))}
        </Select>
      </div>

      <Table
        dataSource={filteredOrders}
        columns={columns}
        rowKey="orderId"
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 5 }}
      />

      {/* Drawer */}
      <Drawer
        title={`Chi tiết đơn hàng: ${selectedOrder?.orderCode}`}
        width={650}
        onClose={() => setOpen(false)}
        open={open}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Người đặt">
                {selectedOrder.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.customerPhone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedOrder.shippingAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {selectedOrder.note || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Select
                  value={selectedOrder.status}
                  onChange={(value) => handleStatusChange(value, selectedOrder)}
                  style={{ width: 180 }}
                >
                  {Object.keys(statusColors).map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                {selectedOrder.totalAmount.toLocaleString()}₫
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3>Danh sách sản phẩm</h3>
            {selectedOrder.items.map((item, index) => (
              <div key={index} className="product-item">
                <p>
                  <strong>{item.productName}</strong>
                </p>
                <p>Size: {item.sizeName}</p>
                <p>Hương vị: {item.flavorName}</p>
                <p>
                  {item.quantity} × {item.price.toLocaleString()}₫
                </p>
                <p>
                  <strong>Tổng: {item.totalPrice.toLocaleString()}₫</strong>
                </p>
              </div>
            ))}
          </>
        )}
      </Drawer>
    </div>
  );
}
