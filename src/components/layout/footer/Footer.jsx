import React from 'react';
import '../../../styles/components/Footer.scss';
import Logo from "../header/Logo"; //


export default function Footer() {
  return (
       <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Cột 1: Thông tin công ty */}
          <div className="footer-column company-column">
            <div className="logo-section">
              <Logo />
            </div>
            <div className="company-info">
              <p>806 Quốc lộ 22, Ấp Mỹ Hòa 3, Xã Tân Xuân, Huyện Hóc Môn</p>
              <p>Hotline: 0773 644 284</p>
              <p>Email: trainup@gmail.com</p>
            </div>
          </div>

          {/* Cột 2: Liên kết */}
          <div className="footer-column">
            <h4>Liên kết</h4>
            <ul>
              <li><a href="#" className="footer-link">Trang chủ</a></li>
              <li><a href="#" className="footer-link">Huấn luyện viên</a></li>
              <li><a href="#" className="footer-link">Sản phẩm</a></li>
              <li><a href="#" className="footer-link">Lịch tập</a></li>
            </ul>
          </div>

          {/* Cột 3: Mạng xã hội */}
          <div className="footer-column">
            <h4>Mạng xã hội</h4>
            <ul>
              <li><a href="#" className="footer-link social-link">Facebook</a></li>
              <li><a href="#" className="footer-link social-link">Instagram</a></li>
              <li><a href="#" className="footer-link social-link">TikTok</a></li>
            </ul>
          </div>

          {/* Cột 4: Chính sách */}
          <div className="footer-column">
            <h4>Chính sách</h4>
            <ul>
              <li><a href="#" className="footer-link">Chính sách bảo mật</a></li>
              <li><a href="#" className="footer-link">Điều khoản dịch vụ</a></li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom">
          <div className="copyright">
            <p>© 2025 PulseFit. All rights reserved.</p>
          </div>
          <div className="made-for">
            <p>Made for movers.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
