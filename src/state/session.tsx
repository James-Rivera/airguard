import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@/domain/models";
import { demoUser } from "@/domain/seed";

const SESSION_KEY = "airguard.session.v3";

type SessionContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => {
        if (raw) setUser(JSON.parse(raw) as User);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      isLoading,
      async signIn(email: string, password: string) {
        const validEmail = email.trim().toLowerCase() === "admin@airguard.demo" || email.trim().toLowerCase() === "homeowner@airguard.demo";
        if (!validEmail || password !== "airguard123") return false;
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(demoUser));
        setUser(demoUser);
        return true;
      },
      async signOut() {
        await AsyncStorage.removeItem(SESSION_KEY);
        setUser(null);
      },
    }),
    [isLoading, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
