import React, { createContext, useContext, useState, ReactNode } from 'react';

type Currency = 'USD' | 'GEL';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceUsd: number, priceGel: number) => string;
  getSymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('USD');

  const formatPrice = (priceUsd: number, priceGel: number): string => {
    if (currency === 'USD') {
      return `$${priceUsd.toFixed(2)}`;
    }
    return `₾${priceGel.toFixed(2)}`;
  };

  const getSymbol = (): string => {
    return currency === 'USD' ? '$' : '₾';
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, getSymbol }}>
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
