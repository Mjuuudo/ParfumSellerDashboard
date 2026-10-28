// Shape returned by GET /api/customer and GET /api/customer/:id
// (backend/src/customer/customer.service.ts). Dates arrive as ISO strings.
export type Customer = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const API_URL = "http://localhost:8000/api/customer";

// Two letters for the avatar: "Sara Benali" → "SB", "Amine" → "AM".
export function customerInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

// Reads the error message NestJS sends back ({ message: string | string[] }).
export async function readApiError(response: Response, fallback: string) {
  try {
    const body = await response.json();
    if (Array.isArray(body?.message)) return body.message.join(" · ");
    if (typeof body?.message === "string") return body.message;
  } catch {
    // body was empty or not JSON
  }
  return fallback;
}
