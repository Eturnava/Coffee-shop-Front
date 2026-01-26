import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3001';

export interface Coffee {
  id: string;
  name: string;
  description: string;
  long_description: string | null;
  price_usd: number;
  price_gel: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const useCoffees = () => {
  return useQuery({
    queryKey: ['coffees'],
    queryFn: async () => {
      return await fetchJson<Coffee[]>(`${API_BASE_URL}/api/coffees`);
    },
  });
};

export const useCoffee = (id: string) => {
  return useQuery({
    queryKey: ['coffee', id],
    queryFn: async () => {
      return await fetchJson<Coffee>(`${API_BASE_URL}/api/coffees/${id}`);
    },
    enabled: !!id,
  });
};
