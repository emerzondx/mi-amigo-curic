import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
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

interface Dog {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  status: string;
}

const AdminDogList = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchDogs();
  }, []);

  const fetchDogs = async () => {
    try {
      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDogs(data || []);
    } catch (error) {
      console.error("Error fetching dogs:", error);
      toast.error("Error al cargar los perritos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase.from("dogs").delete().eq("id", deleteId);

      if (error) throw error;

      toast.success("Perrito eliminado exitosamente");
      setDogs(dogs.filter((dog) => dog.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting dog:", error);
      toast.error("Error al eliminar el perrito");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Gestionar Perritos
          </h2>
          <p className="text-muted-foreground">
            Ver, editar o eliminar perritos del refugio
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/dogs/new">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Perrito
          </Link>
        </Button>
      </div>

      {dogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No hay perritos registrados todavía
            </p>
            <Button asChild>
              <Link to="/admin/dogs/new">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Perrito
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dogs.map((dog) => (
            <Card key={dog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {dog.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {dog.breed} • {dog.age} • {dog.gender}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tamaño: {dog.size}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Estado:{" "}
                    <span
                      className={
                        dog.status === "available"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      {dog.status === "available" ? "Disponible" : "Adoptado"}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link to={`/admin/dogs/edit/${dog.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(dog.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El perrito será eliminado
              permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDogList;
