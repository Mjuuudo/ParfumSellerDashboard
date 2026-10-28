// Mirrors the StockBatch model in backend/src/prisma/contract.prisma:
// one delivery of `quantity` bottles of a perfume, bought at `purchaseCostPerBottle` each.
export type StockBatch = {
  id: number;
  parfumId: number;
  quantity: number; // number of full bottles received
  unusedQuantity: number; // bottles still sealed (quantity − bottles opened for decanting)
  purchaseCostPerBottle: number; // what YOU paid per bottle (not the selling price)
  receivedAt: string; // ISO date string from the API
  receivedBy: number; // id of the user who recorded the delivery
  // Only present if your backend includes these relations in its response.
  parfum?: {
    id: number;
    name: string;
    originalVolume: number;
    brand?: {
      name: string;
      image: string | null;
    };
  };
  receivedByUser?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
};
