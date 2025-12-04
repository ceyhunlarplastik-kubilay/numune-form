// components/RequestForm.tsx
"use client";
import { useState, useEffect } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  FormHeader,
  FormFooter,
  StepFields,
  PreviousButton,
  NextButton,
  SubmitButton,
  MultiStepFormContent,
} from "@/components/multi-step-viewer";
import { MultiStepFormProvider } from "@/hooks/use-multi-step-viewer";

import { SectorFormSection } from "@/components/form3/SectorFormSection";
import { ProductionGroupFormSection } from "@/components/form3/ProductionGroupFormSection";
import { ProductsFormSection } from "@/components/form3/ProductsFormSection";

// Form şeması
const formSchema = z.object({
  // Bölüm 1: Sektör
  sektor: z.string().min(1, "Sektör seçiniz"),

  // Bölüm 2: Üretim grubu
  uretimGrubu: z.string().min(1, "Üretim grubu seçiniz"),

  // Bölüm 3: Ürünler (çoklu seçim)
  urunler: z.array(z.string()).min(1, "En az bir ürün seçiniz"),

  // Bölüm 4: İletişim bilgileri
  firmaAdi: z.string().min(2, "Firma adı en az 2 karakter olmalıdır"),
  ad: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  soyad: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir email adresi giriniz"),
  telefon: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  adres: z.string().min(5, "Adres en az 5 karakter olmalıdır"),
});

type Schema = z.infer<typeof formSchema>;

// Google Sheets'ten gelecek veri yapısı
type OptionsData = {
  [key: string]: string[]; // Anahtar: "Sektor__UretimGrubu", Değer: Ürün listesi
};

