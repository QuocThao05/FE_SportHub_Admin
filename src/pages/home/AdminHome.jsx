import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart } from 'lucide-react';
import productService from '../../services/productService';
import userManagementService from '../../services/userManagementService';
import orderService from '../../services/orderService';
import '../../styles/pages/home/Home.scss';

export default function AdminHome() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  const [inventoryData, setInventoryData] = useState({
    inStock: 0,
    selling: 0,
    outOfStock: 0,
    total: 0,
  });

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [orderStatsData, setOrderStatsData] = useState([]);

  const [timeRange, setTimeRange] = useState('1M');
  const [monthFilter, setMonthFilter] = useState('Tháng này');

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [productsRes, usersRes, ordersRes] = await Promise.all([
          productService.getAllProducts(),
          userManagementService.getAllUsers(),
          orderService.getAllOrders(),
        ]);

        // Extract data from responses
        const products = productsRes?.data?.data || [];
        const users = usersRes?.data?.data || [];
        const orders = ordersRes || [];

        // Update stats
        setStats({
          totalProducts: products.length,
          totalUsers: users.length,
          totalOrders: orders.length,
        });

        // Calculate inventory data (tổng số lượng tồn kho)
        let totalStock = 0;
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;

        products.forEach((product) => {
          if (product.sizes && Array.isArray(product.sizes)) {
            product.sizes.forEach((size) => {
              if (size.flavors && Array.isArray(size.flavors)) {
                size.flavors.forEach((flavor) => {
                  const stock = flavor.quantityInStock || 0;
                  totalStock += stock;

                  // Phân loại trạng thái tồn kho
                  if (stock === 0) {
                    outOfStock += 1;
                  } else if (stock < 10) {
                    lowStock += 1;
                  } else {
                    inStock += 1;
                  }
                });
              }
            });
          }
        });

        setInventoryData({
          inStock,
          selling: lowStock,
          outOfStock,
          total: totalStock,
        });

        // Process user growth data (theo thời gian đăng ký)
        const usersByWeek = processUserGrowthData(users, timeRange);
        setUserGrowthData(usersByWeek);

        // Process order stats data (theo thời gian đặt hàng)
        const ordersByWeek = processOrderStatsData(orders, monthFilter);
        setOrderStatsData(ordersByWeek);

        // Get low stock products (top 4 sản phẩm có tồn kho thấp nhất)
        const lowStockList = getLowStockProducts(products);
        setLowStockProducts(lowStockList);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange, monthFilter]);

  // Helper: Process user growth data for different ranges (1W,1M,6M,1Y)
  const processUserGrowthData = (users, range) => {
    const now = new Date();

    // Helper to count in interval [start, end)
    const countInRange = (start, end) => users.filter(u => {
      const d = new Date(u.createdAt);
      return d >= start && d < end;
    }).length;

    if (range === '1W') {
      // Last 7 days, label as day names
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        const start = new Date(day);
        start.setHours(0,0,0,0);
        const end = new Date(day);
        end.setHours(23,59,59,999);
        days.push({
          week: start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          value: countInRange(start, end),
        });
      }
      return days;
    }

    if (range === '1M') {
      // Last 4 weeks
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i + 1) * 7);
        weekStart.setHours(0,0,0,0);
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - i * 7);
        weekEnd.setHours(0,0,0,0);

        const count = countInRange(weekStart, weekEnd);
        weeks.push({ week: `Tuần ${4 - i}`, value: count });
      }
      return weeks;
    }

    if (range === '6M' || range === '1Y') {
      const monthsCount = range === '6M' ? 6 : 12;
      const months = [];
      for (let i = monthsCount - 1; i >= 0; i--) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(m.getFullYear(), m.getMonth(), 1);
        const end = new Date(m.getFullYear(), m.getMonth() + 1, 1);
        const label = `Th ${m.getMonth() + 1}`;
        months.push({ week: label, value: countInRange(start, end) });
      }
      return months;
    }

    // Default: same as 1M
    return processUserGrowthData(users, '1M');
  };

  // Helper: Process order stats data based on monthFilter
  const processOrderStatsData = (orders, filter) => {
    const now = new Date();

    if (filter === 'Tháng này' || filter === 'Tháng trước') {
      const target = new Date(now);
      if (filter === 'Tháng trước') {
        target.setMonth(now.getMonth() - 1);
      }
      const year = target.getFullYear();
      const month = target.getMonth();

      // Weeks in month: 1-7,8-14,15-21,22-end
      const lastDay = new Date(year, month + 1, 0).getDate();
      const weeks = [
        { label: 'Tuần 1', start: 1, end: 7, count: 0 },
        { label: 'Tuần 2', start: 8, end: 14, count: 0 },
        { label: 'Tuần 3', start: 15, end: 21, count: 0 },
        { label: 'Tuần 4', start: 22, end: lastDay, count: 0 },
      ];

      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt || order.orderDate);
        if (orderDate.getFullYear() === year && orderDate.getMonth() === month) {
          const day = orderDate.getDate();
          weeks.forEach(w => {
            if (day >= w.start && day <= w.end) w.count += 1;
          });
        }
      });

      return weeks.map(w => ({ month: w.label, value: w.count }));
    }

    if (filter === '3 tháng gần đây') {
      // Last 3 months, grouped by month
      const months = [];
      for (let i = 2; i >= 0; i--) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = m.getFullYear();
        const month = m.getMonth();
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 1);
        const label = `Th ${month + 1}`;
        const count = orders.filter(o => {
          const d = new Date(o.createdAt || o.orderDate);
          return d >= start && d < end;
        }).length;
        months.push({ month: label, value: count });
      }
      return months;
    }

    // Default: return current month's weeks
    return processOrderStatsData(orders, 'Tháng này');
  };

  // Helper: Get low stock products
  const getLowStockProducts = (products) => {
    const lowStockVariants = [];

    products.forEach((product) => {
      if (product.sizes && Array.isArray(product.sizes)) {
        product.sizes.forEach((size) => {
          if (size.flavors && Array.isArray(size.flavors)) {
            size.flavors.forEach((flavor) => {
              const stock = flavor.quantityInStock || 0;
              
              // Only include variants with stock <= 10 (low stock or out of stock)
              if (stock <= 10) {
                lowStockVariants.push({
                  id: `${product.id}-${size.id || size.size}-${flavor.id || flavor.flavorName}`,
                  productId: product.id,
                  productName: product.name,
                  productCode: `#${product.id}`,
                  image: size.imageUrl || product.sizes?.[0]?.imageUrl || '📦',
                  size: size.size || size.weight || 'N/A',
                  flavor: flavor.flavorName || flavor.flavor || flavor.name || 'Mặc định',
                  stock: stock,
                  status: stock === 0 ? 'Hết hàng' : 'Sắp hết hàng',
                });
              }
            });
          }
        });
      }
    });

    // Sort by stock ascending (out of stock first)
    return lowStockVariants.sort((a, b) => a.stock - b.stock);
  };

  // Helper: Generate SVG line path from data
  const generateLinePath = (data) => {
    if (!data || data.length === 0) return '';

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const width = 600;
    const height = 200;
    const padding = 50;
    const stepX = data.length === 1 ? 0 : (width - padding * 2) / (data.length - 1);

    const points = data.map((item, index) => {
      const x = padding + index * stepX;
      const y = height - padding - ((item.value / maxValue) * (height - padding * 2));
      return { x, y };
    });

    if (points.length === 1) {
      return `M ${points[0].x},${points[0].y}`;
    }

    // Create smooth curve using quadratic bezier
    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;

      path += ` Q ${current.x},${current.y} ${midX},${(current.y + next.y) / 2}`;
      if (i === points.length - 2) {
        path += ` T ${next.x},${next.y}`;
      }
    }

    return path;
  };

  return (
    <div className="admin-home">
      <div className="dashboard-header">
        <h1>Bảng điều khiển tổng quan</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Tổng số sản phẩm</p>
            <h2 className="stat-value">
              {loading ? '...' : stats.totalProducts.toLocaleString()}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon users">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Tổng số người dùng</p>
            <h2 className="stat-value">
              {loading ? '...' : stats.totalUsers.toLocaleString()}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Tổng số đơn hàng</p>
            <h2 className="stat-value">
              {loading ? '...' : stats.totalOrders.toLocaleString()}
            </h2>
          </div>
        </div>
      </div>

      {/* Charts Grid - 3 columns */}
      <div className="charts-grid-three">
        {/* Product Inventory Chart */}
        <div className="chart-card inventory-chart">
          <h3 className="chart-title">Tỷ lệ tồn kho sản phẩm</h3>
          <div className="donut-chart">
            <svg viewBox="0 0 200 200" width="200" height="200">
              {/* Background circle - full ring */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#1e293b"
                strokeWidth="40"
              />
              {/* Green segment - Còn hàng */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#10b981"
                strokeWidth="40"
                strokeDasharray={`${(inventoryData.inStock / (inventoryData.inStock + inventoryData.selling + inventoryData.outOfStock || 1)) * 502.4} 502.4`}
                transform="rotate(-90 100 100)"
              />
              {/* Yellow segment - Sắp hết */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="40"
                strokeDasharray={`${(inventoryData.selling / (inventoryData.inStock + inventoryData.selling + inventoryData.outOfStock || 1)) * 502.4} 502.4`}
                strokeDashoffset={`-${(inventoryData.inStock / (inventoryData.inStock + inventoryData.selling + inventoryData.outOfStock || 1)) * 502.4}`}
                transform="rotate(-90 100 100)"
              />
              {/* Red segment - Hết hàng */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#ef4444"
                strokeWidth="40"
                strokeDasharray={`${(inventoryData.outOfStock / (inventoryData.inStock + inventoryData.selling + inventoryData.outOfStock || 1)) * 502.4} 502.4`}
                strokeDashoffset={`-${((inventoryData.inStock + inventoryData.selling) / (inventoryData.inStock + inventoryData.selling + inventoryData.outOfStock || 1)) * 502.4}`}
                transform="rotate(-90 100 100)"
              />
              <text x="100" y="95" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#fff">
                {inventoryData.total.toLocaleString()}
              </text>
              <text x="100" y="115" textAnchor="middle" fontSize="14" fill="#9ca3af">
                Tồn kho
              </text>
            </svg>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot green"></span>
              <span>Còn hàng</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot yellow"></span>
              <span>Sắp hết</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot red"></span>
              <span>Hết hàng</span>
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="chart-card user-growth-chart">
          <div className="chart-header">
            <h3 className="chart-title">Tăng trưởng người dùng</h3>
            <div className="time-filter">
              <button className={timeRange === '1W' ? 'active' : ''} onClick={() => setTimeRange('1W')}>
                1W
              </button>
              <button className={timeRange === '1M' ? 'active' : ''} onClick={() => setTimeRange('1M')}>
                1M
              </button>
              <button className={timeRange === '6M' ? 'active' : ''} onClick={() => setTimeRange('6M')}>
                6M
              </button>
              <button className={timeRange === '1Y' ? 'active' : ''} onClick={() => setTimeRange('1Y')}>
                1Y
              </button>
            </div>
          </div>
          <div className="line-chart">
            <svg viewBox="0 0 600 200" width="100%" height="200">
              {/* Grid lines */}
              <line x1="0" y1="50" x2="600" y2="50" stroke="#374151" strokeWidth="1" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#374151" strokeWidth="1" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="#374151" strokeWidth="1" />
              
              {/* Line path - dynamic based on user data */}
              {userGrowthData.length > 0 && (
                <>
                  <path
                    d={generateLinePath(userGrowthData)}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Data points with values */}
                  {userGrowthData.map((item, index) => {
                    const maxValue = Math.max(...userGrowthData.map(d => d.value), 1);
                    const width = 600;
                    const height = 200;
                    const padding = 50;
                    const stepX = userGrowthData.length === 1 ? 0 : (width - padding * 2) / (userGrowthData.length - 1);
                    const x = padding + index * stepX;
                    const y = height - padding - ((item.value / maxValue) * (height - padding * 2));
                    
                    return (
                      <g key={index}>
                        <circle cx={x} cy={y} r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                        <text x={x} y={y - 15} textAnchor="middle" fontSize="30" fill="#f1f5f9" fontWeight="700">
                          {item.value}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
            <div className="chart-labels">
              {userGrowthData.map((item, idx) => (
                <span key={idx}>{item.week}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Orders Chart */}
        <div className="chart-card orders-chart">
          <div className="chart-header">
            <h3 className="chart-title">Thống kê đơn hàng</h3>
            <select 
              className="month-select"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <option>Tháng này</option>
              <option>Tháng trước</option>
              <option>3 tháng gần đây</option>
            </select>
          </div>
          <div className="bar-chart">
            <div className="bars-container">
              {orderStatsData.map((item, index) => {
                const maxValue = Math.max(...orderStatsData.map(d => d.value), 1);
                // Set minimum height of 15% for non-zero values to make them visible
                let heightPercent;
                if (item.value === 0) {
                  heightPercent = 8; // Small visible bar for zero values
                } else {
                  // Non-zero values: minimum 15%, maximum 100%
                  heightPercent = Math.max(((item.value / maxValue) * 100), 30);
                }
                
                return (
                  <div key={index} className="bar-group">
                    <div
                      className={`bar ${item.value === 0 ? 'zero' : ''}`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      <span className="bar-value">{item.value}</span>
                    </div>
                    <span className="bar-label">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full Width - Products Table */}
      <div className="chart-card products-table full-width">
        <div className="table-header">
          <h3 className="chart-title">Sản phẩm sắp hết hàng</h3>
          <a href="/products" className="view-all">
            Xem tất cả
          </a>
        </div>
        <table className="products-list">
          <thead>
            <tr>
              <th>SẢN PHẨM</th>
              <th>BIẾN THỂ</th>
              <th>HƯƠNG VỊ</th>
              <th>SỐ LƯỢNG TỒN KHO</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.map((variant) => (
              <tr key={variant.id}>
                <td>
                  <div className="product-info">
                    <span className="product-image">
                      {typeof variant.image === 'string' && variant.image.startsWith('http') ? (
                        <img src={variant.image} alt={variant.productName} className="product-image-img" />
                      ) : (
                        variant.image
                      )}
                    </span>
                    <div>
                      <div className="product-name">{variant.productName}</div>
                      <div className="product-code">{variant.productCode}</div>
                    </div>
                  </div>
                </td>
                <td className="stock-count">{variant.size}</td>
                <td className="stock-count">{variant.flavor}</td>
                <td className="stock-count">{variant.stock}</td>
                <td>
                  <span
                    className={`status-badge ${
                      variant.status === 'Còn hàng'
                        ? 'in-stock'
                        : variant.status === 'Sắp hết hàng'
                        ? 'low-stock'
                        : 'out-of-stock'
                    }`}
                  >
                    {variant.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
