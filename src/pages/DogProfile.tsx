import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ImageGallery } from "@/components/ImageGallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, Share2, Calendar, Ruler } from "lucide-react";
import { toast } from "sonner";

interface Dog {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  personality: string[];
  story: string;
}

const DogProfile = () => {
  const { id } = useParams();
  const [dog, setDog] = useState<Dog | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDogData();
    }
  }, [id]);

  const fetchDogData = async () => {
    try {
      const { data: dogData, error: dogError } = await supabase
        .from("dogs")
        .select("*")
        .eq("id", id)
        .eq("status", "available")
        .single();

      if (dogError) throw dogError;

      const { data: imagesData, error: imagesError } = await supabase
        .from("dog_images")
        .select("image_url")
        .eq("dog_id", id)
        .order("display_order");

      if (imagesError) throw imagesError;

      setDog(dogData);
      setImages(imagesData?.map((img) => img.image_url) || []);
    } catch (error) {
      console.error("Error fetching dog:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Perro no encontrado</h1>
            <p className="text-muted-foreground mb-6">
              Lo sentimos, no pudimos encontrar este perrito.
            </p>
            <Button asChild>
              <Link to="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAdopt = () => {
    toast.success("¡Gracias por tu interés!", {
      description: "Por favor, visítanos en el Refugio Municipal de Curicó para conocer a " + dog.name,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Adopta a ${dog.name}`,
        text: dog.story,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado", {
        description: "El enlace ha sido copiado al portapapeles",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Volver
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Dog Info */}
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {dog.name}
              </h1>
              <p className="text-xl text-muted-foreground">{dog.breed}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Edad</p>
                    <p className="font-semibold">{dog.age}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Ruler className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tamaño</p>
                    <p className="font-semibold">{dog.size}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Personalidad
                </h2>
                <div className="flex flex-wrap gap-2">
                  {dog.personality.map((trait) => (
                    <Badge key={trait} variant="secondary" className="text-sm">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Su Historia</h2>
                <p className="text-muted-foreground leading-relaxed">{dog.story}</p>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full text-lg"
              onClick={handleAdopt}
            >
              <Heart className="mr-2 h-5 w-5" />
              Quiero Adoptarlo
            </Button>
          </div>

          {/* Image Gallery */}
          <div className="animate-fade-in md:sticky md:top-24 self-start">
            {images.length > 0 ? (
              <ImageGallery images={images} />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No hay imágenes disponibles
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              ¿Listo para Adoptar?
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Visítanos en el Refugio Municipal de Curicó para conocer a {dog.name} en persona.
              Nuestro equipo te ayudará con todo el proceso de adopción y responderá todas tus preguntas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={handleAdopt}>
                Iniciar Proceso de Adopción
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/">Ver Más Perritos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DogProfile;
