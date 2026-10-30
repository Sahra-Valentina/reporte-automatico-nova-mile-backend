import dotenv from "dotenv";
import cron from "node-cron";
import app from "./app";
import { enviarReporteDiario } from "./services/correo.service";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
console.log(`Backend disponible en http://localhost:${PORT}`);
});

cron.schedule(
"0 8 * * 1-5",
async () => {
console.log("Iniciando envío del reporte acumulado NOVA | EMCALI");

try {
await enviarReporteDiario();
console.log("Reporte acumulado enviado correctamente.");
} catch (error) {
console.error("Error al enviar el reporte acumulado:", error);
}
},
{
timezone: "America/Bogota",
}
);

console.log(
"Envío automático programado de lunes a viernes a las 8:00 a. m."
);