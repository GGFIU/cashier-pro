
"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSharedState } from "@/context/SharedStateContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail } from "lucide-react";


const translations = {
  en: {
    settings: "Settings",
    profile: "Profile",
    profileDescription: "This is your profile information.",
    fullName: "Full Name",
    email: "Email",
    languageSettings: "Language Settings",
    languageSettingsDescription: "Choose your preferred language for the interface.",
    currentLanguageIs: "Current language is",
    english: "English",
    arabic: "Arabic",
    switchToArabic: "Switch to Arabic",
    switchToEnglish: "Switch to English",
    loading: "Loading...",
    invoiceSettings: "Invoice Settings",
    invoiceSettingsDescription: "Customize the look and feel of your receipts.",
    customizeInvoice: "Customize Invoice",
    customizeInvoiceDialogTitle: "Customize Receipt",
    customizeInvoiceDialogDesc: "Change the store name, logo, contact info, and footer message on your receipts.",
    storeNameLabel: "Store Name",
    footerMessageLabel: "Footer Message",
    cancel: "Cancel",
    save: "Save Changes",
    storeLogoLabel: "Store Logo",
    uploadLogo: "Upload Logo",
    storeAddressLabel: "Address",
    storePhoneLabel: "Phone Number",
    storeEmailLabel: "Email",
    financialSettings: "Financial Settings",
    financialSettingsDesc: "Manage tax rates and currency.",
    taxRate: "Tax Rate (%)",
    currency: "Currency",
    support: "Technical Support",
    supportDescription: "Contact us for help.",
    callUs: "Call Us",
    emailUs: "Email Us",
  },
  ar: {
    settings: "الإعدادات",
    profile: "الملف الشخصي",
    profileDescription: "هذه هي معلومات ملفك الشخصي.",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    languageSettings: "إعدادات اللغة",
    languageSettingsDescription: "اختر لغتك المفضلة للواجهة.",
    currentLanguageIs: "اللغة الحالية هي",
    english: "الإنجليزية",
    arabic: "العربية",
    switchToArabic: "التحويل إلى العربية",
    switchToEnglish: "التحويل إلى الإنجليزية",
    loading: "تحميل...",
    invoiceSettings: "إعدادات الفاتورة",
    invoiceSettingsDescription: "تخصيص شكل ومظهر الإيصالات الخاصة بك.",
    customizeInvoice: "تخصيص الفاتورة",
    customizeInvoiceDialogTitle: "تخصيص الإيصال",
    customizeInvoiceDialogDesc: "قم بتغيير اسم المتجر، الشعار، معلومات الاتصال، ورسالة التذييل في إيصالاتك.",
    storeNameLabel: "اسم المتجر",
    footerMessageLabel: "رسالة التذييل",
    cancel: "إلغاء",
    save: "حفظ التغييرات",
    storeLogoLabel: "شعار المتجر",
    uploadLogo: "رفع شعار",
    storeAddressLabel: "العنوان",
    storePhoneLabel: "رقم الهاتف",
    storeEmailLabel: "البريد الإلكتروني",
    financialSettings: "الإعدادات المالية",
    financialSettingsDesc: "إدارة معدلات الضريبة والعملة.",
    taxRate: "نسبة الضريبة (%)",
    currency: "العملة",
    support: "الدعم الفني",
    supportDescription: "تواصل معنا للمساعدة.",
    callUs: "اتصل بنا",
    emailUs: "راسلنا",
  },
};


