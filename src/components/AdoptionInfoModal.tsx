import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { MapPin, Mail, Navigation, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

interface AdoptionInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255, { message: "Email muy largo" }),
  name: z.string().trim().min(1, { message: "Nombre requerido" }).max(100, { message: "Nombre muy largo" }),
});

export const AdoptionInfoModal = ({ open, onOpenChange }: AdoptionInfoModalProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Refugio Municipal de Curicó address
  const shelterAddress = "Carmen 1290, Curicó, Región del Maule, Chile";
  const shelterCoords = { lat: -34.9826, lng: -71.2394 }; // Approximate coordinates for Curicó

  const getDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          const mapsUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${shelterCoords.lat},${shelterCoords.lng}`;
          window.open(mapsUrl, "_blank");
        },
        () => {
          // Fallback to just showing the destination
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shelterAddress)}`;
          window.open(mapsUrl, "_blank");
          toast.info("No se pudo obtener tu ubicación", {
            description: "Se abrirá el mapa con la dirección del refugio",
          });
        }
      );
    } else {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shelterAddress)}`;
      window.open(mapsUrl, "_blank");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    try {
      emailSchema.parse({ email, name });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-adoption-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          email: email.trim(),
          name: name.trim(),
          shelterAddress 
        }),
      });

      if (!response.ok) throw new Error("Error al enviar el correo");

      toast.success("¡Información enviada!", {
        description: "Revisa tu correo electrónico para más detalles",
      });
      
      setEmail("");
      setName("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Error al enviar la información", {
        description: "Por favor, inténtalo de nuevo más tarde",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Información sobre Adopción</DialogTitle>
          <DialogDescription>
            Todo lo que necesitas saber para visitar el refugio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Address Section */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Nuestra Dirección</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {shelterAddress}
                </p>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={getDirections}
              type="button"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Obtener Direcciones desde Mi Ubicación
            </Button>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Horario de Atención</h3>
                <p className="text-sm text-muted-foreground">
                  Lunes a Viernes: 9:00 AM - 5:00 PM
                </p>
                <p className="text-sm text-muted-foreground">
                  Sábados: 10:00 AM - 2:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* Email Form */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-start gap-3 mb-4">
              <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Recibir Información por Email</h3>
                <p className="text-sm text-muted-foreground">
                  Te enviaremos los detalles completos sobre el proceso de adopción
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tu Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ej: María González"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Tu Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Información"}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
