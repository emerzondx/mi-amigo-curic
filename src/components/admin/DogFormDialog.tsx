import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface DogFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingDog?: any;
}

export function DogFormDialog({ isOpen, onClose, onSave, editingDog }: DogFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    breed: "",
    size: "",
    gender: "",
    story: "",
    personality: "",
    status: "available"
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);

  useEffect(() => {
    if (editingDog) {
      setFormData({
        name: editingDog.name || "",
        age: editingDog.age || "",
        breed: editingDog.breed || "",
        size: editingDog.size || "",
        gender: editingDog.gender || "",
        story: editingDog.story || "",
        personality: editingDog.personality?.join(", ") || "",
        status: editingDog.status || "available"
      });
      setExistingImages(editingDog.images || []);
    } else {
      setFormData({
        name: "",
        age: "",
        breed: "",
        size: "",
        gender: "",
        story: "",
        personality: "",
        status: "available"
      });
      setExistingImages([]);
    }
    setImageFiles([]);
  }, [editingDog, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const removeExistingImage = async (imageId: string) => {
    const { error } = await supabase
      .from('dog_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      toast.error("Error al eliminar la imagen");
    } else {
      setExistingImages(existingImages.filter(img => img.id !== imageId));
      toast.success("Imagen eliminada");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const personalityArray = formData.personality
        .split(",")
        .map(p => p.trim())
        .filter(p => p);

      let dogId = editingDog?.id;

      if (editingDog) {
        // Update existing dog
        const { error } = await supabase
          .from('dogs')
          .update({
            name: formData.name,
            age: formData.age,
            breed: formData.breed,
            size: formData.size,
            gender: formData.gender,
            story: formData.story,
            personality: personalityArray,
            status: formData.status
          })
          .eq('id', dogId);

        if (error) throw error;
      } else {
        // Create new dog
        const { data, error } = await supabase
          .from('dogs')
          .insert({
            name: formData.name,
            age: formData.age,
            breed: formData.breed,
            size: formData.size,
            gender: formData.gender,
            story: formData.story,
            personality: personalityArray,
            status: formData.status
          })
          .select()
          .single();

        if (error) throw error;
        dogId = data.id;
      }

      // Upload new images
      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${dogId}-${Date.now()}-${i}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('dog-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('dog-images')
            .getPublicUrl(filePath);

          const { error: imageError } = await supabase
            .from('dog_images')
            .insert({
              dog_id: dogId,
              image_url: publicUrl,
              display_order: existingImages.length + i
            });

          if (imageError) throw imageError;
        }
      }

      toast.success(editingDog ? "Perro actualizado" : "Perro agregado exitosamente");
      onSave();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el perro");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingDog ? "Editar Perro" : "Agregar Nuevo Perro"}</DialogTitle>
          <DialogDescription>
            {editingDog ? "Actualiza la información del perro" : "Completa los datos del nuevo perro"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Edad *</Label>
              <Input
                id="age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="ej. 2 años"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Raza *</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Tamaño *</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="ej. Mediano"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Género *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Macho">Macho</SelectItem>
                  <SelectItem value="Hembra">Hembra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="adopted">Adoptado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personality">Personalidad *</Label>
            <Input
              id="personality"
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
              placeholder="Separar con comas: Juguetón, Cariñoso, Activo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story">Historia *</Label>
            <Textarea
              id="story"
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              rows={5}
              required
            />
          </div>

          {existingImages.length > 0 && (
            <div className="space-y-2">
              <Label>Imágenes Actuales</Label>
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.image_url}
                      alt="Dog"
                      className="w-full aspect-square object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="images">
              {editingDog ? "Agregar Más Imágenes" : "Imágenes *"}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                required={!editingDog && existingImages.length === 0}
              />
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            {imageFiles.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {imageFiles.length} archivo(s) seleccionado(s)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : editingDog ? "Actualizar" : "Agregar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
