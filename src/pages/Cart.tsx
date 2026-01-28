import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { CurrencySelector } from '@/components/CurrencySelector';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Cart() {
  const { items, removeFromCart, clearCart, getTotalUsd, getTotalGel, purchase } = useCart();
  const { currency, formatPrice, fxRateUsdGel } = useCurrency();

  const totalUsd = getTotalUsd();
  const totalGelStored = getTotalGel();
  const totalGelLive = fxRateUsdGel ? totalUsd * fxRateUsdGel : totalGelStored;

  const total = currency === 'USD' ? totalUsd : totalGelLive;
  const totalFormatted = currency === 'USD' ? `$${total.toFixed(2)}` : `₾${total.toFixed(2)}`;

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-6">Your Shopping Cart</h1>
        
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-coffee-card mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some delicious coffee to your cart!</p>
          <Button asChild>
            <Link to="/">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Your Shopping Cart</h1>
      
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="flex justify-end p-4 border-b border-border">
          <CurrencySelector />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-table-header hover:bg-table-header">
              <TableHead className="text-table-header-foreground font-semibold">Coffee</TableHead>
              <TableHead className="text-table-header-foreground font-semibold">Price</TableHead>
              <TableHead className="text-table-header-foreground font-semibold">Quantity</TableHead>
              <TableHead className="text-table-header-foreground font-semibold">Subtotal</TableHead>
              <TableHead className="text-table-header-foreground font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{formatPrice(item.priceUsd, item.priceGel)}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  {formatPrice(item.priceUsd * item.quantity, item.priceGel * item.quantity)}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="p-4 border-t border-border flex justify-between items-center">
          <p className="text-lg font-bold">Total: {totalFormatted}</p>
          <div className="flex gap-3">
            <Button onClick={purchase}>
              Purchase
            </Button>
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
