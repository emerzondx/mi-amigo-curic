import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDogForm = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [size, setSize] = useState("");
  const [story, setStory] = useState("");
  const [personality, setPersonality] = useState("");
  const [status, setStatus] = useState("available");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isEditing && user && isAdmin) {
      fetchDogData();
    }
  }, [isEditing, user, isAdmin]);

  const fetchDogData = async () => {
    try {
      const { data: dogData, error: dogError } = await supabase
        .from("dogs")
        .select("*")
        .eq("id", id)
        .single();

      if (dogError) throw dogError;

      setName(dogData.name);
      setBreed(dogData.breed);
      setAge(dogData.age);
      setGender(dogData.gender);
      setSize(dogData.size);
      setStory(dogData.story);
      setPersonality(dogData.personality.join(", "));
      setStatus(dogData.status);

      const { data: imagesData, error: imagesError } = await supabase
        .from("dog_images")
        .select("*")
        .eq("dog_id", id)
        .order("display_order");

      if (imagesError) throw imagesError;
      setExistingImages(
        (imagesData || []).map((img) => ({ id: img.id, url: img.image_url }))
      );
    } catch (error) {
      console.error("Error fetching dog:", error);
      toast.error("Error al cargar los datos del perrito");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    try {
      const { error } = await supabase.from("dog_images").delete().eq("id", imageId);
      if (error) throw error;
      setExistingImages(existingImages.filter((img) => img.id !== imageId));
      toast.success("Imagen eliminada");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Error al eliminar la imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const personalityArray = personality.split(",").map((p) => p.trim()).filter((p) => p);

      if (isEditing) {
        const { error: updateError } = await supabase
          .from("dogs")
          .update({
            name,
            breed,
            age,
            gender,
            size,
            story,
            personality: personalityArray,
            status,
          })
          .eq("id", id);

        if (updateError) throw updateError;
      } else {
        const { data: dogData, error: insertError } = await supabase
          .from("dogs")
          .insert({
            name,
            breed,
            age,
            gender,
            size,
            story,
            personality: personalityArray,
            status,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Upload images
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${dogData.id}/${Math.random()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("dog-images")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("dog-images")
            .getPublicUrl(fileName);

          await supabase.from("dog_images").insert({
            dog_id: dogData.id,
            image_url: publicUrl,
            display_order: i,
          });
        }
      }

      toast.success(isEditing ? "Perrito actualizado exitosamente" : "Perrito agregado exitosamente");
      navigate("/admin/dogs");
    } catch (error) {
      console.error("Error saving dog:", error);
      toast.error("Error al guardar el perrito");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? "Editar Perrito" : "Agregar Nuevo Perrito"}
            </h1>
          </div>
          <Button variant="outline" asChild>
            <Link to="/admin/dogs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la Lista
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información del Perrito</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed">Raza *</Label>
                  <Input
                    id="breed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Edad *</Label>
                  <Input
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ej: 2 años"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Género *</Label>
                  <Select value={gender} onValueChange={setGender} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Macho">Macho</SelectItem>
                      <SelectItem value="Hembra">Hembra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Tamaño *</Label>
                  <Select value={size} onValueChange={setSize} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pequeño">Pequeño</SelectItem>
                      <SelectItem value="Mediano">Mediano</SelectItem>
                      <SelectItem value="Grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="story">Historia *</Label>
                <Textarea
                  id="story"
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personality">Personalidad (separado por comas) *</Label>
                <Input
                  id="personality"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="Ej: Juguetón, Amigable, Energético"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="adopted">Adoptado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="images">Imágenes (6 máximo)</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isEditing && existingImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Imágenes Actuales</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt="Dog"
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => removeExistingImage(image.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Guardando..."
                  : isEditing
                  ? "Actualizar Perrito"
                  : "Agregar Perrito"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDogForm;
