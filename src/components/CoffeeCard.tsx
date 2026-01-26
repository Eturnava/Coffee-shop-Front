import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart } from '@/contexts/CartContext';
import { Coffee } from '@/hooks/useCoffees';

interface CoffeeCardProps {
  coffee: Coffee;
}

export function CoffeeCard({ coffee }: CoffeeCardProps) {
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: coffee.id,
      name: coffee.name,
      priceUsd: coffee.price_usd,
      priceGel: coffee.price_gel,
    });
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-sm border border-border">
      <div className="h-32 bg-coffee-card flex items-center justify-center">
        {coffee.image_url ? (
          <img 
            src={coffee.image_url} 
            alt={coffee.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-coffee-card" />
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">{coffee.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {coffee.description}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-primary">
            {formatPrice(coffee.price_usd, coffee.price_gel)}
          </span>
          <ShoppingCart className="w-4 h-4 text-muted-foreground" />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleAddToCart}
            className="flex-1"
          >
            Add to Cart
          </Button>
          <Button 
            variant="secondary"
            asChild
            className="flex-1"
          >
            <Link to={`/coffee/${coffee.id}`}>Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
