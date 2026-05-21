import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
import { useTheme } from "next-themes";

export default function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      className="cursor-pointer p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
    >
      <SunIcon className="w-5 h-5 dark:hidden" />
      <MoonIcon className="w-5 h-5 hidden dark:block" />
    </button>
  );
}
