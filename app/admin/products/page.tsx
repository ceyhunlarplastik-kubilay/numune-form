"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Upload, X } from "lucide-react";
import { upload } from "@vercel/blob/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface Product {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  slug?: string;
}

interface Assignment {
  sectorId: string;
  productionGroupId: string;
  sectorName?: string;
  groupName?: string;
}

interface Sector {
  _id: string;
  name: string;
}

interface ProductionGroup {
  _id: string;
  name: string;
}

/* -------------------------------------------------------------------------- */
/*                                  FETCHERS                                  */
/* -------------------------------------------------------------------------- */

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Ürünler yüklenemedi");
  return res.json();
}

async function fetchSectors(): Promise<Sector[]> {
  const res = await fetch("/api/catalog/sectors");
  if (!res.ok) throw new Error("Sektörler yüklenemedi");
  return res.json();
}

async function fetchGroups(
  sectorId: string
): Promise<{ groups: { groupId: string; name: string }[] }> {
  const res = await fetch(`/api/catalog/options?sectorId=${sectorId}`);
  if (!res.ok) throw new Error("Üretim grupları yüklenemedi");
  return res.json();
}

async function fetchProductAssignments(productId: string) {
  const res = await fetch(`/api/productAssignments?productId=${productId}`);
  if (!res.ok) throw new Error("Atamalar yüklenemedi");
  return res.json();
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export default function ProductsAdminPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Blob states
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });

  const [assignments, setAssignments] = useState<Assignment[]>([
    { sectorId: "", productionGroupId: "" },
  ]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* ---------------------------- QUERIES ---------------------------- */

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors"],
    queryFn: fetchSectors,
  });

  /* --------------------------- MUTATIONS --------------------------- */

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      imageUrl: string;
      assignments: Assignment[];
    }) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Ürün oluşturulamadı");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Ürün başarıyla oluşturuldu");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      productId: string;
      name: string;
      description: string;
      imageUrl: string;
      assignments: Assignment[];
    }) => {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Ürün güncellenemedi");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Ürün başarıyla güncellendi");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
      setEditingProduct(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (product: Product) => {
      // 1. Delete image if exists
      if (product.imageUrl) {
        try {
          await fetch(
            `/api/products/upload?url=${encodeURIComponent(product.imageUrl)}`,
            {
              method: "DELETE",
            }
          );
        } catch (e) {
          console.error("Image deletion failed", e);
        }
      }

      // 2. Delete product
      const res = await fetch(`/api/products?productId=${product._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Ürün silinemedi");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Ürün silindi");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeletingProduct(null);
    },
    onError: () => {
      toast.error("Silme işlemi başarısız");
    },
  });

  /* --------------------------- HELPERS --------------------------- */

  const resetForm = () => {
    setFormData({ name: "", description: "", imageUrl: "" });
    setAssignments([{ sectorId: "", productionGroupId: "" }]);
    setSelectedFile(null);
    setPreviewUrl("");
    setOriginalImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openEditDialog = async (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
    });
    setPreviewUrl(product.imageUrl || "");
    setOriginalImageUrl(product.imageUrl || null);
    setSelectedFile(null);

    // Fetch existing assignments
    try {
      const data = await fetchProductAssignments(product._id);
      const existingAssignments = data.assignments.map((a: any) => ({
        sectorId: a.sectorId?._id || a.sectorId,
        productionGroupId: a.productionGroupId?._id || a.productionGroupId,
      }));
      setAssignments(
        existingAssignments.length > 0
          ? existingAssignments
          : [{ sectorId: "", productionGroupId: "" }]
      );
    } catch {
      setAssignments([{ sectorId: "", productionGroupId: "" }]);
    }

    setEditingProduct(product);
  };

  const handleSubmit = async () => {
    // Filter out incomplete assignments
    const validAssignments = assignments.filter(
      (a) => a.sectorId && a.productionGroupId
    );

    if (!formData.name.trim()) {
      toast.error("Ürün adı zorunludur");
      return;
    }

    if (validAssignments.length === 0) {
      toast.error("En az bir sektör ve üretim grubu seçilmelidir");
      return;
    }

    let finalImageUrl = formData.imageUrl;

    // 1. Upload logic (if file selected)
    if (selectedFile) {
      setUploading(true);
      try {
        const newBlob = await upload(selectedFile.name, selectedFile, {
          access: "public",
          handleUploadUrl: "/api/products/upload",
        });
        finalImageUrl = newBlob.url;
      } catch (error) {
        console.error("Upload failed", error);
        toast.error("Görsel yüklenemedi");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    // 2. CHECK & DELETE OLD IMAGE
    // If we are editing, and there was an original image,
    // and the new finalImageUrl is different (either empty or a new uploaded one)
    if (
      editingProduct &&
      originalImageUrl &&
      originalImageUrl !== finalImageUrl
    ) {
      try {
        await fetch(
          `/api/products/upload?url=${encodeURIComponent(originalImageUrl)}`,
          {
            method: "DELETE",
          }
        );
        console.log("Old image deleted:", originalImageUrl);
      } catch (error) {
        console.error("Failed to delete old image:", error);
        // We continue even if delete fails, to not block the product update
      }
    }

    // 3. Mutation logic
    if (editingProduct) {
      updateMutation.mutate({
        productId: editingProduct._id,
        ...formData,
        imageUrl: finalImageUrl,
        assignments: validAssignments,
      });
    } else {
      createMutation.mutate({
        ...formData,
        imageUrl: finalImageUrl,
        assignments: validAssignments,
      });
    }
  };

  const addAssignment = () => {
    setAssignments([...assignments, { sectorId: "", productionGroupId: "" }]);
  };

  const removeAssignment = (index: number) => {
    if (assignments.length > 1) {
      setAssignments(assignments.filter((_, i) => i !== index));
    }
  };

  const updateAssignment = (
    index: number,
    field: keyof Assignment,
    value: string
  ) => {
    const updated = [...assignments];
    updated[index] = { ...updated[index], [field]: value };

    // Reset productionGroupId if sectorId changes
    if (field === "sectorId") {
      updated[index].productionGroupId = "";
    }

    setAssignments(updated);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    setSelectedFile(file);

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* --------------------------- RENDER --------------------------- */

  const isDialogOpen = isCreateOpen || !!editingProduct;
  const isPending =
    createMutation.isPending || updateMutation.isPending || uploading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
          <p className="text-muted-foreground">
            Ürünleri oluşturun, düzenleyin ve silin.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Ürün
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ürünler</CardTitle>
          <CardDescription>
            Toplam {products.length} ürün bulundu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Henüz ürün eklenmemiş.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Görsel</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {product.description || "-"}
                    </TableCell>
                    <TableCell>
                      {product.imageUrl ? (
                        <div className="flex items-center space-x-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-md border"
                          />
                        </div>
                      ) : (
                        <Badge variant="secondary">Yok</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(product)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setDeletingProduct(product)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingProduct(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
            </DialogTitle>
            <DialogDescription>
              Ürün bilgilerini ve hangi sektör/üretim gruplarına ait olduğunu
              belirleyin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Ürün Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Örn: PVC Boru"
                />
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ürün açıklaması..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Ürün Görseli</Label>
                <div className="mt-2 space-y-4">
                  {previewUrl ? (
                    <div className="relative w-full max-w-xs aspect-video bg-muted rounded-lg overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full max-w-xs aspect-video bg-muted/50 rounded-lg border border-dashed">
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Görsel yüklemek için seçin
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                    {uploading && (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Assignments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Sektör / Üretim Grubu Atamaları *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAssignment}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Başka Ekle
                </Button>
              </div>

              {assignments.map((assignment, index) => (
                <AssignmentRow
                  key={index}
                  assignment={assignment}
                  sectors={sectors}
                  index={index}
                  onUpdate={updateAssignment}
                  onRemove={removeAssignment}
                  canRemove={assignments.length > 1}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingProduct(null);
                resetForm();
              }}
            >
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Yükleniyor...
                </>
              ) : isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}

              {editingProduct ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={() => setDeletingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürünü sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingProduct?.name}</strong> ürünü ve tüm sektör/grup
              atamaları kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingProduct && deleteMutation.mutate(deletingProduct)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Sil"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           ASSIGNMENT ROW COMPONENT                         */
/* -------------------------------------------------------------------------- */

interface AssignmentRowProps {
  assignment: Assignment;
  sectors: Sector[];
  index: number;
  onUpdate: (index: number, field: keyof Assignment, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

function AssignmentRow({
  assignment,
  sectors,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: AssignmentRowProps) {
  // Fetch groups for selected sector
  const { data: groupsData } = useQuery({
    queryKey: ["groups", assignment.sectorId],
    queryFn: () => fetchGroups(assignment.sectorId),
    enabled: !!assignment.sectorId,
  });

  const groups = groupsData?.groups || [];

  return (
    <div className="flex items-end gap-3 p-3 border rounded-lg bg-muted/30">
      <div className="flex-1">
        <Label className="text-xs">Sektör</Label>
        <Select
          value={assignment.sectorId}
          onValueChange={(val) => onUpdate(index, "sectorId", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sektör seç..." />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((sector) => (
              <SelectItem key={sector._id} value={sector._id}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label className="text-xs">Üretim Grubu</Label>
        <Select
          value={assignment.productionGroupId}
          onValueChange={(val) => onUpdate(index, "productionGroupId", val)}
          disabled={!assignment.sectorId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Grup seç..." />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.groupId} value={group.groupId}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
