"use client";

import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function Providers({ children }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    toast.dismiss();
  }, [pathname]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

