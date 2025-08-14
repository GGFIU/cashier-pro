
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSharedState, type CartItem, type Customer } from "@/context/SharedStateContext";
import { CreditCard, DollarSign, Eye, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

const translations = {
    en: {
        invoices: "Invoice History",
        invoicesDesc: "A list of all past transactions.",
        invoiceId: "Invoice ID",
        date: "Date",
        customer: "Customer",
        items: "Items",
        total: "Total Amount",
        paymentMethod: "Payment Method",
        noInvoices: "No invoices have been created yet.",
        cash: "Cash",
        card: "Card",
        actions: "Actions",
        viewInvoice: "View Invoice",
        searchPlaceholder: "Search by invoice ID...",
        noCustomer: "N/A",
    },
    ar: {
        invoices: "سجل الفواتير",
        invoicesDesc: "قائمة بجميع المعاملات السابقة.",
        invoiceId: "رقم الفاتورة",
        date: "التاريخ",
        customer: "العميل",
        items: "الأصناف",
        total: "المبلغ الإجمالي",
        paymentMethod: "طريقة الدفع",
        noInvoices: "لم يتم إنشاء أي فواتير حتى الآن.",
        cash: "نقدي",
        card: "بطاقة",
        actions: "إجراءات",
        viewInvoice: "عرض الفاتورة",
        searchPlaceholder: "ابحث برقم الفاتورة...",
        noCustomer: "لا يوجد",
    }
};

export interface Invoice {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card';
  customerId?: number | null;
  customerName?: string;
}


export default function InvoicesPage() {
    const { language, invoices, formatCurrency } = useSharedState();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const t = translations[language];

    const PaymentMethodIcon = ({ method }: { method: 'cash' | 'card' }) => {
        const Icon = method === 'cash' ? DollarSign : CreditCard;
        const text = method === 'cash' ? t.cash : t.card;
        return (
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{text}</span>
            </div>
        );
    };
    
    const filteredInvoices = invoices.filter(invoice => 
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center">
                <div>
                    <h1 className="text-lg font-semibold md:text-2xl">{t.invoices}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t.invoicesDesc}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>{t.invoices}</CardTitle>
                            <CardDescription>{t.invoicesDesc}</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-auto">
                           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input
                               type="search"
                               placeholder={t.searchPlaceholder}
                               className="w-full rounded-lg bg-background pl-8 sm:w-[250px]"
                               value={searchTerm}
                               onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t.invoiceId}</TableHead>
                                <TableHead>{t.date}</TableHead>
                                <TableHead>{t.customer}</TableHead>
                                <TableHead className="text-center">{t.items}</TableHead>
                                <TableHead>{t.paymentMethod}</TableHead>
                                <TableHead className="text-right">{t.total}</TableHead>
                                <TableHead className="text-center">{t.actions}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        {t.noInvoices}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">#{invoice.id.substring(0, 6)}</TableCell>
                                        <TableCell>{new Date(invoice.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</TableCell>
                                        <TableCell>{invoice.customerName || t.noCustomer}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">{invoice.items.reduce((sum, item) => sum + item.cartQuantity, 0)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <PaymentMethodIcon method={invoice.paymentMethod} />
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/receipt/${invoice.id}`)}>
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">{t.viewInvoice}</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
