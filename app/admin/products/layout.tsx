import { redirect } from "next/navigation";
import { checkRole } from "@/utils/roles";

export default async function AdminProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // RBAC: enforce admin only
  if (!(await checkRole("admin"))) {
    redirect("/");
  }

  return <>{children}</>;
}
