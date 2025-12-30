"use client";

import { Suspense } from "react";
import CustomersPageClient from "./CustomersPageClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Yükleniyor...</div>}>
      <CustomersPageClient />
    </Suspense>
  );
}
