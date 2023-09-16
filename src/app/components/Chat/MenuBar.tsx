import { useTheme } from "@/app/ThemeProvider";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Moon, Sun, Users } from "lucide-react";
import { FC } from "react";

interface MenuBarProps {
  onUserMenuClick: () => void;
}

const MenuBar: FC<MenuBarProps> = ({ onUserMenuClick }) => {
  const { theme } = useTheme()
  return (
    <div className="flex items-center justify-between gap-3 border-e border-e-[#DBDDE1] bg-white p-3 dark:border-e-gray-800 dark:bg-[#17191c]">
      <UserButton afterSignOutUrl="/" appearance={{ baseTheme: theme === 'dark' ? dark : undefined }}/>
      <div className="flex gap-6">
        <span className="Show users">
          <Users className="cursor-pointer" onClick={onUserMenuClick} />
        </span>
        <ThemeToggleButton />
      </div>
    </div>
  );
};

const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();

  if (theme === "dark") {
    return (
      <span title="Switch to light theme">
        <Moon className="cursor-pointer" onClick={() => setTheme("light")} />
      </span>
    );
  }

  return (
    <span title="Switch to dark theme">
      <Sun className="cursor-pointer" onClick={() => setTheme("dark")} />
    </span>
  );
};

export default MenuBar;
