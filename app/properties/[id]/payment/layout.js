import { requireSession } from "@/lib/auth/session";

export default async function PaymentLayout({ children, params }) {
  const { id } = await params;
  await requireSession(`/properties/${id}/payment`);
  return children;
}
