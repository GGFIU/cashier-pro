
"use client";

import { useState, useRef, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, MinusCircle, XCircle, ShoppingCart, Search, Utensils, Package, CreditCard, DollarSign, Printer, UserPlus, Tag } from "lucide-react";
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import type { Invoice } from '../invoices/page';
import { Badge } from '@/components/ui/badge';
import type { Product } from '../products/page';
import { useSharedState, type CartItem, type Table, type Customer } from '@/context/SharedStateContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const translations = {
  ar: {
    cartTitle: "سلة المشتريات",
    emptyCart: "السلة فارغة",
    emptyCartDesc: "أضف منتجات لبدء الطلب",
    subtotal: "المجموع الفرعي",
    tax: "الضريبة",
    total: "الإجمالي",
    cancel: "إلغاء",
    pay: "دفع",
    searchPlaceholder: "ابحث عن منتجات...",
    allCategory: "الكل",
    outOfStock: "نفذ المخزون",
    quantity: "الكمية",
    activeTable: "الطاولة النشطة",
    noActiveTable: "لم يتم تحديد طاولة",
    selectTable: "اختر طاولة أولاً",
    manageTables: "إدارة الطاولات",
    tableOrders: "طلبات الطاولات",
    takeawayOrders: "طلبات سفري",
    takeaway: "سفري",
    noOrderSelected: "لم يتم تحديد طلب",
    selectOrderPrompt: "اختر طاولة أو ابدأ طلب سفري",
    paymentMethod: "اختر طريقة الدفع",
    paymentMethodDesc: "حدد كيف ترغب في إتمام عملية الدفع.",
    payByCard: "دفع بالبطاقة",
    payByCash: "دفع نقدي",
    available: "متاحة",
    occupied: "مشغولة",
    active: "نشطة",
    transactionComplete: "اكتملت المعاملة",
    transactionCompleteDesc: "تمت معالجة الدفعة بنجاح.",
    printPDF: "طباعة PDF",
    newOrder: "طلب جديد",
    invoiceId: "رقم الفاتورة",
    date: "التاريخ",
    item: "الصنف",
    price: "السعر",
    qty: "الكمية",
    lineTotal: "المجموع",
    discount: "خصم",
    applyDiscount: "تطبيق الخصم",
    discountAmount: "مبلغ الخصم",
    discountPercentage: "نسبة الخصم",
    apply: "تطبيق",
    customer: "العميل",
    selectCustomer: "اختيار عميل",
    noCustomer: "بدون عميل",
    addNewCustomer: "إضافة عميل جديد",
  },
  en: {
    cartTitle: "Shopping Cart",
    emptyCart: "Cart is empty",
    emptyCartDesc: "Add products to start an order",
    subtotal: "Subtotal",
    tax: "Tax",
    total: "Total",
    cancel: "Cancel",
    pay: "Pay",
    searchPlaceholder: "Search for products...",
    allCategory: "All",
    outOfStock: "Out of Stock",
    quantity: "Quantity",
    activeTable: "Active Table",
    noActiveTable: "No table selected",
    selectTable: "Select a table first",
    manageTables: "Manage Tables",
    tableOrders: "Table Orders",
    takeawayOrders: "Takeaway Orders",
    takeaway: "Takeaway",
    noOrderSelected: "No order selected",
    selectOrderPrompt: "Select a table or start a takeaway order",
    paymentMethod: "Choose Payment Method",
    paymentMethodDesc: "Select how you'd like to complete the payment.",
    payByCard: "Pay by Card",
    payByCash: "Pay by Cash",
    available: "Available",
    occupied: "Occupied",
    active: "Active",
    transactionComplete: "Transaction Complete",
    transactionCompleteDesc: "The payment has been processed successfully.",
    printPDF: "Print PDF",
    newOrder: "New Order",
    invoiceId: "Invoice ID",
    date: "Date",
    item: "Item",
    price: "Price",
    qty: "Qty",
    lineTotal: "Total",
    discount: "Discount",
    applyDiscount: "Apply Discount",
    discountAmount: "Discount Amount",
    discountPercentage: "Discount Percentage",
    apply: "Apply",
    customer: "Customer",
    selectCustomer: "Select Customer",
    noCustomer: "No Customer",
    addNewCustomer: "Add New Customer",
  }
};

