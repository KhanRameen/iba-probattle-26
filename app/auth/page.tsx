import { AuthCard } from "@/components/auth/auth-card";
import { auth } from "@/utils/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (session) {
        redirect("/")
    }


    return (
        <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* background pattern */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-muted-foreground/3 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="flex items-center justify-center mb-8 gap-2">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">N</span>
                    </div>
                    <span className="text-lg font-bold tracking-tight">Neighbourly</span>
                </div>

                <AuthCard />
            </div>
        </main>
    )
}