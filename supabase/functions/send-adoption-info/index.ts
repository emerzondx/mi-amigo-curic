import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdoptionInfoRequest {
  name: string;
  email: string;
  shelterAddress: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, shelterAddress }: AdoptionInfoRequest = await req.json();

    // Validate inputs
    if (!name || !email || !shelterAddress) {
      return new Response(
        JSON.stringify({ error: "Faltan campos requeridos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate length limits
    if (name.length > 100 || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Los campos exceden la longitud máxima" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "Refugio Municipal de Curicó <onboarding@resend.dev>",
      to: [email],
      subject: "Información sobre Adopción - Refugio Municipal de Curicó",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">¡Hola ${name}!</h1>
          
          <p>Gracias por tu interés en adoptar uno de nuestros perritos. Estamos muy emocionados de que quieras darle un hogar a uno de nuestros amigos.</p>
          
          <h2 style="color: #1e40af; margin-top: 30px;">📍 Nuestra Ubicación</h2>
          <p><strong>${shelterAddress}</strong></p>
          <p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shelterAddress)}" style="color: #2563eb;">Ver en Google Maps</a></p>
          
          <h2 style="color: #1e40af; margin-top: 30px;">⏰ Horario de Atención</h2>
          <ul>
            <li><strong>Lunes a Viernes:</strong> 9:00 AM - 5:00 PM</li>
            <li><strong>Sábados:</strong> 10:00 AM - 2:00 PM</li>
            <li><strong>Domingos:</strong> Cerrado</li>
          </ul>
          
          <h2 style="color: #1e40af; margin-top: 30px;">📋 Proceso de Adopción</h2>
          <ol>
            <li><strong>Visítanos:</strong> Ven al refugio durante nuestro horario de atención</li>
            <li><strong>Conoce a los perritos:</strong> Interactúa con ellos y encuentra tu match perfecto</li>
            <li><strong>Entrevista:</strong> Nuestro equipo te hará algunas preguntas para asegurar una buena adopción</li>
            <li><strong>Documentación:</strong> Completa los formularios de adopción</li>
            <li><strong>¡Lleva tu nuevo amigo a casa!</strong></li>
          </ol>
          
          <h2 style="color: #1e40af; margin-top: 30px;">📝 Qué Debes Traer</h2>
          <ul>
            <li>Cédula de identidad o RUT</li>
            <li>Comprobante de domicilio</li>
            <li>Collar y correa (si ya tienes)</li>
            <li>Mucho amor y paciencia ❤️</li>
          </ul>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <h3 style="color: #1e40af; margin-top: 0;">💙 Compromiso de Adopción</h3>
            <p style="margin-bottom: 0;">Al adoptar, te comprometes a cuidar, proteger y amar a tu nuevo compañero. Todos nuestros perritos están esterilizados, vacunados y desparasitados.</p>
          </div>
          
          <p style="margin-top: 30px;">Si tienes alguna pregunta, no dudes en visitarnos. ¡Esperamos verte pronto!</p>
          
          <p style="margin-top: 20px;">
            <strong>Refugio Municipal de Curicó</strong><br>
            <em>Dando amor y hogar a los mejores amigos del hombre</em>
          </p>
        </div>
      `,
    });

    console.log("Adoption info email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-adoption-info function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
