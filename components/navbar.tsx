"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, User, LayoutDashboard, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "./providers/auth-provider";


export function Navbar() {
    const { user, loading } = useAuth(["SEEKER", "PROVIDER"]);
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: "/", label: "Home", icon: Home },
        ...(user
            ? [
                { href: "/profile", label: "Profile", icon: User },
                ...(user.role === "PROVIDER"
                    ? [
                        {
                            href: "/provider/dashboard",
                            label: "Dashboard",
                            icon: LayoutDashboard,
                        },
                    ]
                    : []),
            ]
            : []),
    ];

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <Home className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-semibold tracking-tight text-foreground">
                        Neighborly
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                            <Button
                                variant={pathname === link.href ? "secondary" : "ghost"}
                                size="sm"
                                className="gap-2"
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Button>
                        </Link>
                    ))}
                </div>

                {/* User Menu / Auth */}
                <div className="flex items-center gap-2">
                    {loading ? (
                        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                    ) : user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-9 w-9 rounded-full"
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="flex flex-col gap-1 p-2">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                    <span className="mt-1 inline-flex w-fit rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                                        {user.role}
                                    </span>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer gap-2">
                                        <User className="h-4 w-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                {user.role === "PROVIDER" && (
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/provider/dashboard"
                                            className="cursor-pointer gap-2"
                                        >
                                            <LayoutDashboard className="h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/sign-in" className="cursor-pointer gap-2">
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/sign-in">
                            <Button size="sm">Sign In</Button>
                        </Link>
                    )}

                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <div
                className={cn(
                    "border-t border-border md:hidden",
                    mobileMenuOpen ? "block" : "hidden"
                )}
            >
                <div className="space-y-1 px-4 py-3">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Button
                                variant={pathname === link.href ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2"
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Button>
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
}
