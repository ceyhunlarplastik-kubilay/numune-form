"use client";
import { Controller } from "react-hook-form";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";

export const ProductsFormSection = ({
  form,
  selectedProductiongroup,
  selectedSector,
  productList,
}: {
  form: any;
  selectedProductiongroup: string;
  selectedSector: string;
  productList: string[];
}) => {
  return (
    <>
      <h2 className="mt-4 mb-1 font-bold text-2xl tracking-tight">
        Ürün Seçimi
      </h2>
      <p className="tracking-wide text-muted-foreground mb-5 text-wrap text-sm">
        Lütfen numune talep etmek istediğiniz ürünleri seçiniz.
      </p>

      <Controller
        name="urunler"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1">
            <FieldLabel>Ürünler *</FieldLabel>
            {selectedSector && selectedProductiongroup ? (
              <div className="space-y-2 mt-2 max-h-[400px] overflow-y-auto p-2">
                {productList.length > 0 ? (
                  productList.map((urun) => (
                    <label
                      key={urun}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={urun}
                        checked={field.value?.includes(urun)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const currentValues = field.value || [];
                          if (checked) {
                            field.onChange([...currentValues, urun]);
                          } else {
                            field.onChange(
                              currentValues.filter((val) => val !== urun)
                            );
                          }
                        }}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <span className="font-medium">{urun}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Bu üretim grubu için ürün bulunamadı.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Lütfen önce sektör ve üretim grubu seçiniz.
              </p>
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            {field.value && field.value.length > 0 && (
              <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                <p className="text-sm font-medium">
                  Seçilen ürün sayısı: {field.value.length}
                </p>
              </div>
            )}
          </Field>
        )}
      />
    </>
  );
};
