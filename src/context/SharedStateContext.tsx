
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Product } from '@/app/dashboard/products/page';
import type { Invoice } from '@/app/dashboard/invoices/page';

// --- Type Definitions ---
export interface CartItem extends Product {
  cartQuantity: number;
}

export type TableStatus = "متاحة" | "مشغولة";

export interface Table {
  id: number;
  name: string;
  status: TableStatus;
  seats: number;
  cart: CartItem[];
  total: number;
}

export interface Customer {
    id: number;
    name: string;
    phone: string;
    email?: string;
}

export type ActiveOrder = { type: 'table'; id: number } | { type: 'takeaway' } | null;

type Currency = 'SAR' | 'USD' | 'YER';
interface CurrencyDetails {
    name: string;
    symbol: string;
    rateToUSD: number;
}

// --- Initial Data ---
const initialProductsRaw: Omit<Product, 'price'> & { priceSAR: number }[] = [];

const initialTables: Table[] = [];

const initialInvoices: Invoice[] = [];

const initialCustomers: Customer[] = [];

const currencies: Record<Currency, CurrencyDetails> = {
    SAR: { name: 'ريال سعودي', symbol: 'ر.س', rateToUSD: 0.27 },
    USD: { name: 'دولار أمريكي', symbol: '$', rateToUSD: 1 },
    YER: { name: 'ريال يمني', symbol: '﷼', rateToUSD: 1 / 530 },
};

// --- Context ---
interface SharedState {
    language: "ar" | "en";
    toggleLanguage: () => void;
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    invoices: Invoice[];
    setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
    tables: Table[];
    setTables: React.Dispatch<React.SetStateAction<Table[]>>;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    activeOrder: ActiveOrder;
    setActiveOrder: React.Dispatch<React.SetStateAction<ActiveOrder>>;
    takeawayCart: CartItem[];
    setTakeawayCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    storeName: string;
    setStoreName: React.Dispatch<React.SetStateAction<string>>;
    invoiceFooterText: string;
    setInvoiceFooterText: React.Dispatch<React.SetStateAction<string>>;
    storeLogo: string;
    setStoreLogo: React.Dispatch<React.SetStateAction<string>>;
    storeAddress: string;
    setStoreAddress: React.Dispatch<React.SetStateAction<string>>;
    storePhone: string;
    setStorePhone: React.Dispatch<React.SetStateAction<string>>;
    storeEmail: string;
    setStoreEmail: React.Dispatch<React.SetStateAction<string>>;
    taxRate: number;
    setTaxRate: React.Dispatch<React.SetStateAction<number>>;
    currency: Currency;
    setCurrency: React.Dispatch<React.SetStateAction<Currency>>;
    currencies: Record<Currency, CurrencyDetails>;
    formatCurrency: (amount: number) => string;
    getCurrencySymbol: () => string;
}

const SharedStateContext = createContext<SharedState | undefined>(undefined);

function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(defaultValue);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            try {
                const stickyValue = window.localStorage.getItem(key);
                if (stickyValue !== null) {
                    setValue(JSON.parse(stickyValue));
                }
            } catch (error) {
                console.error(`Error parsing localStorage key "${key}":`, error);
            }
        }
    }, [isMounted, key]);

    useEffect(() => {
        if (isMounted) {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error(`Error setting localStorage key "${key}":`, error);
            }
        }
    }, [key, value, isMounted]);

    return [value, setValue];
}


