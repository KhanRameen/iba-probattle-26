"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { authClient } from "@/utils/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type AuthMode = "login" | "signup"

export function AuthCard() {
    console.log("AuthCard rendering");

    const [mode, setMode] = useState<AuthMode>("login")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    })

    console.log("Current mode state:", mode);

    const handleSubmit = async (e: React.FormEvent) => {
        console.log("Form submitted!");
        e.preventDefault()
        e.stopPropagation()

        setIsLoading(true)

        try {
            if (mode === "signup") {
                console.log("Attempting signup with:", { name: formData.name, email: formData.email });
                const { data, error } = await authClient.signUp.email({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });

                if (error) {
                    console.log("Signup error:", error);
                    toast.error(`Error Signing Up: ${error?.message}`)
                    setIsLoading(false)
                    return
                }

                console.log("Signup success:", data);
                toast.success("Account created successfully! Redirecting...")
            }
            else {
                console.log("Attempting login with:", { email: formData.email });
                const { data, error } = await authClient.signIn.email({
                    email: formData.email,
                    password: formData.password
                });

                if (error) {
                    console.log("Login error:", error);
                    toast.error(`Error Logging in: ${error?.message}`)
                    setIsLoading(false)
                    return
                }

                console.log("Login success:", data);
                toast.success("Signed in successfully! Redirecting...")
            }

            router.push("/")
            router.refresh()
        } catch (error) {
            console.error("Caught error:", error);
            toast.error("An unexpected error occurred")
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Input changed:", e.target.name, e.target.value);
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const toggleMode = (e: React.MouseEvent) => {
        console.log("Toggle button clicked!");
        e.preventDefault()
        e.stopPropagation()

        const newMode = mode === "login" ? "signup" : "login"
        console.log("Toggling from", mode, "to", newMode);

        setMode(newMode);
        setFormData({ name: "", email: "", password: "" });
    }

    return (
        <Card className="w-full max-w-md border-0 shadow-xl shadow-foreground/5">
            <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                    {mode === "login" ? "Welcome back" : "Create an account"}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    {mode === "login"
                        ? "Enter your credentials to access your account"
                        : "Enter your information to get started"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4" method="POST">
                    {mode === "signup" && (
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Full Name
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="pl-10 h-11"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="pl-10 h-11"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password
                            </Label>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="pl-10 pr-10 h-11"
                                required
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    console.log("Toggle password visibility");
                                    setShowPassword(!showPassword)
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 text-sm font-medium mt-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {mode === "login" ? "Signing in..." : "Creating account..."}
                            </>
                        ) : (
                            mode === "login" ? "Sign in" : "Create account"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="font-medium hover:underline"
                    >
                        {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}