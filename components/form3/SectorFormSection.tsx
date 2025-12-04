/* "use client";
import { Controller } from "react-hook-form";
import Image from "next/image";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export const SectorFormSection = ({
  form,
  sektorList,
}: {
  form: any;
  sektorList: string[];
}) => {
  return (
    <>
      <h2 className="mt-4 mb-1 font-bold text-2xl tracking-tight">
        Sektör Seçimi
      </h2>
      <p className="tracking-wide text-muted-foreground mb-5 text-wrap text-sm">
        Lütfen ilgilendiğiniz sektörü seçiniz.
      </p>

      <Controller
        name="sektor"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1">
            <FieldLabel htmlFor="sektor">Sektör *</FieldLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {sektorList.map((sektor, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    field.value === sektor
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "hover:border-gray-300"
                  }`}
                  onClick={() => field.onChange(sektor)}
                >
                  <CardHeader className="pb-3">
                    <div className="relative w-full h-60 mb-3 rounded-md overflow-hidden group">
                      <Image
                        src={
                          (index / 2) % 2 === 0 ? "/gym.jpg" : "/furniture.jpg"
                        }
                        alt={sektor}
                        fill
                        className={`
                          object-cover transition-all duration-300 ease-in-out 
                          group-hover:scale-105
                          ${
                            !field.value // hiçbir seçim yoksa → renkli
                              ? "grayscale-0"
                              : field.value === sektor // seçili kart → renkli
                              ? "grayscale-0"
                              : "grayscale" // seçilmeyen → siyah-beyaz
                          }
                        `}
                      />
                    </div>

                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold">
                        {sektor}
                      </CardTitle>
                      {field.value === sektor && (
                        <Badge className="bg-primary">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Seçildi
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <input
                      type="radio"
                      value={sektor}
                      checked={field.value === sektor}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="sr-only"
                    />
                    <CardDescription>
                      {sektor} sektörü için numune talep edin
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  );
};
 */

"use client";
import { Controller } from "react-hook-form";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MoreHorizontal } from "lucide-react";

import { sectors, getSectorImage } from "@/constants/sectors";

interface SectorFormSectionProps {
  form: any;
  sektorList: string[];
}

export const SectorFormSection = ({
  form,
  sektorList,
}: SectorFormSectionProps) => {
  const OTHER_SECTOR_NAME = "Diğerleri";

  // API'dan gelen sektör listesini sectors array'indeki verilerle eşleştir
  const sectorData = sektorList
    .map((sectorName) => {
      const sectorInfo = sectors.find((s) => s.name === sectorName);
      return {
        name: sectorName,
        image: sectorInfo?.image || getSectorImage(sectorName),
      };
    })
    .filter((s) => s.image);

  return (
    <>
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Sektör Seçimi</h2>
        <p className="text-sm text-muted-foreground">
          Lütfen ilgilendiğiniz sektörü seçiniz. Diğer sektörler için
          "Diğerleri" seçeneğini kullanın.
        </p>
      </div>

      <Controller
        name="sektor"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="space-y-3">
            <FieldLabel className="text-base font-medium">Sektör *</FieldLabel>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Ana sektör kartları */}
              {sectorData.map((sector) => {
                const isSelected = field.value === sector.name;

                return (
                  <Card
                    key={sector.name}
                    className={cn(
                      "group cursor-pointer transition-all duration-300",
                      "hover:shadow-md hover:border-primary/50",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                        : "hover:border-gray-300"
                    )}
                    onClick={() => field.onChange(sector.name)}
                  >
                    <CardHeader className="pb-3">
                      {/* Görsel Container */}
                      <div className="relative w-full h-40 mb-3 rounded-md overflow-hidden">
                        <Image
                          src={sector.image}
                          alt={sector.name}
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
                          priority={sector.name === "Mobilya"}
                        />

                        {/* Seçim overlay */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                          </div>
                        )}
                      </div>

                      {/* Başlık ve Badge */}
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold">
                          {sector.name}
                        </CardTitle>
                        {isSelected && (
                          <Badge className="bg-primary hover:bg-primary/90">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Seçildi
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pb-4">
                      <input
                        type="radio"
                        value={sector.name}
                        checked={isSelected}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="sr-only"
                      />
                      <CardDescription className="line-clamp-2">
                        {sector.name} sektörü için numune talep edin
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Tek "Diğerleri" kartı */}
              <Card
                className={cn(
                  "group cursor-pointer transition-all duration-300",
                  "hover:shadow-md hover:border-gray-400",
                  field.value === OTHER_SECTOR_NAME
                    ? "border-gray-400 bg-gray-50 shadow-sm ring-2 ring-gray-300"
                    : "border-dashed border-2 border-gray-300 hover:border-gray-400",
                  "bg-gradient-to-br from-gray-50 to-gray-100"
                )}
                onClick={() => field.onChange(OTHER_SECTOR_NAME)}
              >
                <CardHeader className="pb-3">
                  {/* Görsel Container */}
                  <div className="relative w-full h-40 mb-3 rounded-md overflow-hidden">
                    <Image
                      src="/others.jpg"
                      alt="Diğer sektörler"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-all duration-500 group-hover:scale-105 opacity-80"
                    />

                    {/* "Diğerleri" overlay ikonu */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg">
                        <MoreHorizontal className="w-6 h-6 text-gray-700" />
                      </div>
                    </div>

                    {/* Seçim overlay */}
                    {field.value === OTHER_SECTOR_NAME && (
                      <div className="absolute inset-0 bg-gray-400/10 backdrop-blur-[1px] flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Başlık ve Badge */}
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold">
                      {OTHER_SECTOR_NAME}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (Diğer tüm sektörler)
                      </span>
                    </CardTitle>
                    {field.value === OTHER_SECTOR_NAME && (
                      <Badge className="bg-gray-600 hover:bg-gray-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Seçildi
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <input
                    type="radio"
                    value={OTHER_SECTOR_NAME}
                    checked={field.value === OTHER_SECTOR_NAME}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="sr-only"
                  />
                  <CardDescription className="line-clamp-2">
                    Listede yer almayan diğer sektörler için numune talep edin
                  </CardDescription>

                  {/* "Diğerleri" için ek bilgi */}
                  {field.value !== OTHER_SECTOR_NAME && (
                    <div className="mt-3 pt-3 border-t border-dashed border-gray-300">
                      <p className="text-xs text-muted-foreground">
                        Tıklayarak diğer sektörleri seçebilirsiniz
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} className="mt-2" />
            )}

            {/* Seçilen sektör bilgisi */}
            {field.value && (
              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium">
                  Seçilen sektör:{" "}
                  <span className="text-primary font-semibold">
                    {field.value}
                  </span>
                  {field.value === OTHER_SECTOR_NAME && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Diğer sektörler için)
                    </span>
                  )}
                </p>
                {field.value === OTHER_SECTOR_NAME && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Lütfen iletişim bilgilerinizi girerken, ilgilendiğiniz
                    spesifik sektörü açıklamada belirtiniz.
                  </p>
                )}
              </div>
            )}
          </Field>
        )}
      />
    </>
  );
};
