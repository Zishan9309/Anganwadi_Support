import { useState, useEffect } from "react";
import { User, isAuthenticated, getCurrentUser, logout } from "../utils/auth";
import { router, usePathname } from "expo-router";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        if (authenticated) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          setIsLoggedIn(true);
          if (pathname === "/login") {
            router.replace("/(tabs)/students");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [pathname]);

  const signOut = async () => {
    await logout();
    setUser(null);
    setIsLoggedIn(false);
    router.replace("/login");
  };

  return { user, loading, isLoggedIn, signOut };
};
