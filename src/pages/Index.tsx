import { dogs } from "@/data/dogs";
import { DogCard } from "@/components/DogCard";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const { isAdmin } = useAuth();
  const [dogs, setDogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDogs();
  }, []);

  const fetchDogs = async () => {
    const { data, error } = await supabase
      .from('dogs')
      .select(`
        *,
        dog_images (id, image_url, display_order)
      `)
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dogs:', error);
    } else {
      setDogs(data.map(dog => ({
        ...dog,
        images: dog.dog_images?.map((img: any) => img.image_url) || []
      })));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
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
            <Button size="lg" variant="default" className="text-lg">
              Información sobre Adopción
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Refugio Municipal de Curicó
            </h3>
            <p className="text-muted-foreground">
              Dando amor y hogar a los mejores amigos del hombre
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Refugio Municipal de Curicó. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
