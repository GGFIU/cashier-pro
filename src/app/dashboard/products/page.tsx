
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Loader2, Edit, Trash2 } from "lucide-react";
import Image from 'next/image';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSharedState } from '@/context/SharedStateContext';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number; 
  dataAiHint?: string;
}

const translations = {
    en: {
        manageProducts: "Product Management",
        manageProductsDesc: "Manage your products and inventory.",
        addProduct: "Add Product",
        editProduct: "Edit Product",
        editProductDesc: "Update the details for this product.",
        productList: "Product List",
        productListDesc: "A list of all available products in the system.",
        image: "Image",
        name: "Name",
        price: "Price",
        quantity: "Quantity",
        category: "Category",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        currency: "SAR",
        addNewProduct: "Add New Product",
        addNewProductDesc: "Fill in the details to add a new product.",
        productName: "Product Name",
        productCategory: "Product Category",
        productPrice: "Product Price",
        productQuantity: "Quantity in Stock",
        cancel: "Cancel",
        save: "Save",
        saveChanges: "Save Changes",
        chooseCategory: "Choose a category",
        fillAllFields: "Please fill in all fields.",
        newCategory: "New Category",
        newCategoryPlaceholder: "Or type a new category",
        productImage: "Product Image",
        uploadImage: "Upload Image",
        generateWithAI: "Generate with AI",
        generating: "Generating...",
        chooseFile: "Choose File",
        generateProductPhoto: "Generate Product Photo",
        generateNameImage: "Generate Name Image",
        manageCategories: "Category Management",
        manageCategoriesDesc: "Edit or delete your product categories.",
        editCategory: "Edit Category",
        deleteCategory: "Delete Category",
        newCategoryName: "New Category Name",
        deleteCategoryConfirmTitle: "Are you sure?",
        deleteCategoryConfirmDesc: "This action cannot be undone. Are you sure you want to delete this category?",
        deleteCategoryErrorTitle: "Cannot Delete Category",
        deleteCategoryErrorDesc: "This category is currently in use by one or more products. Please change the category of these products before deleting it.",
    },
    ar: {
        manageProducts: "إدارة المنتجات",
        manageProductsDesc: "إدارة المنتجات والمخزون الخاص بك.",
        addProduct: "إضافة منتج",
        editProduct: "تعديل المنتج",
        editProductDesc: "قم بتحديث تفاصيل هذا المنتج.",
        productList: "قائمة المنتجات",
        productListDesc: "قائمة بجميع المنتجات المتاحة في النظام.",
        image: "صورة",
        name: "الاسم",
        price: "السعر",
        quantity: "الكمية",
        category: "الفئة",
        actions: "إجراءات",
        edit: "تعديل",
        delete: "حذف",
        currency: "ر.س",
        addNewProduct: "إضافة منتج جديد",
        addNewProductDesc: "املأ التفاصيل لإضافة منتج جديد.",
        productName: "اسم المنتج",
        productCategory: "فئة المنتج",
        productPrice: "سعر المنتج",
        productQuantity: "الكمية في المخزون",
        cancel: "إلغاء",
        save: "حفظ",
        saveChanges: "حفظ التغييرات",
        chooseCategory: "اختر فئة",
        fillAllFields: "الرجاء ملء جميع الحقول.",
        newCategory: "فئة جديدة",
        newCategoryPlaceholder: "أو اكتب فئة جديدة",
        productImage: "صورة المنتج",
        uploadImage: "رفع صورة",
        generateWithAI: "إنشاء بالذكاء الاصطناعي",
        generating: "جاري الإنشاء...",
        chooseFile: "اختر ملف",
        generateProductPhoto: "إنشاء صورة للمنتج",
        generateNameImage: "إنشاء صورة بالاسم",
        manageCategories: "إدارة الفئات",
        manageCategoriesDesc: "تعديل أو حذف فئات منتجاتك.",
        editCategory: "تعديل الفئة",
        deleteCategory: "حذف الفئة",
        newCategoryName: "اسم الفئة الجديد",
        deleteCategoryConfirmTitle: "هل أنت متأكد؟",
        deleteCategoryConfirmDesc: "لا يمكن التراجع عن هذا الإجراء. هل أنت متأكد من رغبتك في حذف هذه الفئة؟",
        deleteCategoryErrorTitle: "لا يمكن حذف الفئة",
        deleteCategoryErrorDesc: "هذه الفئة مستخدمة حاليًا من قبل منتج واحد أو أكثر. يرجى تغيير فئة هذه المنتجات قبل حذفها.",
    }
};

const basicCategories: string[] = [];