const PostPaymentDialog = ({ invoice, isOpen, onClose }: { invoice: Invoice | null, isOpen: boolean, onClose: () => void }) => {
    const receiptRef = useRef<HTMLDivElement>(null);
    const { 
        storeName, storeLogo, storeAddress, storePhone, storeEmail, 
        invoiceFooterText, language, taxRate, formatCurrency, getCurrencySymbol 
    } = useSharedState();

    const t = translations[language];

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

    if (!invoice) return null;

    const taxText = `${t.tax} (${taxRate}%)`;
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t.transactionComplete}</DialogTitle>
                    <DialogDescription>{t.transactionCompleteDesc}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="absolute -left-[9999px] -top-[9999px] w-[80mm] bg-white text-black p-2 font-mono" ref={receiptRef}>
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
                             {invoice.customerName && <p className="flex justify-between"><span>{t.customer}:</span><span>{invoice.customerName}</span></p>}
                         </div>
                        <Separator className="my-2 border-dashed border-black" />
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-dashed border-black">
                                    <th className="text-right pb-1">{t.item}</th>
                                    <th className="text-center pb-1">{t.qty}</th>
                                    <th className="text-center pb-1">{t.price}</th>
                                    <th className="text-left pb-1">{t.lineTotal}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map(item => (
                                    <tr key={item.id}>
                                        <td className="text-right py-1 w-1/2 break-words">{item.name}</td>
                                        <td className="text-center py-1">{item.cartQuantity}</td>
                                        <td className="text-center py-1">{(item.price).toFixed(2)}</td>
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
                            <p className="flex justify-between font-bold text-sm"><span>{t.total}</span><span>{invoice.total.toFixed(2)} {getCurrencySymbol()}</span></p>
                        </div>
                        <Separator className="my-2 border-dashed border-black" />
                         <div className="text-center text-xs mt-2">
                            <p>{invoiceFooterText}</p>
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                         {invoice.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">x{item.cartQuantity}</p>
                                </div>
                                <p>{formatCurrency(item.price * item.cartQuantity)}</p>
                            </div>
                        ))}
                    </div>
                     <Separator className="my-4"/>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">{t.subtotal}</span><span>{formatCurrency(invoice.subtotal)}</span></div>
                        {invoice.discount > 0 && <div className="flex justify-between text-destructive"><span >{t.discount}</span><span>-{formatCurrency(invoice.discount)}</span></div>}
                        <div className="flex justify-between"><span className="text-muted-foreground">{taxText}</span><span>{formatCurrency(invoice.tax)}</span></div>
                        <div className="flex justify-between font-bold text-lg"><span>{t.total}</span><span>{formatCurrency(invoice.total)}</span></div>
                    </div>
                </div>
                <DialogFooter className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleDownloadPdf}>
                        <Printer className="mx-2 h-4 w-4" />
                        {t.printPDF}
                    </Button>
                     <Button onClick={onClose}>
                        {t.newOrder}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const TableGrid = () => {
    const { language, tables, activeOrder, setActiveOrder } = useSharedState();
    const t = translations[language as keyof typeof translations];
    
    const handleTableClick = (table: Table) => {
        setActiveOrder({ type: 'table', id: table.id });
    };
    
    const getStatusClasses = (status: 'متاحة' | 'مشغولة') => {
      return status === 'متاحة' ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600";
    };
    const getStatusText = (status: 'متاحة' | 'مشغولة') => status === 'متاحة' ? t.available : t.occupied;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-1">
            {tables.map((table) => (
                <Card
                    key={table.id}
                    className={`cursor-pointer hover:shadow-lg transition-shadow relative group ${activeOrder?.type === 'table' && activeOrder.id === table.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleTableClick(table)}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                        <CardTitle className="text-sm font-medium">{table.name}</CardTitle>
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-2 p-4 pt-0">
                        <Badge className={`${getStatusClasses(table.status)} text-white`}>
                             {activeOrder?.type === 'table' && activeOrder.id === table.id ? t.active : getStatusText(table.status)}
                        </Badge>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};


export default function PosPage() {
  const { 
      language, products, setProducts, setInvoices, tables, setTables, 
      activeOrder, setActiveOrder, takeawayCart, setTakeawayCart,
      taxRate, formatCurrency, customers, setCustomers
  } = useSharedState();

  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  
  // Customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  // Discount state
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('amount');
  const [discountValue, setDiscountValue] = useState('');


  const t = translations[language];
  const categories = [t.allCategory, ...new Set(products.map(p => p.category))];

  const activeTable = activeOrder?.type === 'table' ? tables.find(t => t.id === activeOrder.id) : null;
  const cart = activeOrder?.type === 'table' && activeTable ? activeTable.cart : (activeOrder?.type === 'takeaway' ? takeawayCart : []);
  
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.cartQuantity, 0), [cart]);
  const discountAmount = useMemo(() => {
    if (!isDiscountDialogOpen) {
        const value = parseFloat(discountValue) || 0;
        if (discountType === 'amount') {
            return Math.min(value, subtotal);
        }
        if (discountType === 'percentage') {
            return Math.min((subtotal * value) / 100, subtotal);
        }
    }
    return 0;
  }, [discountType, discountValue, subtotal, isDiscountDialogOpen]);

  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = subtotalAfterDiscount * (taxRate / 100);
  const total = subtotalAfterDiscount + tax;

  useEffect(() => {
    if (!activeOrder) {
        setSelectedCustomerId(null);
        setDiscountValue('');
    }
  }, [activeOrder]);

  const updateProductStock = (productId: number, change: number) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, quantity: p.quantity + change } : p
      )
    );
  };

  const updateCart = (newCart: CartItem[]) => {
      if(activeOrder?.type === 'table' && activeTable) {
        setTables(prevTables =>
            prevTables.map(table => {
                if (table.id === activeTable.id) {
                    const newSubtotal = newCart.reduce((acc, item) => acc + item.price * item.cartQuantity, 0);
                    const newTotal = newSubtotal * (1 + taxRate/100);
                    return { ...table, cart: newCart, status: newCart.length > 0 ? 'مشغولة' : 'متاحة', total: newTotal };
                }
                return table;
            })
        );
      } else if (activeOrder?.type === 'takeaway') {
          setTakeawayCart(newCart);
      }
  };

  const addToCart = (product: Product) => {
    if (!activeOrder) {
        alert(t.selectOrderPrompt);
        return;
    }
    if (product.quantity <= 0) return;

    const newCart = [...cart];
    const existingItemIndex = newCart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
      newCart[existingItemIndex].cartQuantity += 1;
    } else {
      newCart.push({ ...product, cartQuantity: 1 });
    }

    updateCart(newCart);
    updateProductStock(product.id, -1);
  };

  const updateQuantity = (productId: number, amount: number) => {
    if (!activeOrder) return;
    
    const productInStock = products.find(p => p.id === productId);
    if (amount > 0 && productInStock && productInStock.quantity < 1) {
        return;
    }
    
    let newCart = [...cart];
    const itemIndex = newCart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
      const currentCartQuantity = newCart[itemIndex].cartQuantity;
      newCart[itemIndex].cartQuantity += amount;
      
      if (newCart[itemIndex].cartQuantity <= 0) {
        newCart.splice(itemIndex, 1);
        updateProductStock(productId, currentCartQuantity);
      } else {
         updateProductStock(productId, -amount);
      }
    }
    
    updateCart(newCart);
  };

  const removeFromCart = (productId: number) => {
    if (!activeOrder) return;
    const itemInCart = cart.find(item => item.id === productId);
    if (itemInCart) {
      updateProductStock(productId, itemInCart.cartQuantity);
    }
    const newCart = cart.filter(item => item.id !== productId);
    updateCart(newCart);
  };

  const clearCart = () => {
    if (!activeOrder) return;
    cart.forEach(item => {
      updateProductStock(item.id, item.cartQuantity);
    });
    updateCart([]);
    setDiscountValue('');
  };

  const handlePayment = (paymentMethod: 'cash' | 'card') => {
    if (!activeOrder || cart.length === 0) return;
    
    const customer = customers.find(c => c.id === Number(selectedCustomerId));

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: [...cart],
      subtotal: subtotal,
      discount: discountAmount,
      tax: tax,
      total: total,
      paymentMethod,
      customerId: customer?.id,
      customerName: customer?.name,
    };
    
    setInvoices(prev => [newInvoice, ...prev]);
    setCompletedInvoice(newInvoice);
    updateCart([]); 
    setActiveOrder(null); 
    setIsPaymentDialogOpen(false);
    setDiscountValue('');
  };
  
  const handleAddNewCustomer = () => {
    if(!newCustomerName || !newCustomerPhone) return;
    const newCustomer: Customer = {
        id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
        name: newCustomerName,
        phone: newCustomerPhone,
        email: ''
    };
    setCustomers(prev => [...prev, newCustomer]);
    setSelectedCustomerId(newCustomer.id.toString());
    setIsCustomerDialogOpen(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
  }

  const filteredProducts = products
    .filter(p => activeCategory === t.allCategory || p.category === activeCategory)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const getOrderTitle = () => {
        if (!activeOrder) return t.noOrderSelected;
        if (activeOrder.type === 'table' && activeTable) return `${t.activeTable}: ${activeTable.name}`;
        if (activeOrder.type === 'takeaway') return t.takeawayOrders;
        return t.noOrderSelected;
    };
    const taxText = `${t.tax} (${taxRate}%)`;
    const selectedCustomerName = customers.find(c => c.id === Number(selectedCustomerId))?.name;

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-2 flex flex-col">
          <Tabs defaultValue="tables" 
              onValueChange={(value) => {
                  if (value === 'takeaway') {
                      setActiveOrder({ type: 'takeaway' });
                  } else {
                      setActiveOrder(null);
                  }
              }}
              className="flex flex-col flex-grow"
            >
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                      <TabsTrigger value="tables">{t.tableOrders}</TabsTrigger>
                      <TabsTrigger value="takeaway">{t.takeawayOrders}</TabsTrigger>
                  </TabsList>
                  <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                          type="search"
                          placeholder={t.searchPlaceholder}
                          className="w-full rounded-lg bg-background pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
              </div>
              
              <TabsContent value="tables" className="flex-1 overflow-y-auto">
                 <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
                        {categories.map(category => (
                            <Button key={category} variant={activeCategory === category ? 'default' : 'outline'} onClick={() => setActiveCategory(category)} className="shrink-0">
                                {category}
                            </Button>
                        ))}
                    </div>
                    {activeOrder?.type === 'table' ? (
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 flex-1 overflow-y-auto pr-2 -mr-2">
                             {filteredProducts.map(product => (
                                 <Card key={product.id} className={`cursor-pointer hover:shadow-lg transition-shadow ${product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => addToCart(product)}>
                                     <CardHeader className="p-0 relative">
                                         <Image src={product.image} alt={product.name} width={200} height={200} className="rounded-t-lg w-full object-cover aspect-square" data-ai-hint={product.dataAiHint} />
                                         {product.quantity === 0 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg"><Badge variant="destructive">{t.outOfStock}</Badge></div>}
                                     </CardHeader>
                                     <CardContent className="p-4">
                                         <p className="font-semibold truncate">{product.name}</p>
                                         <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                                         <p className="text-xs text-muted-foreground/80">{t.quantity}: {product.quantity}</p>
                                     </CardContent>
                                 </Card>
                             ))}
                         </div>
                    ) : (
                        <TableGrid />
                    )}
                 </div>
              </TabsContent>

              <TabsContent value="takeaway" className="flex-1 overflow-y-auto pr-2 -mr-2">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
                        {categories.map(category => (
                            <Button key={category} variant={activeCategory === category ? 'default' : 'outline'} onClick={() => setActiveCategory(category)} className="shrink-0">
                                {category}
                            </Button>
                        ))}
                    </div>
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProducts.map(product => (
                            <Card key={product.id} className={`cursor-pointer hover:shadow-lg transition-shadow ${product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => addToCart(product)}>
                                <CardHeader className="p-0 relative">
                                    <Image src={product.image} alt={product.name} width={200} height={200} className="rounded-t-lg w-full object-cover aspect-square" data-ai-hint={product.dataAiHint} />
                                    {product.quantity === 0 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg"><Badge variant="destructive">{t.outOfStock}</Badge></div>}
                                </CardHeader>
                                <CardContent className="p-4">
                                    <p className="font-semibold truncate">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                                    <p className="text-xs text-muted-foreground/80">{t.quantity}: {product.quantity}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
              </TabsContent>
          </Tabs>
      </div>
      
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
                <span className="text-primary">{getOrderTitle()}</span>
                <p className="text-sm font-normal text-muted-foreground">{t.cartTitle}</p>
            </div>
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {!activeOrder ? (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                <Package className="h-16 w-16 mb-4" />
                <p className="font-semibold">{t.selectOrderPrompt}</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShoppingCart className="h-16 w-16 mb-4" />
                <p>{t.emptyCart}</p>
                <p className="text-sm">{t.emptyCartDesc}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md" data-ai-hint={item.dataAiHint} />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, 1)}>
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                    <span>{item.cartQuantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, -1)}>
                      <MinusCircle className="h-5 w-5" />
                    </Button>
                     <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {activeOrder && cart.length > 0 && (
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                 <CardFooter className="flex flex-col gap-4 !p-4 border-t">
                    <div className='w-full flex items-center gap-2'>
                        <Select value={selectedCustomerId || "none"} onValueChange={(value) => setSelectedCustomerId(value === "none" ? null : value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t.selectCustomer} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">{t.noCustomer}</SelectItem>
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <UserPlus className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t.addNewCustomer}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className='space-y-1'><Label>{t.customerName}</Label><Input value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} /></div>
                                    <div className='space-y-1'><Label>{t.customerPhone}</Label><Input value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} /></div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>{t.cancel}</Button>
                                    <Button onClick={handleAddNewCustomer}>{t.save}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                     <div className="w-full space-y-2 text-sm">
                         <div className="flex justify-between">
                             <span className="text-muted-foreground">{t.subtotal}</span>
                             <span>{formatCurrency(subtotal)}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t.discount}</span>
                            <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="link" size="sm" className="p-0 h-auto">
                                        -{formatCurrency(discountAmount)}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>{t.applyDiscount}</DialogTitle></DialogHeader>
                                    <Tabs value={discountType} onValueChange={(v) => setDiscountType(v as any)}>
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="amount">{t.discountAmount}</TabsTrigger>
                                            <TabsTrigger value="percentage">{t.discountPercentage}</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="amount">
                                            <Label>{t.discountAmount}</Label>
                                            <Input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} />
                                        </TabsContent>
                                        <TabsContent value="percentage">
                                             <Label>{t.discountPercentage}</Label>
                                            <Input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} />
                                        </TabsContent>
                                    </Tabs>
                                    <DialogFooter>
                                        <Button onClick={() => setIsDiscountDialogOpen(false)}>{t.apply}</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                         <div className="flex justify-between">
                             <span className="text-muted-foreground">{taxText}</span>
                             <span>{formatCurrency(tax)}</span>
                         </div>
                         <Separator />
                         <div className="flex justify-between font-bold text-lg">
                             <span>{t.total}</span>
                             <span>{formatCurrency(total)}</span>
                         </div>
                     </div>
                     <div className="grid grid-cols-2 gap-2 w-full">
                        <Button size="lg" variant="outline" onClick={clearCart}>{t.cancel}</Button>
                        <DialogTrigger asChild>
                            <Button size="lg">{t.pay}</Button>
                        </DialogTrigger>
                     </div>
                 </CardFooter>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.paymentMethod}</DialogTitle>
                        <DialogDescription>{t.paymentMethodDesc}</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button variant="outline" size="lg" className="h-24 flex-col gap-2" onClick={() => handlePayment('card')}>
                            <CreditCard className="h-8 w-8"/>
                            {t.payByCard}
                        </Button>
                        <Button variant="outline" size="lg" className="h-24 flex-col gap-2" onClick={() => handlePayment('cash')}>
                             <DollarSign className="h-8 w-8"/>
                             {t.payByCash}
                        </Button>
                    </div>
                 </DialogContent>
            </Dialog>
        )}
      </Card>
    </div>
    <PostPaymentDialog 
        invoice={completedInvoice}
        isOpen={!!completedInvoice}
        onClose={() => setCompletedInvoice(null)}
    />
    </>
  );
}
