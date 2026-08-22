// Envio de correos via Resend (https://resend.com, capa gratuita).
// Mismo patron que Wompi: el codigo ya esta listo, solo falta que
// pegues tu RESEND_API_KEY en .env.local cuando crees tu cuenta.
export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Sin cuenta de correo configurada todavia: no se envia nada de
    // verdad. Se registra en el log del servidor para que puedas
    // seguir probando el flujo completo mientras configuras Resend.
    console.log(`[email pendiente de configurar] Para: ${to} | Asunto: ${subject}`);
    return { enviado: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "Bodega Dnavits <onboarding@resend.dev>",
      to,
      subject,
      html
    })
  });

  return { enviado: res.ok };
}
