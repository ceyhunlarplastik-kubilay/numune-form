"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import StickyColumnsTable, {
  Customer,
} from "@/components/customized/table/table-07";

import { CustomersPagination } from "@/components/customers/CustomersPagination";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

// --- Backend artık şu formatta dönüyor:
// { sector, productionGroups, products, mongoId }

type CustomerWithMongo = Customer & { mongoId: string };

interface PaginatedResponse {
  customers: CustomerWithMongo[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/* -------------------------------------------------------------------------- */
/*                               FETCH FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

async function fetchSectors() {
  const res = await fetch("/api/catalog/sectors");
  if (!res.ok) throw new Error("Sektörler yüklenemedi");
  return res.json();
}

async function fetchProductionGroups(sectorId: string) {
  const queryId = sectorId === "others" ? "all" : sectorId;
  const res = await fetch(`/api/catalog/options?sectorId=${queryId}`);
  if (!res.ok) throw new Error("Üretim grupları yüklenemedi");
  return res.json();
}

async function fetchProducts(groupId: string) {
  const res = await fetch(`/api/catalog/products?groupId=${groupId}`);
  if (!res.ok) throw new Error("Ürünler yüklenemedi");
  return res.json();
}

async function fetchCustomers(
  page: number,
  search: string,
  sector: string,
  group: string,
  product: string
): Promise<PaginatedResponse> {
  const params = new URLSearchParams();

  // Search varsa pagination yapmayacağız
  if (search) params.set("search", search);
  else params.set("page", String(page));

  if (sector && sector !== "all") params.set("sector", sector);
  if (group && group !== "all") params.set("productionGroup", group);
  if (product && product !== "all") params.set("product", product);

  const res = await fetch(`/api/customers?${params.toString()}`);
  if (!res.ok) throw new Error("Müşteri verileri alınamadı");
  return res.json();
}

/* -------------------------------------------------------------------------- */
/*                                  PAGE                                      */
/* -------------------------------------------------------------------------- */

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams?.get("page")) || 1;

  const [page, setPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  const [customerToDelete, setCustomerToDelete] =
    useState<CustomerWithMongo | null>(null);

  const queryClient = useQueryClient();

  /* ----------------------------- SECTORS QUERY ----------------------------- */

  const { data: sectorsData } = useQuery({
    queryKey: ["sectors"],
    queryFn: fetchSectors,
  });

  const sectors = Array.isArray(sectorsData) ? sectorsData : [];

  const selectedSectorObj = sectors.find((s: any) => s._id === selectedSector);
  const selectedSectorId = selectedSectorObj?._id ?? "";

  /* ------------------------- PRODUCTION GROUPS QUERY ------------------------ */

  const { data: groupsData } = useQuery({
    queryKey: ["productionGroups", selectedSectorId],
    queryFn: () => fetchProductionGroups(selectedSectorId),
    enabled: !!selectedSectorId,
  });

  const productionGroups = groupsData?.groups || [];

  const selectedGroupObj = productionGroups.find(
    (g: any) => g.groupId === selectedGroup
  );

  const selectedGroupId = selectedGroupObj?.groupId;

  /* ------------------------------ PRODUCTS QUERY ----------------------------- */

  const { data: productsData } = useQuery({
    queryKey: ["products", selectedGroupId],
    queryFn: () => fetchProducts(selectedGroupId!),
    enabled: !!selectedGroupId,
  });

  const products = productsData || [];

  /* ---------------------------- CUSTOMERS QUERY ----------------------------- */

  const { data, isLoading, error, refetch } = useQuery<PaginatedResponse>({
    queryKey: [
      "customers",
      page,
      debouncedSearch,
      selectedSector,
      selectedGroup,
      selectedProduct,
    ],
    queryFn: () =>
      fetchCustomers(
        page,
        debouncedSearch,
        selectedSector,
        selectedGroup,
        selectedProduct
      ),
  });

  const customers = data?.customers || [];
  const totalCustomers = data?.pagination?.total ?? customers.length;

  /* ------------------------------ DELETE MUTATION --------------------------- */

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/customers?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silme işlemi başarısız");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Kayıt silindi");
      setCustomerToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => toast.error("Silme sırasında hata oluştu"),
  });

  /* -------------------------- STATUS UPDATE MUTATION ----------------------- */
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch("/api/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          note: "Status updated from dashboard",
        }),
      });
      if (!res.ok) throw new Error("Durum güncellenemedi");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Durum güncellendi");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => toast.error("Güncelleme başarısız"),
  });

  /* -------------------------------------------------------------------------- */
  /*                                   UI                                       */
  /* -------------------------------------------------------------------------- */

  return (
    <>
      {/* NAVBAR */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
        <div className="font-bold text-lg">Ceyhunlar Dashboard</div>

        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="px-6 py-6 max-w-7xl mx-auto w-full">
        {/* FILTERS */}
        <section className="sticky top-0 bg-background/80 backdrop-blur-lg z-20 pb-4 mb-6 border-b">
          <h1 className="text-2xl font-bold text-center">Müşteriler</h1>

          <div className="flex items-center gap-3 max-w-4xl mx-auto mb-4 flex-wrap">
            {/* Sector */}
            <Select
              value={selectedSector || "all"}
              onValueChange={(val) => {
                setSelectedSector(val === "all" ? "" : val);
                setSelectedGroup("");
                setSelectedProduct("");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sektör" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Sektörler</SelectItem>
                {sectors.map((s: any) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Production Group */}
            {selectedSector && (
              <Select
                value={selectedGroup || "all"}
                onValueChange={(val) => {
                  setSelectedGroup(val === "all" ? "" : val);
                  setSelectedProduct("");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Üretim Grubu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Gruplar</SelectItem>
                  {productionGroups.map((g: any) => (
                    <SelectItem key={g.groupId} value={g.groupId}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Products */}
            {selectedGroup && (
              <Select
                value={selectedProduct ? String(selectedProduct) : "all"}
                onValueChange={(val) => {
                  console.log("Selected product:", val);
                  setSelectedProduct(val === "all" ? "" : val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Ürün" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Ürünler</SelectItem>

                  {products.map((p: any) => (
                    <SelectItem
                      key={p.productId}
                      value={String(p.productId)} // ✔ CRITICAL FIX
                    >
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(selectedSector || selectedGroup || selectedProduct) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSector("");
                  setSelectedGroup("");
                  setSelectedProduct("");
                  setPage(1);
                }}
              >
                Filtreleri Temizle ✕
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 max-w-xl mx-auto">
            <Input
              placeholder="Müşteri ara..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="rounded-full pl-10"
            />
            <Button variant="outline" onClick={() => refetch()}>
              Yenile
            </Button>
          </div>
        </section>

        {/* TABLE */}
        <section className="border rounded-lg bg-card overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted/30">
            <span className="font-medium">
              {customers.length} kayıt bulundu
            </span>
          </div>

          <div className="h-[600px] overflow-auto">
            <StickyColumnsTable
              customers={customers}
              onDelete={(c) => setCustomerToDelete(c)}
              onStatusUpdate={(id, status) =>
                statusMutation.mutate({ id, status })
              }
            />
          </div>

          {!debouncedSearch && data?.pagination && (
            <CustomersPagination page={page} setPage={setPage} data={data} />
          )}
        </section>
      </main>

      {/* DELETE DIALOG */}
      <AlertDialog
        open={!!customerToDelete}
        onOpenChange={() => setCustomerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Müşteri silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              <b>{customerToDelete?.companyName}</b> silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() =>
                  deleteMutation.mutate(customerToDelete!.mongoId!)
                }
              >
                Sil
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
