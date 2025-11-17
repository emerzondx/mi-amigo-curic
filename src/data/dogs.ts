export interface Dog {
  id: string;
  name: string;
  age: string;
  breed: string;
  size: string;
  gender: string;
  story: string;
  personality: string[];
  images: string[];
}

export const dogs: Dog[] = [
  {
    id: "luna",
    name: "Luna",
    age: "3 años",
    breed: "Mestiza Golden Retriever",
    size: "Mediana-Grande",
    gender: "Hembra",
    story: "Luna llegó a nuestro refugio hace 6 meses después de ser encontrada vagando por las calles de Curicó. A pesar de su difícil pasado, Luna ha demostrado ser una perra increíblemente cariñosa y llena de alegría. Le encanta jugar con pelotas, correr en espacios abiertos y recibir caricias. Es perfecta para una familia activa que pueda darle el amor y la atención que merece.",
    personality: ["Juguetona", "Cariñosa", "Energética", "Amigable con niños"],
    images: [
      "dog-luna-1.jpg",
      "dog-luna-2.jpg",
      "dog-luna-3.jpg",
      "dog-luna-4.jpg",
      "dog-luna-5.jpg",
      "dog-luna-6.jpg",
    ],
  },
  {
    id: "toby",
    name: "Toby",
    age: "2 años",
    breed: "Mestizo Border Collie",
    size: "Mediano",
    gender: "Macho",
    story: "Toby es un perro inteligente y activo que fue rescatado de una situación de abandono en el campo. Su energía y entusiasmo son contagiosos. Toby necesita una familia que pueda dedicarle tiempo para ejercicio diario y estimulación mental. Es excelente aprendiendo trucos nuevos y le encanta participar en actividades al aire libre. Sería ideal para alguien que disfrute del senderismo o actividades deportivas.",
    personality: ["Inteligente", "Activo", "Leal", "Obediente"],
    images: [
      "dog-toby-1.jpg",
      "dog-toby-2.jpg",
      "dog-toby-3.jpg",
      "dog-toby-4.jpg",
      "dog-toby-5.jpg",
      "dog-toby-6.jpg",
    ],
  },
  {
    id: "max",
    name: "Max",
    age: "6 meses",
    breed: "Mestizo Labrador",
    size: "Cachorro (Grande cuando adulto)",
    gender: "Macho",
    story: "Max es un cachorro adorable lleno de vida y curiosidad. Llegó al refugio junto a sus hermanos cuando tenía apenas 2 meses. Es un perrito juguetón que ama explorar y aprender cosas nuevas cada día. Max está en la edad perfecta para ser entrenado y adaptarse a su nuevo hogar. Necesita una familia paciente que pueda guiarlo en su crecimiento y enseñarle buenos hábitos desde pequeño.",
    personality: ["Curioso", "Juguetón", "Sociable", "Dulce"],
    images: [
      "dog-max-1.jpg",
      "dog-max-2.jpg",
      "dog-max-3.jpg",
      "dog-max-4.jpg",
      "dog-max-5.jpg",
      "dog-max-6.jpg",
    ],
  },
];
