"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Package,
  Layers,
  CheckCircle2,
} from "lucide-react";

export const PreviewFormSection = ({ form }: { form: any }) => {
  const values = form.getValues();
  const {
    sektor,
    uretimGrubu,
    urunler,
    firmaAdi,
    ad,
    soyad,
    email,
    telefon,
    adres,
  } = values;

  return (
    <div className="space-y-6">
      <div className="space-y-2 mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Önizleme ve Onay</h2>
        <p className="text-sm text-muted-foreground">
          Lütfen bilgilerinizi kontrol edip onaylayınız.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Talep Detayları */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-primary" />
              Talep Detayları
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Layers className="w-4 h-4" /> Sektör
              </p>
              <p className="font-medium text-lg text-foreground">{sektor}</p>
            </div>
            <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" /> Üretim Grubu
              </p>
              <p className="font-medium text-lg text-foreground">
                {uretimGrubu}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seçilen Ürünler */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Seçilen Ürünler ({urunler?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {urunler?.length > 0 ? (
              <div className="rounded-md border bg-background">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                          Ürün Adı
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {urunler.map((urun: string, index: number) => (
                        <tr
                          key={index}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">
                            {urun}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground italic p-4 text-center bg-muted/30 rounded-lg">
                Ürün seçilmedi.
              </p>
            )}
          </CardContent>
        </Card>

        {/* İletişim Bilgileri */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              İletişim Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Firma Adı
              </p>
              <p className="font-medium text-base">{firmaAdi}</p>
              <Separator className="mt-2" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" /> Yetkili Kişi
              </p>
              <p className="font-medium text-base">
                {ad} {soyad}
              </p>
              <Separator className="mt-2" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" /> E-posta
              </p>
              <p className="font-medium text-base">{email || "-"}</p>
              <Separator className="mt-2" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" /> Telefon
              </p>
              <p className="font-medium text-base">{telefon}</p>
              <Separator className="mt-2" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Adres
              </p>
              <p className="font-medium text-base">{adres || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
