"use client";
import { Controller } from "react-hook-form";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";

export const ProductionGroupFormSection = ({
  form,
  productionGroupList,
  selectedSektor,
}: {
  form: any;
  productionGroupList: string[];
  selectedSektor: string;
}) => {
  return (
    <>
      <h2 className="mt-4 mb-1 font-bold text-2xl tracking-tight">
        Üretim Grubu Seçimi
      </h2>
      <p className="tracking-wide text-muted-foreground mb-5 text-wrap text-sm">
        Lütfen ilgilendiğiniz üretim grubunu seçiniz.
      </p>

      <Controller
        name="uretimGrubu"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1">
            <FieldLabel htmlFor="productGroup">Üretim Grubu *</FieldLabel>
            {selectedSektor ? (
              <div className="grid grid-cols-1 gap-3 mt-2">
                {productionGroupList.map((grup) => (
                  <label
                    key={grup}
                    className={`
                          flex items-center p-4 border rounded-lg cursor-pointer transition-all
                          ${
                            field.value === grup
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                  >
                    <input
                      type="radio"
                      value={grup}
                      checked={field.value === grup}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-medium">{grup}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Lütfen önce bir sektör seçiniz.
              </p>
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  );
};
