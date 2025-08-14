
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSharedState, type Customer } from '@/context/SharedStateContext';

const translations = {
    en: {
        manageCustomers: "Customer Management",
        manageCustomersDesc: "View and manage your customer list.",
        addCustomer: "Add Customer",
        editCustomer: "Edit Customer",
        customerList: "Customer List",
        name: "Name",
        phone: "Phone",
        email: "Email",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        addNewCustomer: "Add New Customer",
        addNewCustomerDesc: "Fill in the details to add a new customer.",
        customerName: "Customer Name",
        customerPhone: "Phone Number",
        customerEmail: "Email Address",
        cancel: "Cancel",
        save: "Save",
        saveChanges: "Save Changes",
        fillAllFields: "Please fill in name and phone.",
        deleteConfirmTitle: "Are you sure?",
        deleteConfirmDesc: "This action cannot be undone. This will permanently delete the customer.",
    },
    ar: {
        manageCustomers: "إدارة العملاء",
        manageCustomersDesc: "عرض وإدارة قائمة العملاء الخاصة بك.",
        addCustomer: "إضافة عميل",
        editCustomer: "تعديل العميل",
        customerList: "قائمة العملاء",
        name: "الاسم",
        phone: "رقم الهاتف",
        email: "البريد الإلكتروني",
        actions: "إجراءات",
        edit: "تعديل",
        delete: "حذف",
        addNewCustomer: "إضافة عميل جديد",
        addNewCustomerDesc: "املأ التفاصيل لإضافة عميل جديد.",
        customerName: "اسم العميل",
        customerPhone: "رقم الهاتف",
        customerEmail: "البريد الإلكتروني",
        cancel: "إلغاء",
        save: "حفظ",
        saveChanges: "حفظ التغييرات",
        fillAllFields: "الرجاء إدخال الاسم ورقم الهاتف.",
        deleteConfirmTitle: "هل أنت متأكد؟",
        deleteConfirmDesc: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف العميل نهائيًا.",
    }
};

export default function CustomersPage() {
    const { language, customers, setCustomers } = useSharedState();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

    const t = translations[language];
    const isEditMode = editingCustomer !== null;

    const resetForm = () => {
        setEditingCustomer(null);
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
    };

    const openDialog = (customer: Customer | null) => {
        if (customer) {
            setEditingCustomer(customer);
            setCustomerName(customer.name);
            setCustomerPhone(customer.phone);
            setCustomerEmail(customer.email || "");
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        resetForm();
        setIsDialogOpen(false);
    };

    const handleSaveCustomer = () => {
        if (!customerName || !customerPhone) {
            alert(t.fillAllFields);
            return;
        }

        const customerData = {
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
        };

        if (isEditMode && editingCustomer) {
            setCustomers(prev => prev.map(c =>
                c.id === editingCustomer.id ? { ...c, ...customerData } : c
            ));
        } else {
            const newCustomer: Customer = {
                id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
                ...customerData,
            };
            setCustomers(prev => [...prev, newCustomer]);
        }
        closeDialog();
    };
    
    const handleDeleteCustomer = () => {
        if (!customerToDelete) return;
        setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
        setCustomerToDelete(null);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold md:text-2xl">{t.manageCustomers}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t.manageCustomersDesc}
                    </p>
                </div>
                <Button onClick={() => openDialog(null)}>
                    <PlusCircle className="h-4 w-4 mx-2" />
                    {t.addCustomer}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t.customerList}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t.name}</TableHead>
                                <TableHead>{t.phone}</TableHead>
                                <TableHead className="hidden md:table-cell">{t.email}</TableHead>
                                <TableHead>
                                    <span className="sr-only">{t.actions}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell className="hidden md:table-cell">{customer.email}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>{t.actions}</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openDialog(customer)}>{t.edit}</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setCustomerToDelete(customer)} className="text-destructive">{t.delete}</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? t.editCustomer : t.addNewCustomer}</DialogTitle>
                        <DialogDescription>{isEditMode ? "Update the customer's details." : t.addNewCustomerDesc}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t.customerName}</Label>
                            <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">{t.customerPhone}</Label>
                            <Input id="phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t.customerEmail}</Label>
                            <Input id="email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialog}>{t.cancel}</Button>
                        <Button onClick={handleSaveCustomer}>{isEditMode ? t.saveChanges : t.save}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Delete Confirmation */}
            <AlertDialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t.deleteConfirmTitle}</AlertDialogTitle>
                        <AlertDialogDescription>{t.deleteConfirmDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCustomerToDelete(null)}>{t.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCustomer}>{t.delete}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
