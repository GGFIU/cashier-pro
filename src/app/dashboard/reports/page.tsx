
"use client";

import { useState, useMemo } from "react";
import { useSharedState } from "@/context/SharedStateContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Utensils, TrendingUp, Users, CreditCard, DollarSign } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const translations = {
    en: {
        reports: "Reports Dashboard",
        overview: "Here's an overview of your sales performance.",
        totalRevenue: "Total Revenue",
        totalSales: "Total Sales (Invoices)",
        avgSaleValue: "Average Sale Value",
        topSellingProducts: "Top Selling Products",
        salesByPaymentMethod: "Sales by Payment Method",
        product: "Product",
        quantitySold: "Quantity Sold",
        noSalesYet: "No sales yet to generate reports.",
        cash: "Cash",
        card: "Card",
        dateRange: "Date Range",
        today: "Today",
        last7Days: "Last 7 Days",
        last30Days: "Last 30 Days",
        allTime: "All Time",
    },
    ar: {
        reports: "لوحة التقارير",
        overview: "نظرة عامة على أداء مبيعاتك.",
        totalRevenue: "إجمالي الإيرادات",
        totalSales: "إجمالي المبيعات (الفواتير)",
        avgSaleValue: "متوسط قيمة البيع",
        topSellingProducts: "المنتجات الأكثر مبيعاً",
        salesByPaymentMethod: "المبيعات حسب طريقة الدفع",
        product: "المنتج",
        quantitySold: "الكمية المباعة",
        noSalesYet: "لا توجد مبيعات بعد لإنشاء تقارير.",
        cash: "نقدي",
        card: "بطاقة",
        dateRange: "النطاق الزمني",
        today: "اليوم",
        last7Days: "آخر 7 أيام",
        last30Days: "آخر 30 يومًا",
        allTime: "كل الأوقات",
    }
};

type DateRange = 'today' | '7days' | '30days' | 'all';

const StatCard = ({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

export default function ReportsPage() {
    const { language, invoices, products, formatCurrency } = useSharedState();
    const [dateRange, setDateRange] = useState<DateRange>('all');
    const t = translations[language];

    const filteredInvoices = useMemo(() => {
        if (dateRange === 'all') return invoices;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            if (dateRange === 'today') {
                return invoiceDate >= today;
            }
            if (dateRange === '7days') {
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                return invoiceDate >= sevenDaysAgo;
            }
            if (dateRange === '30days') {
                 const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                return invoiceDate >= thirtyDaysAgo;
            }
            return true;
        });
    }, [invoices, dateRange]);


    const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalSales = filteredInvoices.length;
    const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    const cashSales = filteredInvoices.filter(inv => inv.paymentMethod === 'cash').reduce((sum, inv) => sum + inv.total, 0);
    const cardSales = filteredInvoices.filter(inv => inv.paymentMethod === 'card').reduce((sum, inv) => sum + inv.total, 0);

    const paymentMethodData = [
        { name: t.cash, total: cashSales, fill: "var(--color-cash)" },
        { name: t.card, total: cardSales, fill: "var(--color-card)" },
    ];
    
    const topSellingProducts = useMemo(() => {
        const productSales: { [key: string]: { name: string; sold: number } } = {};
        
        filteredInvoices.forEach(invoice => {
            invoice.items.forEach(item => {
                if (productSales[item.id]) {
                    productSales[item.id].sold += item.cartQuantity;
                } else {
                    productSales[item.id] = {
                        name: item.name,
                        sold: item.cartQuantity,
                    };
                }
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);
    }, [filteredInvoices]);


    if (invoices.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">{t.noSalesYet}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t.overview}
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-semibold md:text-2xl">{t.reports}</h1>
                    <p className="text-sm text-muted-foreground">{t.overview}</p>
                </div>
                <div className="w-full sm:w-auto">
                     <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder={t.dateRange} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t.allTime}</SelectItem>
                            <SelectItem value="today">{t.today}</SelectItem>
                            <SelectItem value="7days">{t.last7Days}</SelectItem>
                            <SelectItem value="30days">{t.last30Days}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title={t.totalRevenue} value={formatCurrency(totalRevenue)} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title={t.totalSales} value={`${totalSales}`} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title={t.avgSaleValue} value={formatCurrency(avgSaleValue)} icon={<CreditCard className="h-4 w-4 text-muted-foreground" />} />
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>{t.salesByPaymentMethod}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ChartContainer 
                            config={{
                                cash: { label: t.cash, color: "hsl(var(--chart-1))" },
                                card: { label: t.card, color: "hsl(var(--chart-2))" },
                            }} 
                            className="h-[300px] w-full"
                            style={{
                                '--color-cash': 'hsl(142.1 76.2% 36.3%)',
                                '--color-card': 'hsl(215.4 78.7% 46.9%)',
                            } as React.CSSProperties}
                        >
                            <BarChart data={paymentMethodData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <CartesianGrid horizontal={false} />
                                <XAxis type="number" dataKey="total" hide/>
                                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={60} />
                                <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />} />
                                <Bar dataKey="total" radius={5} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>{t.topSellingProducts}</CardTitle>
                        <CardDescription>{t.overview}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topSellingProducts.length > 0 ? topSellingProducts.map((product) => (
                                <div key={product.name} className="flex items-center">
                                    <Package className="h-5 w-5 mr-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium leading-none">{product.name}</p>
                                    </div>
                                    <div className="ml-auto font-medium">{product.sold}</div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-4">{t.noSalesYet}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
