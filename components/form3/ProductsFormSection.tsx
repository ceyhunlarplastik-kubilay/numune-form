"use client";

import { Controller } from "react-hook-form";
import { useEffect, useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { Field, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ArrowDown, Search } from "lucide-react";
import { FormSectionHeader } from "@/components/form3/form-section/FormSectionHeader";
import { ScrollSpyNavigation } from "@/components/ui/scroll-spy-navigation";
import { Input } from "@/components/ui/input";

export const ProductsFormSection = ({
  form,
  groups,
}: {
  form: any;
  groups: Array<{
    groupId: string;
    name: string;
    products: Array<{ productId: string; name: string; imageUrl?: string }>;
  }>;
}) => {
  const selectedProducts = form.watch("urunler");
  const [isReady, setIsReady] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  /* -------------------------------------------------------------------------- */
  /*                       GRUPLAR YÜKLENDİĞİNDE HAZIRLIK                        */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (groups.length > 0) {
      setIsReady(false);
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [groups.length]);

  // İlk yüklemede (veya grup değiştiğinde) eğer hiç seçili yoksa ilk grubu seç
  // NOTE: This might be handled by ScrollSpy's defaultActiveId as well,
  // but keeping it to ensure form state is sync
  useEffect(() => {
    if (groups.length > 0) {
      // Optional: Set initial value if needed, but ScrollSpy will trigger onActiveChange
      // shortly after mounting via its effect if we want.
      // For now, let's trust the user interaction or ScrollSpy init.
      console.log("groups", groups);
    }
  }, [groups]);

  /* -------------------------------------------------------------------------- */
  /*                            FİLTRELEME                                      */
  /* -------------------------------------------------------------------------- */

  const filteredGroups = useMemo(() => {
    if (!debouncedSearch.trim()) return groups;

    const keyword = debouncedSearch.toLowerCase();

    return groups
      .map((group) => {
        const filteredProducts = group.products.filter((product) =>
          product.name.toLowerCase().includes(keyword)
        );

        return {
          ...group,
          products: filteredProducts,
        };
      })
      .filter((group) => group.products.length > 0);
  }, [groups, debouncedSearch]);

  /* -------------------------------------------------------------------------- */
  /*                            AGREEMENT CHANGE                                */
  /* -------------------------------------------------------------------------- */
  const handleActiveGroupChange = (groupId: string) => {
    form.setValue("uretimGrubu", groupId, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                         SCROLL DETECTION (Floating Button)                 */
  /* -------------------------------------------------------------------------- */
  const [showFloatingButton, setShowFloatingButton] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Check if we are near the bottom of the page (e.g., within 100px)
      const isNearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 150;

      setShowFloatingButton(!isNearBottom);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                            LOADING DURUMU                                   */
  /* -------------------------------------------------------------------------- */

  if (!isReady || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Ürünler yükleniyor...</p>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                  RENDER                                     */
  /* -------------------------------------------------------------------------- */

  const tabs = groups.map((g) => ({ id: g.groupId, label: g.name }));

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={groups[0]?.groupId || "empty"}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* STICKY HEADER WRAPPER */}
        <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
          <div className="pt-4 px-1">
            <FormSectionHeader
              title="Ürün Seçimi"
              description="İlgili üretim grubundan ürün seçiniz. Birden fazla ürün seçebilirsiniz."
            />
          </div>

          <ScrollSpyNavigation
            tabs={tabs}
            offset={140} // Adjust based on header height
            onActiveChange={handleActiveGroupChange}
            className="border-b-0" // Remove bottom border as the wrapper container handles visual separation if needed
          />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />

          <Input
            className="pl-10"
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* === NO RESULTS === */}
        {debouncedSearch && filteredGroups.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            “{debouncedSearch}” ile eşleşen ürün bulunamadı.
          </div>
        )}

        {/* === PRODUCT SELECTION (GROUPED) === */}
        <Controller
          name="urunler"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-4">
              {filteredGroups.map((group) => (
                <div
                  key={group.groupId}
                  id={group.groupId} // ID REQUIRED FOR SCROLL SPY
                  className="space-y-2 border rounded-lg p-4 bg-gray-50 scroll-mt-48" // scroll-mt checks offset
                >
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {group.name}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {group.products.map((product) => {
                      const isChecked = field.value?.some(
                        (item: any) => item.productId === product.productId
                      );

                      return (
                        <label
                          key={product.productId}
                          className={cn(
                            "flex flex-col gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                            "hover:bg-gray-100 hover:shadow-md",
                            isChecked && "border-primary bg-primary/5 shadow-sm"
                          )}
                        >
                          <div className="relative w-full aspect-square rounded-md overflow-hidden bg-white">
                            <Image
                              src={product.imageUrl || "/dairy-products.png"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const current = field.value || [];

                                if (checked) {
                                  field.onChange([
                                    ...current,
                                    {
                                      productId: product.productId,
                                      productionGroupId: group.groupId,
                                    },
                                  ]);
                                } else {
                                  field.onChange(
                                    current.filter(
                                      (item: any) =>
                                        item.productId !== product.productId
                                    )
                                  );
                                }
                              }}
                              className="mt-0.5 h-4 w-4 text-primary border-gray-300 rounded"
                            />

                            <span className="font-medium text-sm leading-tight">
                              {product.name}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

              {selectedProducts?.length > 0 && (
                <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm font-medium">
                    Seçilen ürün sayısı: {selectedProducts.length}
                  </p>
                </div>
              )}
            </Field>
          )}
        />

        {/* Floating "Sona Git" Button */}
        <AnimatePresence>
          {selectedProducts?.length > 0 && showFloatingButton && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              type="button"
              onClick={() => {
                window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: "smooth",
                });
              }}
              className={cn(
                "fixed bottom-6 right-6 z-50",
                "flex items-center gap-2 px-4 py-3 rounded-full",
                "bg-primary text-white shadow-lg",
                "hover:bg-primary/90 hover:shadow-xl",
                "transition-all duration-200",
                "font-medium text-sm"
              )}
            >
              <span>Sona Git</span>
              <ArrowDown className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
