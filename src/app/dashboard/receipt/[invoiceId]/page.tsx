
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSharedState } from '@/context/SharedStateContext';
import type { Invoice } from '../../invoices/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const translations = {
    en: {
        receipt: "Receipt",
        invoiceId: "Invoice ID",
        date: "Date",
        customer: "Customer",
        paymentMethod: "Payment Method",
        cash: "Cash",
        card: "Card",
        item: "Item",
        quantity: "Qty",
        price: "Price",
        total: "Total",
        subtotal: "Subtotal",
        tax: "Tax",
        discount: "Discount",
        grandTotal: "Grand Total",
        print: "Print",
        downloadPdf: "Download PDF",
        backToInvoices: "Back to Invoices",
        invoiceNotFound: "Invoice Not Found",
    },
    ar: {
        receipt: "إيصال",
        invoiceId: "رقم الفاتورة",
        date: "التاريخ",
        customer: "العميل",
        paymentMethod: "طريقة الدفع",
        cash: "نقدي",
        card: "بطاقة",
        item: "الصنف",
        quantity: "الكمية",
        price: "السعر",
        total: "المجموع",
        subtotal: "المجموع الفرعي",
        tax: "الضريبة",
        discount: "الخصم",
        grandTotal: "الإجمالي النهائي",
        print: "طباعة",
        downloadPdf: "تحميل PDF",
        backToInvoices: "العودة للفواتير",
        invoiceNotFound: "الفاتورة غير موجودة",
    }
};

export default function ReceiptPage() {
    const router = useRouter();
    const params = useParams();
    const { invoiceId } = params;
    
    const { 
        language, invoices, storeName, storeLogo, storeAddress, 
        storePhone, storeEmail, invoiceFooterText, taxRate, getCurrencySymbol
    } = useSharedState();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    
    const receiptRef = useRef<HTMLDivElement>(null);
    const t = translations[language];

    useEffect(() => {
        if (invoiceId) {
            const foundInvoice = invoices.find(inv => inv.id === invoiceId);
            setInvoice(foundInvoice || null);
        }
        setLoading(false);
    }, [invoiceId, invoices]);
    
    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        const receiptElement = receiptRef.current;
        if (!receiptElement || !invoice) return;

        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');

        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(receiptElement, {
            scale: 2, 
            backgroundColor: '#ffffff',
            useCORS: true,
        });
        
        document.documentElement.classList.remove('light');
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
           document.documentElement.classList.add('dark');
        }
       
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 297]
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`receipt-${invoice.id.substring(0, 6)}.pdf`);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><p>Loading...</p></div>;
    }

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p>{t.invoiceNotFound}</p>
                <Button onClick={() => router.push('/dashboard/invoices')}>{t.backToInvoices}</Button>
            </div>
        );
    }

    const taxText = `${t.tax} (${taxRate}%)`;

    const ReceiptContent = () => (
        <div ref={receiptRef} className="w-[80mm] bg-white text-black p-2 font-mono">
            <div className="text-center">
                {storeLogo && <Image src={storeLogo} alt="Store Logo" width={48} height={48} className="mx-auto" />}
                <h2 className="text-xl font-bold mt-2">{storeName}</h2>
                <p className="text-xs">{storeAddress}</p>
                <p className="text-xs">{storePhone}</p>
                <p className="text-xs">{storeEmail}</p>
            </div>
            <Separator className="my-2 border-dashed border-black" />
            <div className="text-xs my-2">
                <p className="flex justify-between"><span>{t.invoiceId}:</span><span>#{invoice.id.substring(0,7)}</span></p>
                <p className="flex justify-between"><span>{t.date}:</span><span>{new Date(invoice.date).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</span></p>
                <p className="flex justify-between"><span>{t.paymentMethod}:</span><span>{invoice.paymentMethod === 'cash' ? t.cash : t.card}</span></p>
                {invoice.customerName && <p className="flex justify-between"><span>{t.customer}:</span><span>{invoice.customerName}</span></p>}
            </div>
            <Separator className="my-2 border-dashed border-black" />
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b border-dashed border-black">
                        <th className="text-right pb-1">{t.item}</th>
                        <th className="text-center pb-1">{t.quantity}</th>
                        <th className="text-center pb-1">{t.price}</th>
                        <th className="text-left pb-1">{t.total}</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map(item => (
                        <tr key={item.id}>
                            <td className="text-right py-1 w-1/2 break-words">{item.name}</td>
                            <td className="text-center py-1">{item.cartQuantity}</td>
                            <td className="text-center py-1">{item.price.toFixed(2)}</td>
                            <td className="text-left py-1">{(item.price * item.cartQuantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Separator className="my-2 border-dashed border-black" />
            <div className="text-xs space-y-1">
                <p className="flex justify-between"><span>{t.subtotal}</span><span>{invoice.subtotal.toFixed(2)} {getCurrencySymbol()}</span></p>
                 {invoice.discount > 0 && <p className="flex justify-between"><span>{t.discount}</span><span>-{invoice.discount.toFixed(2)} {getCurrencySymbol()}</span></p>}
                <p className="flex justify-between"><span>{taxText}</span><span>{invoice.tax.toFixed(2)} {getCurrencySymbol()}</span></p>
                <p className="flex justify-between font-bold text-sm"><span>{t.grandTotal}</span><span>{invoice.total.toFixed(2)} {getCurrencySymbol()}</span></p>
            </div>
            <Separator className="my-2 border-dashed border-black" />
            <div className="text-center text-xs mt-2">
                <p>{invoiceFooterText}</p>
            </div>
        </div>
    );
    
    return (
        <>
            <div className="flex flex-col items-center gap-4 bg-muted p-4 sm:p-6 md:p-8 print:hidden">
                <div className="flex w-full max-w-md justify-between items-center">
                     <h1 className="text-2xl font-bold">{t.receipt}</h1>
                     <div className="flex gap-2">
                          <Button variant="outline" onClick={handleDownloadPdf}>
                             <Download className="mr-2 h-4 w-4" />
                             {t.downloadPdf}
                         </Button>
                         <Button onClick={handlePrint}>
                             <Printer className="mr-2 h-4 w-4" />
                             {t.print}
                         </Button>
                     </div>
                </div>
                <Card className="p-0 border-0 shadow-lg">
                    <ReceiptContent />
                </Card>
            </div>

            <div className="hidden print:block">
                <ReceiptContent />
            </div>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:block, .print\\:block * {
                        visibility: visible;
                    }
                    .print\\:block {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print\\:hidden {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
}