export default function RequestForm3() {
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<Schema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firmaAdi: "",
      ad: "",
      soyad: "",
      email: "",
      telefon: "",
      adres: "",
      sektor: "",
      uretimGrubu: "",
      urunler: [],
    },
  });

  // Google Sheets verilerini çek
  const { data, isLoading, error } = useQuery<OptionsData>({
    queryKey: ["sektor-urunler"],
    queryFn: async () => {
      const res = await fetch("/api/get-options");
      if (!res.ok) throw new Error("Veri çekilemedi");
      return res.json();
    },
  });
  console.log(data);

  const options = data || {};
  const selectedSektor = form.watch("sektor");
  const selectedUretimGrubu = form.watch("uretimGrubu");

  // Sektör değiştiğinde üretim grubunu sıfırla
  useEffect(() => {
    if (selectedSektor) {
      form.setValue("uretimGrubu", "");
      form.setValue("urunler", []);
    }
  }, [selectedSektor, form]);

  // Üretim grubu değiştiğinde ürünleri sıfırla
  useEffect(() => {
    if (selectedUretimGrubu) {
      form.setValue("urunler", []);
    }
  }, [selectedUretimGrubu, form]);

  // Sektör listesini oluştur
  const sektorList = [
    ...new Set(Object.keys(options).map((key) => key.split("__")[0])),
  ];

  // Seçilen sektöre ait üretim gruplarını oluştur
  const uretimGrubuList = [
    ...new Set(
      Object.keys(options)
        .filter((key) => key.split("__")[0] === selectedSektor)
        .map((key) => key.split("__")[1])
    ),
  ];

  // Seçilen sektör ve üretim grubuna ait ürünleri al
  const urunlerList =
    selectedSektor && selectedUretimGrubu
      ? options[`${selectedSektor}__${selectedUretimGrubu}`] || []
      : [];

  const handleSubmit = form.handleSubmit(async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tarih: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Gönderim başarısız");

      setSuccess(true);
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Form gönderilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  });

  // Form adımları
  const stepsFields = [
    {
      // Bölüm 1: Sektör seçimi
      fields: ["sektor"],
      component: <SectorFormSection form={form} sektorList={sektorList} />,
    },
    {
      // Bölüm 2: Üretim grubu seçimi
      fields: ["uretimGrubu"],
      component: (
        <ProductionGroupFormSection
          form={form}
          productionGroupList={uretimGrubuList}
          selectedSektor={selectedSektor}
        />
      ),
    },
    {
      // Bölüm 3: Ürün seçimi (çoklu)
      fields: ["urunler"],
      component: (
        <ProductsFormSection
          form={form}
          selectedProductiongroup={selectedUretimGrubu}
          selectedSector={selectedSektor}
          productList={urunlerList}
        />
      ),
    },
    {
      // Bölüm 4: İletişim bilgileri
      fields: ["firmaAdi", "ad", "soyad", "email", "telefon", "adres"],
      component: (
        <>
          <h2 className="mt-4 mb-1 font-bold text-2xl tracking-tight">
            İletişim Bilgileri
          </h2>
          <p className="tracking-wide text-muted-foreground mb-5 text-wrap text-sm">
            Lütfen iletişim bilgilerinizi giriniz.
          </p>

          <div className="space-y-4">
            <Controller
              name="firmaAdi"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="firmaAdi">Firma Adı *</FieldLabel>
                  <Input
                    {...field}
                    id="firmaAdi"
                    type="text"
                    placeholder="Firma adınız"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="ad"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="ad">Ad *</FieldLabel>
                    <Input
                      {...field}
                      id="ad"
                      type="text"
                      placeholder="Adınız"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="soyad"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="soyad">Soyad *</FieldLabel>
                    <Input
                      {...field}
                      id="soyad"
                      type="text"
                      placeholder="Soyadınız"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="email">Email *</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="ornek@firma.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="telefon"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="telefon">Telefon *</FieldLabel>
                  <Input
                    {...field}
                    id="telefon"
                    type="tel"
                    placeholder="5XX XXX XX XX"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="adres"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="adres">Adres *</FieldLabel>
                  <textarea
                    {...field}
                    id="adres"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Firma adresiniz"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#ccb36e]/30 border-t-[#ccb36e] rounded-full animate-spin"></div>
          <div className="text-center">
            <h3 className="font-medium text-zinc-700 dark:text-zinc-200 mb-1">
              Yükleniyor
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Form bilgileri hazırlanıyor
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-700 font-medium mb-2">Hata oluştu</h3>
        <p className="text-red-600 text-sm">{error.message}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-4 sm:p-6 md:p-8 w-full rounded-lg gap-2 border bg-white dark:bg-zinc-800 shadow-lg max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="h-full py-6 px-3"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3,
              type: "spring",
            }}
            className="mb-4 flex justify-center border rounded-full w-fit mx-auto p-2 bg-green-100 dark:bg-green-900"
          >
            <Check className="size-8 text-green-600 dark:text-green-400" />
          </motion.div>
          <h2 className="text-center text-2xl text-pretty font-bold mb-2">
            Numune Talebiniz Alındı!
          </h2>
          <p className="text-center text-lg text-pretty text-muted-foreground">
            En kısa sürede sizinle iletişime geçeceğiz. Teşekkür ederiz.
          </p>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                setSuccess(false);
                form.reset();
              }}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Yeni Talep Oluştur
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col p-3 md:p-6 lg:p-8 w-full min-w-full mx-auto rounded-lg max-w-7xl gap-2 border bg-white dark:bg-zinc-800 shadow-lg"
      >
        <MultiStepFormProvider
          stepsFields={stepsFields}
          onStepValidation={async (step) => {
            const isValid = await form.trigger(step.fields as any);
            return isValid;
          }}
        >
          <MultiStepFormContent>
            <FormHeader />
            <StepFields />
            <FormFooter>
              <PreviousButton>
                <ChevronLeft className="w-4 h-4" />
                Geri
              </PreviousButton>
              <NextButton>
                İleri <ChevronRight className="w-4 h-4" />
              </NextButton>
              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Gönderiliyor..." : "Numune Talebi Gönder"}
              </SubmitButton>
            </FormFooter>
          </MultiStepFormContent>
        </MultiStepFormProvider>
      </form>
    </div>
  );
}
