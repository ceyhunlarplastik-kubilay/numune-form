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

const formSchema = z.object({
  ad: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  soyad: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir email adresi giriniz"),
  kategori: z.string().min(1, "Kategori seçiniz"),
  urunGrubu: z.string().min(1, "Ürün grubu seçiniz"),
  parcalar: z.array(z.string()).min(1, "En az bir parça seçiniz"),
});

type Schema = z.infer<typeof formSchema>;

export default function RequestForm() {
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<Schema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ad: "",
      soyad: "",
      email: "",
      kategori: "",
      urunGrubu: "",
      parcalar: [],
    },
  });

  const { data, isLoading, error } = useQuery<Record<string, string[]>>({
    queryKey: ["options"],
    queryFn: async () => {
      const res = await fetch("/api/get-options");
      if (!res.ok) throw new Error("Veri çekilemedi");
      return res.json();
    },
  });

  const options = data || {};
  const selectedKategori = form.watch("kategori");
  const selectedUrunGrubu = form.watch("urunGrubu");

  // Reset urunGrubu when kategori changes
  useEffect(() => {
    form.setValue("urunGrubu", "");
  }, [selectedKategori, form.setValue]);

  const handleSubmit = form.handleSubmit(async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  const kategoriList = [
    ...new Set(Object.keys(options).map((k) => k.split("__")[0])),
  ];

  const urunGrubuList = [
    ...new Set(
      Object.keys(options)
        .filter((k) => k.split("__")[0] === selectedKategori)
        .map((k) => k.split("__")[1])
    ),
  ];

  const parcalarList =
    options[`${selectedKategori}__${selectedUrunGrubu}`] || [];

  const stepsFields = [
    {
      fields: ["ad", "soyad", "email"],
      component: (
        <>
          <h2 className="mt-4 mb-1 font-bold text-2xl tracking-tight">
            Kişisel Bilgiler
          </h2>
          <p className="tracking-wide text-muted-foreground mb-5 text-wrap text-sm">
            İletişim bilgilerinizi girmenizi rica ederiz.
          </p>

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
                  placeholder="Email adresiniz"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </>
      ),
    },
    {
      fields: ["kategori", "urunGrubu"],
      component: (
        <>
          <h2 className="mt-4 mb-1 font-bold text-2xl tracking-tight">
            Ürün Seçimi
          </h2>
          <p className="tracking-wide text-muted-foreground mb-5 text-wrap text-sm">
            Lütfen ilgilendiğiniz ürün grubunu seçiniz.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="kategori"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="kategori">Kategori *</FieldLabel>
                  <select
                    {...field}
                    id="kategori"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-invalid={fieldState.invalid}
                  >
                    <option value="">Seçiniz</option>
                    {kategoriList.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="urunGrubu"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="urunGrubu">Ürün Grubu *</FieldLabel>
                  <select
                    {...field}
                    id="urunGrubu"
                    disabled={!selectedKategori}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-invalid={fieldState.invalid}
                  >
                    <option value="">Seçiniz</option>
                    {urunGrubuList.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
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
    {
      fields: ["parcalar"],
      component: (
        <>
          <h2 className="mt-4 mb-1 font-bold text-2xl tracking-tight">
            Parça Seçimi
          </h2>
          <p className="tracking-wide text-muted-foreground mb-5 text-wrap text-sm">
            Lütfen numune talep ettiğiniz parçaları seçiniz.
          </p>

          <Controller
            name="parcalar"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1">
                <FieldLabel>Parçalar *</FieldLabel>
                <div className="flex flex-col gap-2 mt-2">
                  {parcalarList.length > 0 ? (
                    parcalarList.map((p) => (
                      <label
                        key={p}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={p}
                          checked={field.value?.includes(p)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const currentValues = field.value || [];
                            if (checked) {
                              field.onChange([...currentValues, p]);
                            } else {
                              field.onChange(
                                currentValues.filter((val) => val !== p)
                              );
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        {p}
                      </label>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Lütfen önce ürün grubu seçiniz.
                    </p>
                  )}
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="flex flex-col items-center gap-4">
          {/* Simple spinner */}
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

  if (error) return <div>Hata: {error.message}</div>;

  if (success) {
    return (
      <div className="p-4 sm:p-6 md:p-8 w-full rounded-lg gap-2 border bg-white dark:bg-zinc-800 shadow-lg max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, stiffness: 300, damping: 25 }}
          className="h-full py-6 px-3"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 500,
              damping: 15,
            }}
            className="mb-4 flex justify-center border rounded-full w-fit mx-auto p-2 bg-green-100 dark:bg-green-900"
          >
            <Check className="size-8 text-green-600 dark:text-green-400" />
          </motion.div>
          <h2 className="text-center text-2xl text-pretty font-bold mb-2">
            Teşekkürler
          </h2>
          <p className="text-center text-lg text-pretty text-muted-foreground">
            Talebiniz başarıyla alındı, en kısa sürede size dönüş yapacağız.
          </p>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                setSuccess(false);
                form.reset();
              }}
              className="text-primary hover:underline"
            >
              Yeni talep oluştur
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
        className="flex flex-col p-3 md:p-6 lg:p-8 w-full min-w-full mx-auto rounded-lg max-w-5xl gap-2 border bg-white dark:bg-zinc-800 shadow-lg"
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
                {isSubmitting ? "Gönderiliyor..." : "Gönder"}
              </SubmitButton>
            </FormFooter>
          </MultiStepFormContent>
        </MultiStepFormProvider>
      </form>
    </div>
  );
}
