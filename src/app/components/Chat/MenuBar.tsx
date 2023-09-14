import { UserButton } from "@clerk/nextjs";
import { Users } from "lucide-react";
import { FC } from "react";

interface MenuBarProps {
  onUserMenuClick: () => void;
}

const MenuBar: FC<MenuBarProps> = ({ onUserMenuClick }) => {
  return (
    <div className="flex items-center justify-between gap-3 border-e border-e-[#DBDDE1] bg-white p-3">
      <UserButton afterSignOutUrl="/" />
      <div className="flex gap-6">
        <span className="Show users">
          <Users className="cursor-pointer" onClick={onUserMenuClick} />
        </span>
      </div>
    </div>
  );
};

export default MenuBar;
