
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, PlusCircle, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useSharedState, type Table } from '@/context/SharedStateContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const translations = {
    en: {
        manageTables: "Table Management",
        available: "Available",
        occupied: "Occupied",
        active: "Active",
        addTable: "Add Table",
        addNewTable: "Add New Table",
        editTable: "Edit Table",
        addNewTableDesc: "Enter the details for the new table.",
        editTableDesc: "Update the details for this table.",
        tableName: "Table Name",
        seatCount: "Number of Seats",
        cancel: "Cancel",
        save: "Save",
        saveChanges: "Save Changes",
        fillAllFields: "Please fill in all fields.",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        deleteConfirmTitle: "Are you sure?",
        deleteConfirmDesc: "This action cannot be undone. This will permanently delete the table.",
        deleteErrorTitle: "Cannot Delete Table",
        deleteErrorDesc: "This table is currently occupied. Please clear the order before deleting it.",

    },
    ar: {
        manageTables: "إدارة الطاولات",
        available: "متاحة",
        occupied: "مشغولة",
        active: "نشطة",
        addTable: "إضافة طاولة",
        addNewTable: "إضافة طاولة جديدة",
        editTable: "تعديل الطاولة",
        addNewTableDesc: "أدخل تفاصيل الطاولة الجديدة.",
        editTableDesc: "قم بتحديث تفاصيل هذه الطاولة.",
        tableName: "اسم الطاولة",
        seatCount: "عدد المقاعد",
        cancel: "إلغاء",
        save: "حفظ",
        saveChanges: "حفظ التغييرات",
        fillAllFields: "الرجاء ملء جميع الحقول.",
        actions: "إجراءات",
        edit: "تعديل",
        delete: "حذف",
        deleteConfirmTitle: "هل أنت متأكد؟",
        deleteConfirmDesc: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف الطاولة نهائيًا.",
        deleteErrorTitle: "لا يمكن حذف الطاولة",
        deleteErrorDesc: "هذه الطاولة مشغولة حاليًا. يرجى إنهاء الطلب قبل حذفها.",
    }
}

export default function TablesPage() {
  const { language, tables, setTables, setActiveOrder, activeOrder } = useSharedState();
  const router = useRouter();
  const t = translations[language];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableName, setTableName] = useState("");
  const [tableSeats, setTableSeats] = useState("4"); // Default seats to 4
  const [deleteError, setDeleteError] = useState(false);

  const isEditMode = editingTable !== null;

  const handleTableClick = (table: Table) => {
    setActiveOrder({ type: 'table', id: table.id });
    router.push('/dashboard/pos');
  };
  
  const resetForm = () => {
      setEditingTable(null);
      setTableName("");
      setTableSeats("4");
  }

  const handleOpenDialog = (table: Table | null) => {
      if(table) {
        setEditingTable(table);
        setTableName(table.name);
        setTableSeats(table.seats.toString());
      } else {
        resetForm();
      }
      setIsDialogOpen(true);
  }

  const handleCloseDialog = () => {
      resetForm();
      setIsDialogOpen(false);
  }

  const handleSaveTable = () => {
    if (!tableName) {
        alert(t.fillAllFields);
        return;
    }

    if (isEditMode && editingTable) {
        setTables(prev => prev.map(t => t.id === editingTable.id ? { ...t, name: tableName, seats: parseInt(tableSeats, 10) } : t));
    } else {
        const newTable = {
            id: tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1,
            name: tableName,
            seats: parseInt(tableSeats, 10),
            status: "متاحة" as "متاحة",
            cart: [],
            total: 0,
        };
        setTables(prev => [...prev, newTable]);
    }
    handleCloseDialog();
  };

  const handleDeleteTable = (tableId: number) => {
      const tableToDelete = tables.find(t => t.id === tableId);
      if(tableToDelete && tableToDelete.status === 'مشغولة') {
          setDeleteError(true);
          return;
      }
      setTables(prev => prev.filter(t => t.id !== tableId));
  }


  const getStatusClasses = (status: 'متاحة' | 'مشغولة') => {
    return status === 'متاحة' ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600";
  };

  const getStatusText = (status: 'متاحة' | 'مشغولة') => {
      return status === 'متاحة' ? t.available : t.occupied;
  }

  const activeTableId = activeOrder?.type === 'table' ? activeOrder.id : null;

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">{t.manageTables}</h1>
            <Button onClick={() => handleOpenDialog(null)}>
                <PlusCircle className="h-4 w-4 mx-2" />
                {t.addTable}
            </Button>
       </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {tables.map((table) => (
          <Card 
            key={table.id} 
            className={`cursor-pointer hover:shadow-lg transition-shadow relative group ${activeTableId === table.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handleTableClick(table)}
          >
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                         <DropdownMenuItem onClick={() => handleOpenDialog(table)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>{t.edit}</span>
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start px-2 py-1.5 text-sm font-normal text-destructive hover:bg-destructive/10 hover:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>{t.delete}</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t.deleteConfirmTitle}</AlertDialogTitle>
                                    <AlertDialogDescription>{t.deleteConfirmDesc}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteTable(table.id)}>{t.delete}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{table.name}</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-2">
               <Badge className={`${getStatusClasses(table.status)} text-white`}>
                {activeTableId === table.id ? t.active : getStatusText(table.status)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      
       {/* Add/Edit Dialog */}
       <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? t.editTable : t.addNewTable}</DialogTitle>
                    <DialogDescription>{isEditMode ? t.editTableDesc : t.addNewTableDesc}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">{t.tableName}</Label>
                        <Input id="name" value={tableName} onChange={(e) => setTableName(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCloseDialog}>{t.cancel}</Button>
                    <Button type="submit" onClick={handleSaveTable}>{isEditMode ? t.saveChanges : t.save}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        {/* Error Dialog for Deleting Occupied Table */}
        <AlertDialog open={deleteError} onOpenChange={setDeleteError}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t.deleteErrorTitle}</AlertDialogTitle>

                    <AlertDialogDescription>{t.deleteErrorDesc}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setDeleteError(false)}>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
