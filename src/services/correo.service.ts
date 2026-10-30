import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";

interface DatosCorreoReporte {
  fechaReporte: string;
  totalMensajes: number;
  totalConsultas: number;
  totalRespuestas: number;
  totalConversaciones: number;
  sinInteracciones?: boolean;
}

export function generarHtmlCorreoReporte(
datos: DatosCorreoReporte
): string {
const {
fechaReporte,
totalMensajes,
totalConsultas,
totalRespuestas,
totalConversaciones,
sinInteracciones = false,
} = datos;


const fechaFormateada = fechaReporte
? new Intl.DateTimeFormat("es-CO", {
timeZone: "America/Bogota",
day: "2-digit",
month: "long",
year: "numeric",
}).format(new Date(`${fechaReporte}T12:00:00Z`))
: "No especificada";


const mensajeEstado = sinInteracciones
? "Durante la fecha reportada no se registraron interacciones."
: "Se adjunta el archivo Excel con el detalle de las interacciones registradas durante la fecha reportada.";

return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reporte diario MILE - EMCALI</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f1f7;font-family:Arial,Helvetica,sans-serif;color:#333333;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
style="background-color:#f4f1f7;padding:30px 12px;">
<tr>
<td align="center">

<table role="presentation" width="600" cellpadding="0" cellspacing="0"
style="width:100%;max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;">

<tr>
<td style="background-color:#3b1648;padding:30px 32px;text-align:center;">
<p style="margin:0;color:#d9bce5;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
Reporte de usabilidad asistente NOVA
</p>
<h1 style="margin:12px 0 6px;color:#ffffff;font-size:27px;">
MILE | EMCALI
</h1>

<p style="margin:0;color:#f0e5f4;font-size:14px;">
Informe diario de interacciones
</p>
</td>
</tr>
<tr>
<td style="padding:32px;">
<p style="margin:0 0 18px;font-size:15px;line-height:1.7;">
Estimado equipo:
</p>
<p style="margin:0 0 22px;font-size:15px;line-height:1.7;">
Se comparte el reporte diario de usabilidad del asistente virtual
<strong>MILE</strong>, correspondiente a la campaña <strong>EMCALI</strong>,
con el consolidado de las interacciones registradas en la fecha indicada.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
style="background-color:#f8f4fa;border:1px solid #eadced;border-radius:8px;">
<tr>
<td style="padding:18px 20px;">
<p style="margin:0 0 6px;color:#72547b;font-size:12px;text-transform:uppercase;">
Fecha del reporte
</p>
<p style="margin:0;color:#3b1648;font-size:20px;font-weight:bold;">
${fechaFormateada}
</p>
</td>
</tr>
</table>
<h2 style="margin:28px 0 16px;color:#3b1648;font-size:18px;">
Resumen de interacciones
</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td width="50%" style="padding:8px 6px 8px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
style="border:1px solid #eadced;border-radius:8px;">
<tr>
<td style="padding:17px;text-align:center;">
<p style="margin:0 0 8px;color:#72547b;font-size:12px;">
Consultas de usuarios
</p>
<p style="margin:0;color:#3b1648;font-size:27px;font-weight:bold;">
${totalConsultas}
</p>
</td>
</tr>
</table>
</td>
<td width="50%" style="padding:8px 0 8px 6px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
style="border:1px solid #eadced;border-radius:8px;">
<tr>
<td style="padding:17px;text-align:center;">
<p style="margin:0 0 8px;color:#72547b;font-size:12px;">
Respuestas del asistente
</p>
<p style="margin:0;color:#3b1648;font-size:27px;font-weight:bold;">
${totalRespuestas}
</p>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td width="50%" style="padding:8px 6px 8px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
style="border:1px solid #eadced;border-radius:8px;">
<tr>
<td style="padding:17px;text-align:center;">
<p style="margin:0 0 8px;color:#72547b;font-size:12px;">
Total de mensajes
</p>
<p style="margin:0;color:#3b1648;font-size:27px;font-weight:bold;">
${totalMensajes}
</p>
</td>
</tr>
</table>
</td>
<td width="50%" style="padding:8px 0 8px 6px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
style="border:1px solid #eadced;border-radius:8px;">
<tr>
<td style="padding:17px;text-align:center;">
<p style="margin:0 0 8px;color:#72547b;font-size:12px;">
Conversaciones
</p>
<p style="margin:0;color:#3b1648;font-size:27px;font-weight:bold;">
${totalConversaciones}
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
style="margin-top:24px;background-color:#f8f4fa;border-left:4px solid #9b4cba;">
<tr>
<td style="padding:16px 18px;font-size:14px;line-height:1.7;color:#514458;">
${mensajeEstado}
${
!sinInteracciones
? " El archivo adjunto contiene el detalle de los mensajes, los usuarios y las conversaciones."
: ""
}
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="background-color:#3b1648;padding:18px 24px;text-align:center;">
<p style="margin:0;color:#e8d9ed;font-size:11px;line-height:1.6;">
Mensaje generado automáticamente. Por favor, no responda a este correo.
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>

</body>
</html>`;
}

import { generarReporteExcel } from "./reporte-excel.service";

export async function enviarReporteDiario(): Promise<void> {
const reporte = await generarReporteExcel();

const fechaEnvio = new Intl.DateTimeFormat("en-CA", {
timeZone: "America/Bogota",
year: "numeric",
month: "2-digit",
day: "2-digit",
}).format(new Date());

await enviarCorreoReporte(
{
fechaReporte: fechaEnvio,
totalMensajes: reporte.totalMensajes,
totalConsultas: reporte.totalConsultas,
totalRespuestas: reporte.totalRespuestas,
totalConversaciones: reporte.totalConversaciones,
sinInteracciones: reporte.totalMensajes === 0,
},
{
nombre: `Reporte_NOVA_EMCALI_${reporte.fechaReporte}.xlsx`,
contenido: Buffer.from(reporte.buffer),
}
);

console.log("Reporte diario enviado correctamente.");
}


interface AdjuntoReporte {
nombre: string;
contenido: Buffer;
}

export async function enviarCorreoReporte(
datos: DatosCorreoReporte,
adjunto: AdjuntoReporte
): Promise<void> {
const destinatarios = [
  "sahra.gomez@comware.com.co",
  "juan.aros@comware.com.co"
];

const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT) || 465,
secure: Number(process.env.SMTP_PORT) === 465,
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASS,
},
});

await transporter.sendMail({
from: `"Reporte MILE | EMCALI" <${process.env.SMTP_USER}>`,
to: destinatarios,
subject: `Reporte diario NOVA - EMCALI - ${datos.fechaReporte}`,
html: generarHtmlCorreoReporte(datos),
attachments: [
{
filename: adjunto.nombre,
content: adjunto.contenido,
contentType:
"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
},
],
});
}