// Category Manager Component
const CategoryManager = ({ products, setProducts, language }: { products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>>, language: 'ar' | 'en' }) => {
    const t = translations[language];
    const [basicCats, setBasicCats] = useState(basicCategories);
    const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [errorDialog, setErrorDialog] = useState(false);

    const allCategories = [...new Set([...basicCats, ...products.map(p => p.category)])];

    const handleEditCategory = () => {
        if (!categoryToEdit || !newCategoryName || categoryToEdit === newCategoryName) {
            setCategoryToEdit(null);
            return;
        }

        // Update products
        setProducts(prevProducts =>
            prevProducts.map(p => (p.category === categoryToEdit ? { ...p, category: newCategoryName } : p))
        );
        
        // Update basic categories list if the category exists there
        if (basicCats.includes(categoryToEdit)) {
            setBasicCats(prev => prev.map(c => c === categoryToEdit ? newCategoryName : c));
        }

        setCategoryToEdit(null);
        setNewCategoryName("");
    };

    const handleDeleteCategory = () => {
        if (!categoryToDelete) return;

        const isCategoryInUse = products.some(p => p.category === categoryToDelete);
        if (isCategoryInUse) {
            setErrorDialog(true);
            setCategoryToDelete(null);
            return;
        }

        // Remove from basic categories if it exists there
        if (basicCats.includes(categoryToDelete)) {
            setBasicCats(prev => prev.filter(c => c !== categoryToDelete));
        }
        
        setCategoryToDelete(null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t.manageCategories}</CardTitle>
                <CardDescription>{t.manageCategoriesDesc}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {allCategories.map(category => (
                        <div key={category} className="flex items-center justify-between p-2 border rounded-md">
                            <span className="truncate">{category}</span>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => { setCategoryToEdit(category); setNewCategoryName(category); }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setCategoryToDelete(category)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            {/* Edit Dialog */}
            <Dialog open={!!categoryToEdit} onOpenChange={(isOpen) => !isOpen && setCategoryToEdit(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.editCategory}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="category-name">{t.newCategoryName}</Label>
                        <Input id="category-name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCategoryToEdit(null)}>{t.cancel}</Button>
                        <Button onClick={handleEditCategory}>{t.saveChanges}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!categoryToDelete} onOpenChange={(isOpen) => !isOpen && setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t.deleteCategoryConfirmTitle}</AlertDialogTitle>
                        <AlertDialogDescription>{t.deleteCategoryConfirmDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCategory}>{t.delete}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
             {/* Error Dialog for Deleting Category in Use */}
            <AlertDialog open={errorDialog} onOpenChange={setErrorDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t.deleteCategoryErrorTitle}</AlertDialogTitle>
                        <AlertDialogDescription>{t.deleteCategoryErrorDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setErrorDialog(false)}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};

export default function ProductsPage() {
    const { language, products, setProducts, formatCurrency } = useSharedState();
    const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    
    // Form state
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [productQuantity, setProductQuantity] = useState("");
    const [productCategory, setProductCategory] = useState("");
    const [newCategoryInput, setNewCategoryInput] = useState("");
    const [productImage, setProductImage] = useState("https://placehold.co/200x200.png");
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [error, setError] = useState('');

    const t = translations[language];
    const isEditMode = editingProduct !== null;

    useEffect(() => {
        if (isAddProductDialogOpen) {
            if (isEditMode) {
                setProductName(editingProduct.name);
                setProductPrice(editingProduct.price.toString());
                setProductQuantity(editingProduct.quantity.toString());
                setProductCategory(editingProduct.category);
                setProductImage(editingProduct.image);
                setNewCategoryInput(""); 
            }
        } else {
            resetForm();
        }
    }, [isAddProductDialogOpen, isEditMode, editingProduct]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                if(typeof loadEvent.target?.result === 'string') {
                    setProductImage(loadEvent.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };


    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setIsAddProductDialogOpen(true);
    };
    
    const handleDelete = (productId: number) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    const handleGenerateImage = async (generationType: 'photo' | 'text') => {
        if (!productName) {
            alert(language === 'ar' ? 'الرجاء إدخال اسم المنتج أولاً.' : 'Please enter a product name first.');
            return;
        }
        setIsGeneratingImage(true);
        setError('');
        try {
            let prompt = '';
            if (generationType === 'photo') {
                prompt = `a professional, clean product photo of ${productName}, on a white background, high quality, commercial`;
            } else {
                prompt = `a simple, elegant graphic with a white background showing the text "${productName}" in a stylish Arabic font. Minimalist, clean design.`;
            }
            
            const result = await generateImage(prompt);
            if (result.imageDataUri) {
                setProductImage(result.imageDataUri);
            }
        } catch (error) {
            console.error("Image generation failed:", error);
            setError(error instanceof Error ? error.message : 'Image generation failed.');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleSaveProduct = () => {
        const finalCategory = newCategoryInput || productCategory;
        if (!productName || !productPrice || !productQuantity || !finalCategory || !productImage) {
            alert(t.fillAllFields);
            return;
        }

        const productData = {
            name: productName,
            price: parseFloat(productPrice),
            quantity: parseInt(productQuantity, 10),
            category: finalCategory,
            image: productImage,
            dataAiHint: productName.toLowerCase(),
        };

        if (isEditMode) {
            setProducts(prev => prev.map(p => 
                p.id === editingProduct.id ? { ...p, ...productData } : p
            ));
        } else {
            const newProduct: Product = {
                id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
                ...productData,
            };
            setProducts(prev => [...prev, newProduct]);
        }
        closeDialog();
    };

    const resetForm = () => {
        setProductName("");
        setProductPrice("");
        setProductQuantity("");
        setProductCategory("");
        setNewCategoryInput("");
        setProductImage("https://placehold.co/200x200.png");
        setEditingProduct(null);
        setIsGeneratingImage(false);
        setError('');
    };
    
    const closeDialog = () => {
        setIsAddProductDialogOpen(false);
    }

    const allCategories = [...new Set([...basicCategories, ...products.map(p => p.category)])];


    return (
        <div className="flex flex-col gap-6" dir="ltr">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold md:text-2xl">{t.manageProducts}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t.manageProductsDesc}
                    </p>
                </div>
                 <Dialog open={isAddProductDialogOpen} onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        resetForm();
                    }
                    setIsAddProductDialogOpen(isOpen);
                 }}>
                    <DialogTrigger asChild>
                         <Button onClick={() => { setEditingProduct(null); setIsAddProductDialogOpen(true); }}>
                            <PlusCircle className="h-4 w-4 mx-2" />
                            {t.addProduct}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md" dir="ltr">
                        <DialogHeader>
                            <DialogTitle>{isEditMode ? t.editProduct : t.addNewProduct}</DialogTitle>
                            <DialogDescription>
                                {isEditMode ? t.editProductDesc : t.addNewProductDesc}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">{t.productName}</Label>
                                <Input id="name" value={productName} onChange={(e) => setProductName(e.target.value)} className="col-span-3" />
                            </div>

                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">{t.productImage}</Label>
                                <div className="col-span-3">
                                    <Image src={productImage} alt="Product image" width={80} height={80} className="rounded-md border aspect-square object-cover" />
                                </div>
                            </div>
                            
                           <Tabs defaultValue="upload" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="upload">{t.uploadImage}</TabsTrigger>
                                    <TabsTrigger value="ai">{t.generateWithAI}</TabsTrigger>
                                </TabsList>
                                <TabsContent value="upload">
                                    <div className="flex justify-center items-center mt-4">
                                        <Label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                            {t.chooseFile}
                                        </Label>
                                        <Input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </div>
                                </TabsContent>
                                <TabsContent value="ai">
                                    <div className="flex flex-col justify-center items-center mt-4 gap-2">
                                        {isGeneratingImage ? (
                                            <Button disabled>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t.generating}
                                            </Button>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2 w-full">
                                                <Button onClick={() => handleGenerateImage('photo')} disabled={!productName} variant="outline">
                                                    {t.generateProductPhoto}
                                                </Button>
                                                <Button onClick={() => handleGenerateImage('text')} disabled={!productName} variant="outline">
                                                    {t.generateNameImage}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {error && <p className="text-sm text-destructive text-center">{error}</p>}
                            <Separator />


                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">{t.productCategory}</Label>
                                <Select onValueChange={setProductCategory} value={productCategory}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder={t.chooseCategory} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allCategories.map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-category" className="text-right">{t.newCategory}</Label>
                                <Input id="new-category" value={newCategoryInput} onChange={(e) => setNewCategoryInput(e.target.value)} className="col-span-3" placeholder={t.newCategoryPlaceholder} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">{t.productPrice}</Label>
                                <Input id="price" type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="quantity" className="text-right">{t.productQuantity}</Label>
                                <Input id="quantity" type="number" value={productQuantity} onChange={(e) => setProductQuantity(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={closeDialog}>{t.cancel}</Button>
                            <Button type="submit" onClick={handleSaveProduct}>{isEditMode ? t.saveChanges : t.save}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t.productList}</CardTitle>
                    <CardDescription>
                        {t.productListDesc}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden sm:table-cell">{t.image}</TableHead>
                                <TableHead>{t.name}</TableHead>
                                <TableHead>{t.price}</TableHead>
                                <TableHead className="hidden md:table-cell">{t.quantity}</TableHead>
                                <TableHead className="hidden lg:table-cell">{t.category}</TableHead>
                                <TableHead>
                                    <span className="sr-only">{t.actions}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={product.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={product.image}
                                            width="64"
                                            data-ai-hint={product.dataAiHint}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{formatCurrency(product.price)}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Badge variant={product.quantity > 10 ? 'default' : product.quantity > 0 ? "secondary" : "destructive"}>
                                            {product.quantity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">{product.category}</TableCell>
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
                                                <DropdownMenuItem onClick={() => handleEditClick(product)}>{t.edit}</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive">{t.delete}</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CategoryManager products={products} setProducts={setProducts} language={language} />

        </div>
    );
}