// Provider Component
export function SharedStateProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useStickyState<"ar" | "en">("ar", "cashier-pro-language");
    const [rawProducts, setRawProducts] = useStickyState<(Omit<Product, 'price'> & { priceSAR: number })[]>(initialProductsRaw, "cashier-pro-raw-products");
    const [invoices, setInvoices] = useStickyState<Invoice[]>(initialInvoices, "cashier-pro-invoices");
    const [tables, setTables] = useStickyState<Table[]>(initialTables, "cashier-pro-tables");
    const [customers, setCustomers] = useStickyState<Customer[]>(initialCustomers, "cashier-pro-customers");
    const [activeOrder, setActiveOrder] = useStickyState<ActiveOrder>(null, "cashier-pro-activeOrder");
    const [takeawayCart, setTakeawayCart] = useStickyState<CartItem[]>([], "cashier-pro-takeawayCart");
    
    // Settings
    const [storeName, setStoreName] = useStickyState<string>("كاشير برو", "cashier-pro-storeName");
    const [invoiceFooterText, setInvoiceFooterText] = useStickyState<string>("شكراً لزيارتكم!", "cashier-pro-invoiceFooter");
    const [storeLogo, setStoreLogo] = useStickyState<string>("", "cashier-pro-storeLogo");
    const [storeAddress, setStoreAddress] = useStickyState<string>("", "cashier-pro-storeAddress");
    const [storePhone, setStorePhone] = useStickyState<string>("", "cashier-pro-storePhone");
    const [storeEmail, setStoreEmail] = useStickyState<string>("", "cashier-pro-storeEmail");
    const [taxRate, setTaxRate] = useStickyState<number>(15, "cashier-pro-taxRate");
    const [currency, setCurrency] = useStickyState<Currency>('SAR', "cashier-pro-currency");

    const convertPrice = useCallback((priceSAR: number, toCurrency: Currency): number => {
        if (toCurrency === 'SAR') return priceSAR;
        const priceInUSD = priceSAR * currencies.SAR.rateToUSD;
        return priceInUSD / currencies[toCurrency].rateToUSD;
    }, []);

    const products = useMemo(() => {
        return rawProducts.map(p => ({
            ...p,
            price: convertPrice(p.priceSAR, currency)
        }));
    }, [rawProducts, currency, convertPrice]);
    
    const setProducts = (setter: React.SetStateAction<Product[]>) => {
        setRawProducts(prevRawProducts => {
            const currentProducts = prevRawProducts.map(p => ({
                ...p,
                price: convertPrice(p.priceSAR, currency)
            }));
            
            const newProducts = typeof setter === 'function' ? setter(currentProducts) : setter;

            return newProducts.map(p => {
                const { price, ...rest } = p;
                
                // Find original raw product to avoid floating point issues if possible
                const originalRaw = prevRawProducts.find(raw => raw.id === p.id);
                if (originalRaw) {
                    return { ...rest, priceSAR: originalRaw.priceSAR };
                }

                // If it's a new product, convert its price back to SAR for storage
                const priceInUSD = price * currencies[currency].rateToUSD;
                const priceSAR = priceInUSD / currencies.SAR.rateToUSD;
                return { ...rest, priceSAR };
            });
        });
    };

    const formatCurrency = useCallback((amount: number) => {
        const symbol = currencies[currency].symbol;
        return `${amount.toFixed(2)} ${symbol}`;
    }, [currency]);
    
    const getCurrencySymbol = useCallback(() => currencies[currency].symbol, [currency]);

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === "en" ? "ar" : "en"));
    };

    const value = {
        language,
        toggleLanguage,
        products,
        setProducts: setProducts as any,
        invoices,
        setInvoices,
        tables,
        setTables,
        customers,
        setCustomers,
        activeOrder,
        setActiveOrder,
        takeawayCart,
        setTakeawayCart,
        storeName,
        setStoreName,
        invoiceFooterText,
        setInvoiceFooterText,
        storeLogo,
        setStoreLogo,
        storeAddress,
        setStoreAddress,
        storePhone,
        setStorePhone,
        storeEmail,
        setStoreEmail,
        taxRate,
        setTaxRate,
        currency,
        setCurrency,
        currencies,
        formatCurrency,
        getCurrencySymbol,
    };

    return (
        <SharedStateContext.Provider value={value}>
            {children}
        </SharedStateContext.Provider>
    );
}

// Custom Hook to use the context
export function useSharedState() {
    const context = useContext(SharedStateContext);
    if (context === undefined) {
        throw new Error('useSharedState must be used within a SharedStateProvider');
    }
    return context;
}
