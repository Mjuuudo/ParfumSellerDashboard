// Mirrors the Brand model in backend/src/prisma/contract.prisma.
// Dates arrive from the API as JSON strings, not Date objects.
export type Brand = {
  id: number;
  name: string;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
