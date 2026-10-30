import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import novaRoutes from "./routes/nova.routes";
import conversationsRoutes from "./routes/conversations.routes";
import { enviarReporteDiario } from "./services/correo.service";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/nova", novaRoutes);
app.use("/api/conversations", conversationsRoutes);

app.post("/api/reportes/enviar-prueba", async (_req, res) => {
try {
await enviarReporteDiario();

res.status(200).json({
ok: true,
mensaje: "Reporte enviado correctamente.",
});
} catch (error) {
console.error("Error al enviar el reporte:", error);

res.status(500).json({
ok: false,
mensaje: "No fue posible enviar el reporte.",
});
}
});

export default app;
