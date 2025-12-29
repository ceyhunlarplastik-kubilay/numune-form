"use client";

import { Controller } from "react-hook-form";
import { useRef, useEffect, useState } from "react";
import { Field, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { FormSectionStickyWrapper } from "@/components/form3/form-section/FormSectionStickyWrapper";

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
  // uretimGrubu form değerini tek kaynak olarak kullanalım
  const activeGroupId: string | undefined = form.watch("uretimGrubu");
  const selectedProducts = form.watch("urunler");

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabContainerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [isReady, setIsReady] = useState(false);

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
  useEffect(() => {
    if (groups.length > 0 && !activeGroupId) {
      const firstGroupId = groups[0].groupId;
      form.setValue("uretimGrubu", firstGroupId, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [groups, activeGroupId, form]);

  /* -------------------------------------------------------------------------- */
  /*                               SCROLL SPY (OBSERVER)                         */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (groups.length === 0 || !isReady) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const groupId = entry.target.getAttribute("data-group-id");
          if (!groupId) return;

          // Section viewport içinde yeterince görünürse form'u güncelle
          if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
            if (groupId !== activeGroupId) {
              form.setValue("uretimGrubu", groupId, {
                shouldDirty: false,
                shouldTouch: false,
              });
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "-120px 0px -50% 0px",
        threshold: [0.25, 0.5, 0.75],
      }
    );

    const sections = Object.values(sectionRefs.current);
    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [groups, isReady, form, activeGroupId]);

  /* -------------------------------------------------------------------------- */
  /*                     AKTİF TABI GÖRÜNÜR TUTMA (AUTO-SCROLL)                 */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!activeGroupId || !tabContainerRef.current) return;

    const activeTab = tabRefs.current[activeGroupId];
    if (!activeTab) return;

    const container = tabContainerRef.current;
    const tabLeft = activeTab.offsetLeft;
    const tabWidth = activeTab.offsetWidth;
    const containerScrollLeft = container.scrollLeft;
    const containerWidth = container.offsetWidth;

    if (tabLeft < containerScrollLeft) {
      container.scrollTo({
        left: tabLeft - 20,
        behavior: "smooth",
      });
    } else if (tabLeft + tabWidth > containerScrollLeft + containerWidth) {
      container.scrollTo({
        left: tabLeft - containerWidth + tabWidth + 20,
        behavior: "smooth",
      });
    }
  }, [activeGroupId]);

  /* -------------------------------------------------------------------------- */
  /*                       TAB'A TIKLAYINCA İLGİLİ GRUBA SCROLL                 */
  /* -------------------------------------------------------------------------- */

  const scrollToGroup = (groupId: string) => {
    const target = sectionRefs.current[groupId];
    if (!target) return;

    // Sticky header yüksekliği kadar offset
    const headerOffset = 180;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    // Hemen form değerini güncelle ki highlight anında değişsin
    form.setValue("uretimGrubu", groupId, {
      shouldDirty: false,
      shouldTouch: false,
    });
  };

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
        {/* STICKY HEADER + TAB BAR */}
        <FormSectionStickyWrapper
          title="Ürün Seçimi"
          description="İlgili üretim grubundan ürün seçiniz. Birden fazla ürün seçebilirsiniz."
          tabContainerRef={tabContainerRef}
          tabRefs={tabRefs}
          groups={groups.map((g) => ({
            groupId: g.groupId,
            name: g.name,
          }))}
          activeGroupId={activeGroupId}
          scrollToGroup={scrollToGroup}
        >
          {/* === PRODUCT SELECTION (GROUPED) === */}
          <Controller
            name="urunler"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="space-y-4">
                {groups.map((group) => (
                  <div
                    key={group.groupId}
                    data-group-id={group.groupId}
                    ref={(el) => {
                      sectionRefs.current[group.groupId] = el;
                    }}
                    className="space-y-2 border rounded-lg p-4 bg-gray-50"
                  >
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {group.name}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                              isChecked &&
                                "border-primary bg-primary/5 shadow-sm"
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

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}

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
        </FormSectionStickyWrapper>

        {/* Floating "Sona Git" Button */}
        <AnimatePresence>
          {selectedProducts?.length > 0 && (
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
