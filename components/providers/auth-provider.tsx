"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type UserSession = {
    id: string;
    name: string;
    email: string;
    role: "PROVIDER" | "SEEKER";
    neighborhoodId: string | null;
} | null;

type AuthContextType = {
    user: UserSession;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserSession>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/users/me");
                if (!res.ok) {
                    router.push("/auth");
                    return;
                }
                const dbUser: UserSession = await res.json();
                if (!dbUser) {
                    router.push("/auth");
                    return;
                }
                setUser(dbUser);

                // RBAC check
                if (!["PROVIDER", "SEEKER"].includes(dbUser.role)) {
                    toast.error("You do not have access.");
                    router.push("/");
                }

                if (!dbUser.neighborhoodId) {
                    toast.info("Complete your profile first.");
                    router.push("/onboarding");
                }
            } catch (err) {
                console.error(err);
                router.push("/auth");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = (allowedRoles?: Array<"PROVIDER" | "SEEKER">) => {
    const { user, loading } = useContext(AuthContext);


    if (!loading && allowedRoles && user && !allowedRoles.includes(user.role)) {
        toast.error("You do not have access.");
    }

    return { user, loading };
};
