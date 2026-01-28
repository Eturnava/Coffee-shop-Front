import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3001';

type Currency = 'USD' | 'GEL';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceUsd: number, priceGel: number) => string;
  getSymbol: () => string;
  fxRateUsdGel: number | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('USD');

  const [fxRateUsdGel, setFxRateUsdGel] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRate = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/fx/usd-gel`);
        if (!res.ok) return;
        const json = (await res.json()) as { rate?: number };
        const rate = Number(json?.rate);
        if (!cancelled && Number.isFinite(rate) && rate > 0) {
          setFxRateUsdGel(rate);
        }
      } catch {
        // ignore
      }
    };

    fetchRate();
    const id = window.setInterval(fetchRate, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const safePriceGelFromUsd = useMemo(() => {
    return (usd: number) => {
      if (!Number.isFinite(usd)) return 0;
      if (fxRateUsdGel && fxRateUsdGel > 0) return usd * fxRateUsdGel;
      return 0;
    };
  }, [fxRateUsdGel]);

  const formatPrice = (priceUsd: number, priceGel: number): string => {
    if (currency === 'USD') {
      return `$${priceUsd.toFixed(2)}`;
    }

    const gel = Number.isFinite(priceGel) && priceGel > 0 ? priceGel : safePriceGelFromUsd(priceUsd);
    return `₾${gel.toFixed(2)}`;
  };

  const getSymbol = (): string => {
    return currency === 'USD' ? '$' : '₾';
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, getSymbol, fxRateUsdGel }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
