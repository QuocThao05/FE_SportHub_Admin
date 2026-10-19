import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { DollarSign, ShoppingCart, CheckCircle, XCircle } from "lucide-react";
import revenueService from "../../services/revenueService";
import "../../styles/pages/home/Home.scss";

export default function RevenueStatistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [groupBy, setGroupBy] = useState("day");

  useEffect(() => {
    fetchData();
  }, [groupBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await revenueService.getRevenueSummary(from, to, groupBy);
      if (res) {
        setData(res);
      }
    } catch (error) {
      console.error("Error fetching revenue data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchData();
  };

  if (loading && !data) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (!data) {
    return <div>Không có dữ liệu thống kê.</div>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Chuẩn bị data cho biểu đồ tròn (Phương thức thanh toán)
  const paymentData = Object.keys(data.revenueByPayment).map(key => ({
    name: key === "COD" ? "Thanh toán khi nhận hàng" : (key === "ONLINE" || key === "PAYOS" ? "Thanh toán Online" : key),
    value: data.revenueByPayment[key]
  }));
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="admin-home">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Thống kê Doanh thu</h1>
        <div className="filter-group" style={{ display: 'flex', gap: '10px' }}>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="form-control" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <span>-</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="form-control" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="form-control" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="day">Theo ngày</option>
            <option value="month">Theo tháng</option>
            <option value="year">Theo năm</option>
          </select>
          <button onClick={handleFilter} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Lọc</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginTop: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Tổng doanh thu</p>
            <h2 className="stat-value">{formatCurrency(data.totalRevenue)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <ShoppingCart size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Đơn hoàn thành</p>
            <h2 className="stat-value">{data.completedOrders}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">AOV (Giá trị TB đơn)</p>
            <h2 className="stat-value">{formatCurrency(data.avgOrderValue)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
            <XCircle size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Đơn đã hủy</p>
            <h2 className="stat-value">{data.cancelledOrders}</h2>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid-three" style={{ marginTop: '30px', gridTemplateColumns: '2fr 1fr' }}>
        {/* Biểu đồ doanh thu theo thời gian */}
        <div className="chart-card" style={{ gridColumn: 'span 1' }}>
          <h3 className="chart-title">Biểu đồ Doanh thu ({groupBy === 'day' ? 'Ngày' : groupBy === 'month' ? 'Tháng' : 'Năm'})</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={data.revenueByDate} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3b82f6" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ phương thức thanh toán */}
        <div className="chart-card" style={{ gridColumn: 'span 1' }}>
          <h3 className="chart-title">Phương thức thanh toán</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => entry.name}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
