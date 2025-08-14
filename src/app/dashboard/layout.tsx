
"use client";

import Link from "next/link";
import {
  CircleUser,
  Menu,
  Store,
  ShoppingCart,
  Users,
  Settings,
  Receipt,
  Utensils,
  LogOut,
  LineChart,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import { SharedStateProvider, useSharedState } from "@/context/SharedStateContext";
import { NavigationEvents } from '@/components/navigation-events';


const translations = {
  en: {
    pos: "Point of Sale",
    products: "Products",
    tables: "Tables",
    invoices: "Invoices",
    reports: "Reports",
    customers: "Customers",
    settings: "Settings",
    logout: "Log out",
    loading: "Loading...",
  },
  ar: {
    pos: "نقاط البيع",
    products: "المنتجات",
    tables: "الطاولات",
    invoices: "الفواتير",
    reports: "التقارير",
    customers: "العملاء",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    loading: "تحميل...",
  },
};

function DashboardContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const { language } = useSharedState();

    const t = translations[language];
    const appName = "Cashier Pro";

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
        } else {
            router.push("/");
        }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        try {
        await signOut(auth);
        router.push("/");
        } catch (error) {
        console.error("Error signing out: ", error);
        }
    };

    const navLinks = [
        { href: "/dashboard/pos", icon: ShoppingCart, label: t.pos },
        { href: "/dashboard/products", icon: Package, label: t.products },
        { href: "/dashboard/tables", icon: Utensils, label: t.tables },
        { href: "/dashboard/invoices", icon: Receipt, label: t.invoices },
        { href: "/dashboard/reports", icon: LineChart, label: t.reports },
        { href: "/dashboard/customers", icon: Users, label: t.customers },
        { href: "/dashboard/settings", icon: Settings, label: t.settings },
    ];

    const NavLink = ({ href, icon: Icon, label }: {href: string, icon: React.ElementType, label: string}) => (
        <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
            pathname === href
            ? "bg-muted text-primary"
            : "text-muted-foreground"
        }`}
        >
        <Icon className="h-4 w-4" />
        {label}
        </Link>
    );

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]" dir="ltr">
        <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/dashboard/pos" className="flex items-center gap-2 font-semibold">
                <Store className="h-6 w-6" />
                <span className="">{appName}</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} />
                ))}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                    <CircleUser className="h-5 w-5" />
                    <span className="flex-1 truncate font-medium">{user?.displayName || t.loading}</span>
                </div>
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t.logout}</span>
                </Button>
            </div>
            </div>
        </div>
        <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
                <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                    <Link
                    href="/dashboard/pos"
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                    >
                    <Store className="h-6 w-6" />
                    <span className="">{appName}</span>
                    </Link>
                    {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                        pathname === link.href
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground"
                        }`}
                    >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                    </Link>
                    ))}
                </nav>
                <div className="mt-auto">
                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {t.logout}
                    </Button>
                </div>
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
                {/* The main header content is now part of the main layout sections to avoid redundancy */}
            </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              <Suspense fallback={null}>
                <NavigationEvents />
              </Suspense>
              {children}
            </main>
        </div>
        </div>
    );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
        <SharedStateProvider>
            <DashboardContent>{children}</DashboardContent>
        </SharedStateProvider>
    );
}
