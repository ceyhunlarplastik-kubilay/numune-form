"use client";

import { Controller } from "react-hook-form";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

import { Field, FieldError } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

import { FormSectionStickyWrapper } from "@/components/form3/form-section/FormSectionStickyWrapper";
import { getSectorImage } from "@/constants/sectors";

interface SectorFormSectionProps {
  form: any;
  sectors: { _id: string; name: string; image: string }[];
}

export const SectorFormSection = ({
  form,
  sectors,
}: SectorFormSectionProps) => {
  const OTHER_NAME = "Diğerleri";
  const sectionRef = useRef<HTMLDivElement>(null);

  // Normalize sectors
  const sectorData = sectors
    .map((s) => ({
      id: s._id,
      name: s.name,
      image:
        sectors.find((x) => x.name === s.name)?.image || getSectorImage(s.name),
    }))
    .filter((x) => !!x.image);

  const selectedSector = form.watch("sektor");

  // Scroll down when a sector is selected
  useEffect(() => {
    if (!selectedSector || !sectionRef.current) return;

    const el = sectionRef.current;

    setTimeout(() => {
      const r = el.getBoundingClientRect();
      const offset = r.bottom - window.innerHeight + 200;

      window.scrollTo({
        top: window.scrollY + Math.max(offset, 400),
        behavior: "smooth",
      });
    }, 300);
  }, [selectedSector]);

  return (
    <FormSectionStickyWrapper
      title="Sektör Seçimi"
      description="Lütfen ilgilendiğiniz sektörü seçiniz."
    >
      <div ref={sectionRef}>
        <Controller
          name="sektor"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-4">
              {/* SEKTÖRLER GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectorData.map((sector) => {
                  const isSelected = field.value === sector.id;

                  return (
                    <Card
                      key={sector.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        "hover:shadow-md hover:border-primary/50",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/30"
                          : ""
                      )}
                      onClick={() => field.onChange(sector.id)}
                    >
                      <CardHeader>
                        <div className="relative w-full h-40 rounded-md overflow-hidden">
                          <Image
                            src={sector.image}
                            alt={sector.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                              <CheckCircle2 className="text-primary w-10 h-10" />
                            </div>
                          )}
                        </div>

                        <CardTitle className="flex justify-between items-center">
                          {sector.name}
                          {isSelected && <Badge>Seçildi</Badge>}
                        </CardTitle>
                      </CardHeader>

                      <CardContent>
                        <CardDescription>
                          {sector.name} sektörü için numune talep edin.
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* DİĞERLERİ */}
                <Card
                  key="other"
                  className={cn(
                    "cursor-pointer border-dashed border-2 transition-all",
                    "hover:shadow-md hover:border-primary/50",
                    field.value === "others"
                      ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/30"
                      : ""
                  )}
                  onClick={() => field.onChange("others")}
                >
                  <CardHeader>
                    <div className="relative w-full h-40 rounded-md overflow-hidden">
                      <Image
                        src="/others.jpg"
                        alt="Diğerleri"
                        fill
                        className="object-cover opacity-80"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <CardTitle>Diğerleri</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <CardDescription>
                      Listede yer almayan sektörler
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </FormSectionStickyWrapper>
  );
};
