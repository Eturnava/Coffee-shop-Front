import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCoffee } from '@/hooks/useCoffees';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Skeleton } from '@/components/ui/skeleton';

export default function CoffeeDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: coffee, isLoading, error } = useCoffee(id!);
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (coffee) {
      addToCart({
        id: coffee.id,
        name: coffee.name,
        priceUsd: coffee.price_usd,
        priceGel: coffee.price_gel,
      });
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load coffee details.</p>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">
          Back to Menu
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="w-full md:w-80 h-64" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!coffee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Coffee not found.</p>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Coffee Details</h1>
        <CurrencySelector />
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-80 h-64 bg-coffee-card rounded-lg flex items-center justify-center">
            {coffee.image_url ? (
              <img 
                src={coffee.image_url} 
                alt={coffee.name} 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-coffee-card rounded-lg" />
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">{coffee.name}</h2>
            <p className="text-xl text-primary font-semibold mb-4">
              {formatPrice(coffee.price_usd, coffee.price_gel)}
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {coffee.long_description || coffee.description}
            </p>
            <Button onClick={handleAddToCart} size="lg">
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      <Link 
        to="/" 
        className="inline-flex items-center gap-2 mt-6 text-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </Link>
    </div>
  );
}
