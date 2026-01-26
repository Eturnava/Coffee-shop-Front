import { useCurrency } from '@/contexts/CurrencyContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">Currency:</span>
      <Select value={currency} onValueChange={(value: 'USD' | 'GEL') => setCurrency(value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="USD">USD ($)</SelectItem>
          <SelectItem value="GEL">GEL (₾)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
