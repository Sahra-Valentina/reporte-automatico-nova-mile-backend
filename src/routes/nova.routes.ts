import { Router } from "express";
import { loginNova } from "../services/nova-auth.service";

const router = Router();

router.get("/connection-test", async (_req, res) => {
try {
const token = await loginNova();

res.json({
ok: true,
message: "Autenticación con NOVA exitosa",
authenticated: Boolean(token),
});
} catch (error) {
const message =
error instanceof Error ? error.message : "Error desconocido";

res.status(502).json({
ok: false,
message: "No fue posible autenticar con NOVA",
detail: message,
});
}
});

export default router;