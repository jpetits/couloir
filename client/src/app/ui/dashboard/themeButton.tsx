import { useTheme } from "next-themes";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import SunIcon from "@heroicons/react/24/outline/SunIcon";

export default function ThemeButton() {
  const theme = useTheme();

  return (
    <button
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      onClick={() => {
        theme.setTheme(theme.resolvedTheme === "light" ? "dark" : "light");
      }}
    >
      {theme.resolvedTheme === "light" ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
      )}
    </button>
  );
}
