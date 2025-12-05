"use client";

import { Controller } from "react-hook-form";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

import { Field, FieldError } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import { getProductionGroupImage } from "@/constants/productionGroups";

export const ProductionGroupFormSection = ({
  form,
  productionGroupList,
  selectedSektor,
}: {
  form: any;
  productionGroupList: string[];
  selectedSektor: string;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // API'dan gelen üretim grubu listesini görsellerle eşleştir
  const productionGroupData = productionGroupList.map((groupName) => ({
    name: groupName,
    image: getProductionGroupImage(groupName),
  }));

  // Arama filtresi
  const filteredGroups = productionGroupData.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Seçim yapıldığında smooth scroll
  const selectedGroup = form.watch("uretimGrubu");

  useEffect(() => {
    if (selectedGroup && sectionRef.current) {
      // Kısa bir gecikme ile scroll yap (animasyon için)
      setTimeout(() => {
        // Section'ın altına scroll yap
        const sectionBottom =
          sectionRef.current?.getBoundingClientRect().bottom || 0;
        const windowHeight = window.innerHeight;

        // Scroll miktarını hesapla
        let scrollAmount = 0;
        if (sectionBottom > windowHeight) {
          scrollAmount = sectionBottom - windowHeight + 200; // 200px ekstra boşluk
        } else {
          scrollAmount = 400; // Section görünüyorsa, biraz daha aşağı kaydır
        }

        // Custom easing scroll animasyonu (ease-in-out)
        const startPosition = window.pageYOffset;
        const duration = 800; // 800ms animasyon
        let startTime: number | null = null;

        // Easing function: yavaş başla, hızlan, yavaşla
        const easeInOutCubic = (t: number): number => {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animation = (currentTime: number) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);

          const ease = easeInOutCubic(progress);
          window.scrollTo(0, startPosition + scrollAmount * ease);

          if (progress < 1) {
            requestAnimationFrame(animation);
          }
        };

        requestAnimationFrame(animation);
      }, 400);
    }
  }, [selectedGroup]);

  return (
    <div ref={sectionRef} className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Üretim Grubu Seçimi
        </h2>
        <p className="text-sm text-muted-foreground">
          Lütfen ilgilendiğiniz üretim grubunu seçiniz.
        </p>
      </div>

      <Controller
        name="uretimGrubu"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="space-y-3">
            <div className="flex justify-center mb-4">
              {selectedSektor && (
                <div className="relative w-full max-w-lg">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Üretim grubu ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base shadow-sm"
                  />
                </div>
              )}
            </div>

            {selectedSektor ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => {
                    const isSelected = field.value === group.name;

                    return (
                      <Card
                        key={group.name}
                        className={cn(
                          "group cursor-pointer transition-all duration-300",
                          "hover:shadow-md hover:border-primary/50",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                            : "hover:border-gray-300"
                        )}
                        onClick={() => field.onChange(group.name)}
                      >
                        <CardHeader className="p-0">
                          {/* Görsel Container - Aspect Ratio ile */}
                          <div className="relative w-full aspect-[4/3] rounded-t-lg overflow-hidden">
                            <Image
                              src={group.image}
                              alt={group.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className={cn(
                                "object-cover transition-all duration-500",
                                "group-hover:scale-105",
                                isSelected
                                  ? "grayscale-0"
                                  : field.value && !isSelected
                                  ? "grayscale group-hover:grayscale-0"
                                  : "grayscale-0"
                              )}
                            />

                            {/* Seçim overlay */}
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-primary" />
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base font-semibold leading-tight">
                              {group.name}
                            </CardTitle>
                            {isSelected && (
                              <Badge className="bg-primary hover:bg-primary/90 shrink-0">
                                <CheckCircle2 className="w-3 h-3" />
                              </Badge>
                            )}
                          </div>

                          <input
                            type="radio"
                            value={group.name}
                            checked={isSelected}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="sr-only"
                          />
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-full p-8 text-center border-2 border-dashed rounded-lg bg-muted/30">
                    <Search className="w-8 h-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                    <p className="text-muted-foreground font-medium">
                      "{searchQuery}" aramasıyla eşleşen üretim grubu
                      bulunamadı.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed rounded-lg bg-muted/50">
                <p className="text-muted-foreground">
                  Lütfen önce bir sektör seçiniz.
                </p>
              </div>
            )}

            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} className="mt-2" />
            )}
          </Field>
        )}
      />
    </div>
  );
};
