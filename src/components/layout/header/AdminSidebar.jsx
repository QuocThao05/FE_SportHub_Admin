import { useState, useEffect } from "react";
import {
  Home,
  Users,
  Package,
  Store,
  MessageSquare,
  DollarSign,
  Ticket,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import "../../../styles/layout/AdminSidebar.scss";


// Component con render menu
const MenuItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isSubMenuActive =
    item.submenu &&
    item.submenu.some((sub) =>
      location.pathname.startsWith(sub.path)
    );


  useEffect(() => {
    if (isSubMenuActive) {
      setIsOpen(true);
    }
  }, [isSubMenuActive]);


  // Menu có submenu
  if (item.submenu) {
    return (
      <div
        className={`menu-item-dropdown ${
          isOpen ? "open" : ""
        }`}
      >
        <div
          className={`menu-item parent ${
            isSubMenuActive ? "active" : ""
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {item.icon}

          <span>{item.label}</span>

          {isOpen ? (
            <ChevronUp
              size={16}
              className="chevron"
            />
          ) : (
            <ChevronDown
              size={16}
              className="chevron"
            />
          )}
        </div>


        {isOpen && (
          <div className="submenu">
            {item.submenu.map((sub) => (
              <NavLink
                key={sub.path}
                to={sub.path}
                className={({ isActive }) =>
                  isActive
                    ? "submenu-item active"
                    : "submenu-item"
                }
              >
                {sub.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }


  // Menu bình thường
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        isActive
          ? "menu-item active"
          : "menu-item"
      }
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );
};



// Sidebar chính
export default function AdminSidebar() {


  const menuItems = [
    {
      path: "/",
      icon: <Home size={18} />,
      label: "Tổng quan",
    },
    {
      path: "/revenue",
      icon: <DollarSign size={18} />,
      label: "Thống kê doanh thu",
    },
    {
      path: "/coupons",
      icon: <Ticket size={18} />,
      label: "Mã khuyến mãi",
    },

    {
      label: "Sản phẩm",
      icon: <Package size={18} />,
      submenu: [
        {
          path: "/product-types",
          label: "Loại sản phẩm",
        },
        {
          path: "/products",
          label: "Danh sách sản phẩm",
        },
      ],
    },


    {
      path: "/users",
      icon: <Users size={18} />,
      label: "Quản lý người dùng",
    },


    {
      path: "/orders",
      icon: <Package size={18} />,
      label: "Quản lý đơn hàng",
    },


    {
      path: "/shops",
      icon: <Store size={18} />,
      label: "Quản lý Shop",
    },


    // ======================
    // QUẢN LÝ ĐÁNH GIÁ
    // ======================
    {
      path: "/reviews",
      icon: <MessageSquare size={18} />,
      label: "Quản lý đánh giá",
    },
  ];



  return (
    <aside className="admin-sidebar">
      <nav>
        {menuItems.map((item, index) => (
          <MenuItem
            key={item.path || index}
            item={item}
          />
        ))}
      </nav>
    </aside>
  );
}