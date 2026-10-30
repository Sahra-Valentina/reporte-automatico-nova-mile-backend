import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
res.json({
ok: true,
message: "Backend de MILE Reporte EMCALI funcionando",
timestamp: new Date().toISOString(),
});
});

export default router;