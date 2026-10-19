import { Bell } from "lucide-react";
import "../../../styles/components/AdminHeader.scss";
import UserMenu from "./UserMenu";

export default function AdminHeader() {
  return (
    <header className="admin-header">
      <div className="header-left">
        <h2 className="logo">
          TrainUp <span>Admin</span>
        </h2>
      </div>

      <div className="header-right">
        <button className="icon-btn">
          <Bell size={20} />
        </button>

        <UserMenu />
      </div>
    </header>
  );
}