const InvoiceCustomizationDialog = ({ t }: { t: typeof translations.en }) => {
    const { 
        storeName, setStoreName, 
        invoiceFooterText, setInvoiceFooterText,
        storeLogo, setStoreLogo,
        storeAddress, setStoreAddress,
        storePhone, setStorePhone,
        storeEmail, setStoreEmail
    } = useSharedState();
    
    const [localStoreName, setLocalStoreName] = useState(storeName);
    const [localFooterText, setLocalFooterText] = useState(invoiceFooterText);
    const [localStoreLogo, setLocalStoreLogo] = useState(storeLogo);
    const [localStoreAddress, setLocalStoreAddress] = useState(storeAddress);
    const [localStorePhone, setLocalStorePhone] = useState(storePhone);
    const [localStoreEmail, setLocalStoreEmail] = useState(storeEmail);
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        setStoreName(localStoreName);
        setInvoiceFooterText(localFooterText);
        setStoreLogo(localStoreLogo);
        setStoreAddress(localStoreAddress);
        setStorePhone(localStorePhone);
        setStoreEmail(localStoreEmail);
        setIsOpen(false);
    };
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                if(typeof loadEvent.target?.result === 'string') {
                    setLocalStoreLogo(loadEvent.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>{t.customizeInvoice}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t.customizeInvoiceDialogTitle}</DialogTitle>
                    <DialogDescription>{t.customizeInvoiceDialogDesc}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label htmlFor="store-name">{t.storeNameLabel}</Label>
                        <Input id="store-name" value={localStoreName} onChange={(e) => setLocalStoreName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label>{t.storeLogoLabel}</Label>
                        <div className="flex items-center gap-4">
                             {localStoreLogo && <Image src={localStoreLogo} alt="Store Logo Preview" width={64} height={64} className="rounded-md border" />}
                             <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                             <Label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                 {t.uploadLogo}
                             </Label>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="store-address">{t.storeAddressLabel}</Label>
                        <Input id="store-address" value={localStoreAddress} onChange={(e) => setLocalStoreAddress(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="store-phone">{t.storePhoneLabel}</Label>
                        <Input id="store-phone" type="tel" value={localStorePhone} onChange={(e) => setLocalStorePhone(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="store-email">{t.storeEmailLabel}</Label>
                        <Input id="store-email" type="email" value={localStoreEmail} onChange={(e) => setLocalStoreEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="footer-text">{t.footerMessageLabel}</Label>
                        <Input id="footer-text" value={localFooterText} onChange={(e) => setLocalFooterText(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>{t.cancel}</Button>
                    <Button onClick={handleSave}>{t.save}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function SettingsPage() {
  const { 
    language, toggleLanguage, taxRate, setTaxRate,
    currency, setCurrency, currencies
  } = useSharedState();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const t = translations[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">{t.settings}</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t.profile}</CardTitle>
          <CardDescription>
            {t.profileDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">{t.fullName}</Label>
            <Input id="displayName" value={loading ? t.loading : user?.displayName || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input id="email" type="email" value={loading ? t.loading : user?.email || ""} disabled />
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>{t.financialSettings}</CardTitle>
          <CardDescription>
            {t.financialSettingsDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="taxRate">{t.taxRate}</Label>
                <Input 
                    id="taxRate" 
                    type="number" 
                    value={taxRate} 
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="currency">{t.currency}</Label>
                <Select onValueChange={(value) => setCurrency(value as 'SAR' | 'USD' | 'YER')} value={currency}>
                    <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(currencies).map(([code, details]) => (
                            <SelectItem key={code} value={code}>{details.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.languageSettings}</CardTitle>
          <CardDescription>
            {t.languageSettingsDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground mb-4">
             {t.currentLanguageIs} {language === 'en' ? t.english : t.arabic}
          </p>
          <Button onClick={toggleLanguage}>
            {language === 'en' ? t.switchToArabic : t.switchToEnglish}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.invoiceSettings}</CardTitle>
          <CardDescription>
            {t.invoiceSettingsDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceCustomizationDialog t={t} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t.support}</CardTitle>
          <CardDescription>
            {t.supportDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild variant="outline">
                <a href="tel:+967771033386" className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{t.callUs}</span>
                </a>
            </Button>
             <Button asChild variant="outline">
                 <a href="mailto:abnyemenx@gmail.com" className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{t.emailUs}</span>
                </a>
            </Button>
        </CardContent>
      </Card>

    </div>
  );
}
