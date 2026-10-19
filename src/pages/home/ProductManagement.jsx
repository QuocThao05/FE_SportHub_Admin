// ProductManagement.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Package,
  TrendingUp,
} from "lucide-react";
import "../../styles/pages/home/ProductManagement.scss";
import { useNavigate } from "react-router-dom";
import productService from "../../services/productService";

export default function ProductManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [expandedRows, setExpandedRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts();
        if (response.status === 200 && response.data) {
          setProducts(response.data.data || []);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const brands = ["all", ...new Set(products.map((p) => p.brand))];

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand =
        selectedBrand === "all" || product.brand === selectedBrand;
      return matchesSearch && matchesBrand;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === "price") {
          aValue = Math.min(...a.sizes.map((s) => s.discountPrice));
          bValue = Math.min(...b.sizes.map((s) => s.discountPrice));
        } else if (sortConfig.key === "stock") {
          aValue = a.sizes.reduce(
            (sum, s) =>
              sum + s.flavors.reduce((fSum, f) => fSum + f.quantityInStock, 0),
            0
          );
          bValue = b.sizes.reduce(
            (sum, s) =>
              sum + s.flavors.reduce((fSum, f) => fSum + f.quantityInStock, 0),
            0
          );
        } else if (sortConfig.key === "sold") {
          aValue = a.sizes.reduce(
            (sum, s) =>
              sum + s.flavors.reduce((fSum, f) => fSum + f.quantitySold, 0),
            0
          );
          bValue = b.sizes.reduce(
            (sum, s) =>
              sum + s.flavors.reduce((fSum, f) => fSum + f.quantitySold, 0),
            0
          );
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [products, searchTerm, selectedBrand, sortConfig]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getTotalStock = (product) => {
    return product.sizes.reduce(
      (sum, s) =>
        sum + s.flavors.reduce((fSum, f) => fSum + f.quantityInStock, 0),
      0
    );
  };

  const getTotalSold = (product) => {
    return product.sizes.reduce(
      (sum, s) => sum + s.flavors.reduce((fSum, f) => fSum + f.quantitySold, 0),
      0
    );
  };

  const getMinPrice = (product) => {
    return Math.min(...product.sizes.map((s) => s.discountPrice));
  };

  const handleAddProduct = () => {
    navigate("/add-product");
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-management">
        <div className="product-management__container">
          <div style={{ textAlign: "center", padding: "50px" }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-management">
        <div className="product-management__container">
          <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-management">
      <div className="product-management__container">
        {/* Header */}
        <div className="product-management__header">
          <h1 className="product-management__title">
            <Package className="product-management__icon" size={32} />
            Quản lý sản phẩm
          </h1>
          <p className="product-management__subtitle">
            Quản lý {filteredProducts.length} sản phẩm
          </p>
          {/* Add Product Button */}
          <div className="product-management__actions">
            <button className="add-product-btn" onClick={handleAddProduct}>
              + Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="product-management__filters">
          <div className="search-box">
            <Search className="search-box__icon" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-box__input"
            />
          </div>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="brand-filter"
          >
            <option value="all">Tất cả thương hiệu</option>
            {brands
              .filter((b) => b !== "all")
              .map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
          </select>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th className="product-table__th product-table__th--toggle"></th>
                <th className="product-table__th">Sản phẩm</th>
                <th className="product-table__th">Thương hiệu</th>
                <th
                  onClick={() => handleSort("price")}
                  className="product-table__th product-table__th--sortable"
                >
                  Giá thấp nhất{" "}
                  {sortConfig.key === "price" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("stock")}
                  className="product-table__th product-table__th--sortable product-table__th--center"
                >
                  Tồn kho{" "}
                  {sortConfig.key === "stock" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("sold")}
                  className="product-table__th product-table__th--sortable product-table__th--center"
                >
                  Đã bán{" "}
                  {sortConfig.key === "sold" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className="product-table__th product-table__th--center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <React.Fragment key={product.id}>
                  <tr
                    className={`product-table__row ${
                      expandedRows[product.id]
                        ? "product-table__row--expanded"
                        : ""
                    }`}
                  >
                    <td className="product-table__td product-table__td--center">
                      <button
                        onClick={() => toggleRow(product.id)}
                        className="toggle-btn"
                      >
                        {expandedRows[product.id] ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </button>
                    </td>
                    <td className="product-table__td">
                      <div className="product-info">
                        <img
                          src={product.sizes[0]?.imageUrl}
                          alt={product.name}
                          className="product-info__image"
                        />
                        <div className="product-info__details">
                          <div className="product-info__name">
                            {product.name}
                          </div>
                          <div className="product-info__description">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="product-table__td">{product.brand}</td>
                    <td className="product-table__td product-table__td--price">
                      {getMinPrice(product).toLocaleString()} ₫
                    </td>
                    <td className="product-table__td product-table__td--center">
                      <span
                        className={`stock-badge ${
                          getTotalStock(product) > 20
                            ? "stock-badge--high"
                            : "stock-badge--low"
                        }`}
                      >
                        {getTotalStock(product)}
                      </span>
                    </td>
                    <td className="product-table__td product-table__td--center">
                      <div className="sold-info">
                        <TrendingUp size={16} className="sold-info__icon" />
                        <span className="sold-info__value">
                          {getTotalSold(product)}
                        </span>
                      </div>
                    </td>
                    <td className="product-table__td product-table__td--center">
                      <div className="action-buttons">
                        <button className="action-btn action-btn--view">
                          <Eye size={18} />
                        </button>
                        <button
                          className="action-btn action-btn--edit"
                          onClick={() =>
                            navigate("/add-product", { state: { product } })
                          }
                        >
                          <Edit size={18} />
                        </button>
                        <button className="action-btn action-btn--delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedRows[product.id] && (
                    <tr className="expanded-row">
                      <td colSpan="7" className="expanded-row__content">
                        <div className="size-list">
                          {product.sizes.map((size, idx) => (
                            <div key={idx} className="size-card">
                              <div className="size-card__content">
                                <img
                                  src={size.imageUrl}
                                  alt={size.size}
                                  className="size-card__image"
                                />
                                <div className="size-card__info">
                                  <h4 className="size-card__title">
                                    Size: {size.size} ({size.weight})
                                  </h4>
                                  <div className="size-card__prices">
                                    <div className="price-item">
                                      <div className="price-item__label">
                                        Giá gốc
                                      </div>
                                      <div className="price-item__value price-item__value--original">
                                        {size.price.toLocaleString()} ₫
                                      </div>
                                    </div>
                                    <div className="price-item">
                                      <div className="price-item__label">
                                        Giá giảm
                                      </div>
                                      <div className="price-item__value price-item__value--discount">
                                        {size.discountPrice.toLocaleString()} ₫
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flavors-section">
                                    <h5 className="flavors-section__title">
                                      Hương vị:
                                    </h5>
                                    <div className="flavor-list">
                                      {size.flavors.map((flavor, fIdx) => (
                                        <div
                                          key={fIdx}
                                          className={`flavor-card ${
                                            flavor.active
                                              ? "flavor-card--active"
                                              : "flavor-card--inactive"
                                          }`}
                                        >
                                          <div className="flavor-card__name">
                                            {flavor.flavor}
                                          </div>
                                          <div className="flavor-card__stats">
                                            Kho: {flavor.quantityInStock} | Bán:{" "}
                                            {flavor.quantitySold}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {size.imageUrls && size.imageUrls.length > 0 && (
                                  <div className="sub-images">
                                    <h5 className="sub-images__title">
                                      Ảnh phụ:
                                    </h5>
                                    <div className="sub-images__gallery">
                                      {size.imageUrls.map((url, urlIdx) => (
                                        <img
                                          key={urlIdx}
                                          src={url}
                                          alt={`Sub ${urlIdx}`}
                                          className="sub-images__item"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination__info">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)}{" "}
              trong {filteredProducts.length} sản phẩm
            </div>
            <div className="pagination__controls">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`pagination__btn ${
                  currentPage === 1 ? "pagination__btn--disabled" : ""
                }`}
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`pagination__btn pagination__btn--page ${
                    currentPage === i + 1 ? "pagination__btn--active" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={`pagination__btn ${
                  currentPage === totalPages ? "pagination__btn--disabled" : ""
                }`}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}