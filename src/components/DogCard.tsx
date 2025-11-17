import { Link } from "react-router-dom";
import { Dog } from "@/data/dogs";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";

interface DogCardProps {
  dog: Dog;
}

export const DogCard = ({ dog }: DogCardProps) => {
  const mainImage = dog.images[0] || '/dogs/placeholder-1.jpg';

  return (
    <Card className="group overflow-hidden border-border transition-all duration-300 hover:shadow-[var(--shadow-soft)] animate-fade-in">
      <Link to={`/perro/${dog.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={mainImage}
            alt={dog.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant="secondary" className="bg-card/95 backdrop-blur">
              {dog.gender === "Macho" ? "♂" : "♀"} {dog.gender}
            </Badge>
          </div>
        </div>
        <CardContent className="p-6">
          <h3 className="mb-2 text-2xl font-bold text-foreground">{dog.name}</h3>
          <p className="mb-3 text-muted-foreground">
            {dog.breed} • {dog.age}
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {dog.personality.slice(0, 3).map((trait) => (
              <Badge key={trait} variant="outline" className="border-primary/30 text-primary">
                {trait}
              </Badge>
            ))}
          </div>
          <p className="line-clamp-3 text-sm text-muted-foreground">{dog.story}</p>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button className="w-full" variant="default">
            Conocer a {dog.name}
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
};
