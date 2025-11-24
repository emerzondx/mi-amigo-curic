import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DogCard } from "@/components/DogCard";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Shield, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import { AdoptionInfoModal } from "@/components/AdoptionInfoModal";

interface Dog {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  personality: string[];
  story: string;
  image: string;
}

const Index = () => {
  const { isAdmin } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [adoptionModalOpen, setAdoptionModalOpen] = useState(false);

  useEffect(() => {
    fetchDogs();
  }, []);

  const fetchDogs = async () => {
    try {
      const { data: dogsData, error: dogsError } = await supabase
        .from("dogs")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (dogsError) throw dogsError;

      const dogsWithImages = await Promise.all(
        (dogsData || []).map(async (dog) => {
          const { data: imageData } = await supabase
            .from("dog_images")
            .select("image_url")
            .eq("dog_id", dog.id)
            .order("display_order")
            .limit(1)
            .single();

          return {
            id: dog.id,
            name: dog.name,
            breed: dog.breed,
            age: dog.age,
            gender: dog.gender,
            size: dog.size,
            personality: dog.personality,
            story: dog.story,
            image: imageData?.image_url || "",
          };
        })
      );

      setDogs(dogsWithImages);
    } catch (error) {
      console.error("Error fetching dogs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Admin Login */}
      <header className="fixed top-0 right-0 z-50 p-4">
        {isAdmin ? (
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin">
              <Shield className="mr-2 h-4 w-4" />
              Panel Admin
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link to="/auth">
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar Sesión
            </Link>
          </Button>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Refugio Municipal de Curicó</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Dale una Segunda Oportunidad a un Amigo Fiel
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Cada uno de nuestros perritos tiene una historia única y está esperando encontrar
              un hogar lleno de amor. Conoce sus historias y encuentra a tu compañero perfecto.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg" onClick={() => {
                document.getElementById("perros-section")?.scrollIntoView({ behavior: "smooth" });
              }}>
                <Heart className="mr-2 h-5 w-5" />
                Conocer a Nuestros Perritos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dogs Grid Section */}
      <section id="perros-section" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Perritos en Adopción
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cada perrito tiene su propia personalidad y está listo para llenar tu vida de alegría
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando perritos...</p>
            </div>
          ) : dogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No hay perritos disponibles para adopción en este momento
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {dogs.map((dog, index) => (
                <div
                  key={dog.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <DogCard dog={dog} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              ¿Listo para Cambiar una Vida?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              La adopción es un acto de amor que cambia dos vidas: la del perrito que adoptas
              y la tuya. Visítanos en el Refugio Municipal de Curicó y conoce a tu nuevo mejor amigo.
            </p>
            <Button 
              size="lg" 
              variant="default" 
              className="text-lg"
              onClick={() => setAdoptionModalOpen(true)}
            >
              Información sobre Adopción
            </Button>
            <AdoptionInfoModal 
              open={adoptionModalOpen} 
              onOpenChange={setAdoptionModalOpen} 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Address and Info */}
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Refugio Municipal de Curicó
              </h3>
              <p className="text-muted-foreground mb-2">
                Dando amor y hogar a los mejores amigos del hombre
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-foreground font-semibold">Dirección:</p>
                  <p className="text-muted-foreground">
                    Unnamed Road, Curicó<br />
                    Maule, Chile
                  </p>
                </div>
                <div>
                  <p className="text-foreground font-semibold">Teléfono:</p>
                  <a 
                    href="tel:+56939200250" 
                    className="text-primary hover:underline"
                  >
                    +56 9 3920 0250
                  </a>
                </div>
              </div>
            </div>
            
            {/* Map */}
            <div className="rounded-lg overflow-hidden shadow-lg h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3260.8747836547743!2d-71.2315135!3d-34.9954843!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x96645766196feb4d%3A0x4e6915a0aff745ee!2sCanil%20municipal!5e0!3m2!1sen!2scl!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación del Refugio Municipal de Curicó"
              />
            </div>
          </div>
          
          <div className="text-center mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © 2024 Refugio Municipal de Curicó. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
