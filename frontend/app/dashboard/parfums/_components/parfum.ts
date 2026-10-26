// Mirrors the Parfum model in backend/src/prisma/contract.prisma.
export type Parfum = {
  id: number;
  name: string;
  brandId: number;
  originalVolume: number; // bottle size in ml
  completePrice: number; // price of the full bottle
  decant10Price: number; // price of a 10 ml decant
  decant20Price: number; // price of a 20 ml decant
  isActive: boolean;
  // Only present if your backend includes the brand relation in its response.
  // Without it, find the brand name from brandId using your brands list.
  brand?: {
    id: number;
    name: string;
    image: string | null;
  };
};

// Prices are stored as whole numbers (Int). Change this if you use another currency.
export const CURRENCY = "MAD";

// Display only: 1250 -> "1,250 MAD".
export function formatPrice(value: number) {
  return `${value.toLocaleString()} ${CURRENCY}`;
}
