import ExcelJS from "exceljs";
import {
  consultarInteraccionesDelDia,
} from "./nova.service";

export async function generarReporteExcel() {
  const reporte = await consultarInteraccionesDelDia();

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "MILE - EMCALI";
  workbook.subject = "Reporte diario de interacciones";
  workbook.created = new Date();

  const resumen = workbook.addWorksheet("Resumen");

  resumen.columns = [
    { header: "Indicador", key: "indicador", width: 35 },
    { header: "Resultado", key: "resultado", width: 25 },
  ];

  resumen.addRows([
    { indicador: "Asistente", resultado: reporte.asistente },
    { indicador: "Campaña", resultado: reporte.campana },
    {
     indicador: "Período consultado",
     resultado: `${reporte.filtros.startCreatedAt ?? ""} al ${reporte.filtros.endCreatedAt ?? ""}`,
    },
    { indicador: "Zona horaria", resultado: reporte.zonaHoraria },
    { indicador: "Fecha de generación", resultado: reporte.fechaGeneracion },
    { indicador: "Total de mensajes", resultado: reporte.totalMensajes },
    { indicador: "Total de consultas de usuarios", resultado: reporte.totalConsultas },
    { indicador: "Total de respuestas del asistente", resultado: reporte.totalRespuestas },
    { indicador: "Total de conversaciones", resultado: reporte.totalConversaciones },
    { indicador: "Sin interacciones", resultado: reporte.sinInteracciones ? "Sí" : "No" },
  ]);


  const detalle = workbook.addWorksheet("Detalle de mensajes");

  detalle.columns = [
    { header: "Fecha", key: "fecha", width: 15 },
    { header: "Hora", key: "hora", width: 15 },
    { header: "Usuario", key: "usuario", width: 30 },
    { header: "ID de usuario", key: "usuarioId", width: 25 },
    { header: "Emisor", key: "emisor", width: 15 },
    { header: "ID de conversación", key: "threadId", width: 38 },
    { header: "Mensaje", key: "mensaje", width: 70 },
  ];

  detalle.addRows(
    reporte.mensajes.map((mensaje) => ({
    fecha: mensaje.fecha,
    hora: mensaje.hora,
    usuario: mensaje.usuario,
    usuarioId: mensaje.usuarioId,
    emisor: mensaje.emisor,
    threadId: mensaje.threadId,
    mensaje: mensaje.mensaje,
    }))
  );


  const consultas = workbook.addWorksheet("Consultas por usuario");

  consultas.columns = [
    { header: "Fecha", key: "fecha", width: 15 },
    { header: "Usuario", key: "usuario", width: 30 },
    { header: "ID de usuario", key: "usuarioId", width: 25 },
    { header: "Total de consultas", key: "totalConsultas", width: 22 },
  ];

  consultas.addRows(reporte.consultasPorUsuarioYDia);

  const conversaciones = workbook.addWorksheet("Conversaciones");

  conversaciones.columns = [
    { header: "Fecha", key: "fecha", width: 15 },
    { header: "Hora inicial", key: "horaInicial", width: 15 },
    { header: "Hora final", key: "horaFinal", width: 15 },
    { header: "ID de conversación", key: "threadId", width: 38 },
    { header: "Usuario", key: "asesor", width: 30 },
    { header: "Total de mensajes", key: "totalMensajes", width: 20 },
    { header: "Consultas", key: "consultas", width: 60 },
    { header: "Respuestas", key: "respuestas", width: 60 },
  ];

  conversaciones.addRows(
    reporte.conversaciones.map((conversacion) => ({
    fecha: conversacion.fecha,
    horaInicial: conversacion.horaInicial,
    horaFinal: conversacion.horaFinal,
    threadId: conversacion.threadId,
    asesor: conversacion.asesor,
    totalMensajes: conversacion.totalMensajes,
    consultas: conversacion.consultas.join("\n\n"),
    respuestas: conversacion.respuestas.join("\n\n"),
    }))
  );

  for (const hoja of workbook.worksheets) {
    const encabezado = hoja.getRow(1);

    encabezado.height = 28;
    encabezado.font = {
    bold: true,
    color: { argb: "FFFFFFFF" },
    };
    encabezado.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3B1648" },
    };
    encabezado.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
    };

    hoja.views = [{ state: "frozen", ySplit: 1 }];

    if (hoja.rowCount > 1) {
      hoja.autoFilter = {
      from: "A1",
      to: `${hoja.getColumn(hoja.columnCount).letter}1`,
      };
    }

    hoja.eachRow((fila, numeroFila) => {
      if (numeroFila > 1) {
      fila.alignment = {
        vertical: "top",
        wrapText: true,
        };
      }
    });
  }

  return {
    fechaReporte: reporte.filtros.startCreatedAt ?? "",
    totalMensajes: reporte.totalMensajes,
    totalConsultas: reporte.totalConsultas,
    totalRespuestas: reporte.totalRespuestas,
    totalConversaciones: reporte.totalConversaciones,
    buffer: await workbook.xlsx.writeBuffer(),
  };
}
