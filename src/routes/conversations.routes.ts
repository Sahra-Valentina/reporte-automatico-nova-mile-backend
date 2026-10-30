import { Router, Request, Response } from "express";
import { consultarChatLogs } from "../services/nova.service";

const router = Router();

router.get("/test", async (_req: Request, res: Response) => {
try {
const resultado = await consultarChatLogs();

console.log(
"Resultado de consultarChatLogs:",
JSON.stringify(resultado, null, 2).slice(0, 5000)
);

return res.status(200).json({
ok: true,
message: "Historial de MILE consultado correctamente",
data: resultado,
});
} catch (error: unknown) {
const detail =
error instanceof Error ? error.message : "Error desconocido";

console.error("Error consultando el historial de MILE:", detail);

return res.status(502).json({
ok: false,
message: "No fue posible consultar el historial de MILE",
detail,
});
  }
});


router.get("/", async (req: Request, res: Response) => {
try {
const {
startCreatedAt,
endCreatedAt,
threadId,
createdBy,
project,
message,
} = req.query;

const resultado = await consultarChatLogs({
startCreatedAt:
typeof startCreatedAt === "string" ? startCreatedAt : undefined,
endCreatedAt:
typeof endCreatedAt === "string" ? endCreatedAt : undefined,
threadId: typeof threadId === "string" ? threadId : undefined,
createdBy: typeof createdBy === "string" ? createdBy : undefined,
project: typeof project === "string" ? project : undefined,
message: typeof message === "string" ? message : undefined,
});

return res.status(200).json({
ok: true,
data: resultado,
});
} catch (error: unknown) {
const detail =
error instanceof Error ? error.message : "Error desconocido";

console.error("Error obteniendo el reporte de MILE:", detail);

return res.status(502).json({
ok: false,
message: "No fue posible generar los datos del reporte",
detail,
});
}
});

export default router;