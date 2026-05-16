import { createContext, useContext, type ReactNode } from "react";

export interface ReplitUser {
  id: string;
  name: string;
  profileImage?: string;
}

interface AuthContextValue {
  user: ReplitUser;
  isReady: boolean;
  signOut: () => Promise<void>;
}

const DEFAULT_USER: ReplitUser = {
  id: "local",
  name: "Developer",
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: DEFAULT_USER,
        isReady: true,
        signOut: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
