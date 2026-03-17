import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { tokenStorage } from "@/lib/apiClient";
import type { UserAuthResponse } from "@/types/api";

interface AuthContextType {
  user: UserAuthResponse | null;
  isAuthenticated: boolean;
  login: (user: UserAuthResponse, access: string, refresh: string) => void;
  logout: () => void;
}

const USER_KEY = "aime_user";

function loadUser(): UserAuthResponse | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserAuthResponse) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAuthResponse | null>(loadUser);

  const login = useCallback(
    (user: UserAuthResponse, access: string, refresh: string) => {
      tokenStorage.set(access, refresh);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setUser(user);
    },
    [],
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
