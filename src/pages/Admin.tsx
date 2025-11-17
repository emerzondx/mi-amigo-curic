import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, LogOut, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { DogFormDialog } from "@/components/admin/DogFormDialog";

interface Dog {
  id: string;
  name: string;
  age: string;
  breed: string;
  size: string;
  gender: string;
  story: string;
  personality: string[];
  status: string;
  images: { id: string; image_url: string; display_order: number }[];
}

export default function Admin() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [loadingDogs, setLoadingDogs] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("No tienes permisos de administrador");
      navigate("/auth");
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchDogs();
    }
  }, [isAdmin]);

  const fetchDogs = async () => {
    setLoadingDogs(true);
    const { data: dogsData, error } = await supabase
      .from('dogs')
      .select(`
        *,
        dog_images (id, image_url, display_order)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Error al cargar los perros");
      console.error(error);
    } else {
      setDogs(dogsData.map(dog => ({
        ...dog,
        images: dog.dog_images || []
      })));
    }
    setLoadingDogs(false);
  };

  const handleDelete = async (dogId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este perro?")) {
      return;
    }

    const { error } = await supabase
      .from('dogs')
      .delete()
      .eq('id', dogId);

    if (error) {
      toast.error("Error al eliminar el perro");
      console.error(error);
    } else {
      toast.success("Perro eliminado exitosamente");
      fetchDogs();
    }
  };

  const handleEdit = (dog: Dog) => {
    setEditingDog(dog);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingDog(null);
  };

  const handleSaveSuccess = () => {
    fetchDogs();
    handleDialogClose();
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Panel de Administración</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              Ver Sitio
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Gestión de Perros</h2>
            <p className="text-muted-foreground">Administra los perros disponibles para adopción</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Perro
          </Button>
        </div>

        {loadingDogs ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando perros...</p>
          </div>
        ) : dogs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No hay perros registrados</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Perro
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dogs.map((dog) => (
              <Card key={dog.id} className="overflow-hidden">
                {dog.images[0] && (
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={dog.images[0].image_url}
                      alt={dog.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{dog.name}</CardTitle>
                      <CardDescription>
                        {dog.breed} • {dog.age}
                      </CardDescription>
                    </div>
                    <Badge variant={dog.status === 'available' ? 'default' : 'secondary'}>
                      {dog.status === 'available' ? 'Disponible' : 'Adoptado'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {dog.story}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(dog)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(dog.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <DogFormDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSave={handleSaveSuccess}
        editingDog={editingDog}
      />
    </div>
  );
}
