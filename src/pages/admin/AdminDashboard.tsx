import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dog, PlusCircle, Heart, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface Stats {
  totalDogs: number;
  availableDogs: number;
  adoptedDogs: number;
  recentDogs: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalDogs: 0,
    availableDogs: 0,
    adoptedDogs: 0,
    recentDogs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: allDogs, error: allError } = await supabase
        .from("dogs")
        .select("id, status, created_at");

      if (allError) throw allError;

      const total = allDogs?.length || 0;
      const available = allDogs?.filter((d) => d.status === "available").length || 0;
      const adopted = allDogs?.filter((d) => d.status === "adopted").length || 0;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recent =
        allDogs?.filter((d) => new Date(d.created_at!) > sevenDaysAgo).length || 0;

      setStats({
        totalDogs: total,
        availableDogs: available,
        adoptedDogs: adopted,
        recentDogs: recent,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total de Perritos",
      value: stats.totalDogs,
      icon: Dog,
      color: "text-primary",
    },
    {
      title: "Disponibles",
      value: stats.availableDogs,
      icon: Heart,
      color: "text-green-500",
    },
    {
      title: "Adoptados",
      value: stats.adoptedDogs,
      icon: Heart,
      color: "text-blue-500",
    },
    {
      title: "Nuevos (7 días)",
      value: stats.recentDogs,
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Bienvenido al Panel de Administración
        </h2>
        <p className="text-muted-foreground">
          Gestiona los perritos del Refugio Municipal de Curicó
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                Agregar Nuevo Perrito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Registra un nuevo perrito que llegó al refugio
              </p>
              <Button className="w-full" asChild>
                <Link to="/admin/dogs/new">Agregar Perrito</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dog className="h-5 w-5 text-primary" />
                Gestionar Perritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Ver, editar o eliminar perritos existentes
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/admin/dogs">Ver Lista Completa</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Ver Sitio Público
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Vista previa del sitio público de adopciones
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/">Ir al Sitio</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
