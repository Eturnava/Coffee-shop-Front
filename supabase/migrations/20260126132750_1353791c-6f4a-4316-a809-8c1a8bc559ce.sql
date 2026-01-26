-- Create coffees table for the coffee shop
CREATE TABLE public.coffees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  price_usd DECIMAL(10, 2) NOT NULL,
  price_gel DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.coffees ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (everyone can view coffees)
CREATE POLICY "Anyone can view coffees" 
ON public.coffees 
FOR SELECT 
USING (true);

-- Create policy for admin insert (for now, allow all inserts - will be secured later with admin auth)
CREATE POLICY "Allow insert for admin" 
ON public.coffees 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admin update
CREATE POLICY "Allow update for admin" 
ON public.coffees 
FOR UPDATE 
USING (true);

-- Create policy for admin delete
CREATE POLICY "Allow delete for admin" 
ON public.coffees 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_coffees_updated_at
BEFORE UPDATE ON public.coffees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial coffee data
INSERT INTO public.coffees (name, description, long_description, price_usd, price_gel) VALUES
('Espresso', 'Strong and concentrated coffee served in small shots.', 'A rich, full-bodied coffee made by forcing hot water through finely ground coffee beans. The result is a concentrated shot of coffee with a distinctive layer of crema on top. Perfect for those who appreciate intense coffee flavor.', 2.99, 8.07),
('Cappuccino', 'Equal parts espresso, steamed milk, and milk foam.', 'A classic Italian coffee drink made with equal parts espresso, steamed milk, and frothed milk foam. The combination creates a perfectly balanced beverage with a rich, creamy texture and a mild coffee flavor.', 3.99, 10.77),
('Latte', 'Espresso with steamed milk and a small layer of foam.', 'A latte consists of espresso with steamed milk and a small layer of foam on top. It has a higher ratio of steamed milk to espresso than a cappuccino, resulting in a creamier drink with a milder coffee flavor. Lattes are often flavored with syrups like vanilla, caramel, or hazelnut.', 4.29, 11.58),
('Mocha', 'Espresso with chocolate, steamed milk, and whipped cream.', 'A delicious combination of espresso, chocolate syrup, steamed milk, and topped with whipped cream. This indulgent drink is perfect for chocolate lovers who also enjoy their coffee fix.', 4.79, 12.93),
('Americano', 'Espresso diluted with hot water.', 'An Americano is made by diluting espresso with hot water, giving it a similar strength to drip coffee but with a different flavor profile. The result is a smooth, rich coffee that highlights the espresso character.', 3.49, 9.42),
('Macchiato', 'Espresso with a small amount of foamed milk.', 'An espresso macchiato is a shot of espresso with just a small amount of foamed milk on top. The word macchiato means stained in Italian, referring to the way the milk stains the espresso.', 3.79, 10.23);