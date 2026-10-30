import axios from "axios";
import { novaConfig } from "../config/nova.config";
import { loginNova } from "./nova-auth.service";

const PAGE_SIZE = 1000;
const TIMEOUT = 30000;
const TIME_ZONE = "America/Bogota";

function obtenerFechaHoyColombia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}


interface NovaUser {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  [key: string]: unknown;
}

interface NovaAssistant {
  id?: string;
  assistant_id?: string;
  name?: string;
}

interface NovaMessage {
  id: string;
  message: string;
  sender: string;
  threadId: string;
  created_at: string;
  createdBy?: NovaUser | null;
  chat_assistant?: NovaAssistant | null;
  project?: string | null;
}

interface NovaResponse {
  items?: {
    items?: NovaMessage[];
    length?: number;
  };
}

export interface FiltrosChatLogs {
  startCreatedAt?: string;
  endCreatedAt?: string;
  threadId?: string;
  createdBy?: string;
  project?: string;
  message?: string;
}

export interface MensajeMile {
  id: string;
  threadId: string;
  fecha: string;
  hora: string;
  usuario: string;
  usuarioId: string;
  emisor: string;
  mensaje: string;
}

export interface ConversacionMile {
  fecha: string;
  horaInicial: string;
  horaFinal: string;
  threadId: string;
  asesor: string;
  consultas: string[];
  respuestas: string[];
  totalMensajes: number;
}

function obtenerFechaColombia(fecha: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
}

function obtenerHoraColombia(fecha: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(fecha);
}

function obtenerFechaHora(fecha: Date): string {
  return `${obtenerFechaColombia(fecha)} ${obtenerHoraColombia(fecha)}`;
}

export async function consultarInteraccionesDelDia() {
  const fechaInicio = "2026-10-29";
  const fechaCorte = obtenerFechaHoyColombia();

  return consultarChatLogs({
    startCreatedAt: fechaInicio,
    endCreatedAt: fechaCorte,
  });
}


function obtenerLimitesDiaColombia(fecha: string): {
  inicio: number;
  fin: number;
} {
  const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

  if (!formatoFecha.test(fecha)) {
    throw new Error(
      `La fecha "${fecha}" debe tener el formato YYYY-MM-DD.`
    );
  }

  const inicio = new Date(`${fecha}T00:00:00-05:00`);

  if (
    Number.isNaN(inicio.getTime()) ||
    obtenerFechaColombia(inicio) !== fecha
  ) {
    throw new Error(`La fecha "${fecha}" no es válida.`);
  }

  const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

  return {
    inicio: inicio.getTime(),
    fin: fin.getTime(),
  };
}

function normalizarTexto(valor?: string): string {
  return valor?.trim().toLocaleLowerCase("es-CO") ?? "";
}

function obtenerUsuario(mensaje: NovaMessage): {
  nombre: string;
  id: string;
} {
  const usuario = mensaje.createdBy;

  if (!usuario) {
    return {
      nombre: "No identificado",
      id: "",
    };
  }

  return {
    nombre:
      usuario.name ??
      usuario.username ??
      usuario.email ??
      "No identificado",
    id: usuario.id ?? "",
  };
}

export async function consultarChatLogs(
  filtros: FiltrosChatLogs = {}
) {
  if (!novaConfig.baseUrl || !novaConfig.mileAssistantId) {
    throw new Error(
      "Faltan NOVA_BASE_URL o NOVA_MILE_ASSISTANT_ID en la configuración."
    );
  }

  const token = await loginNova();

  const mensajes: NovaMessage[] = [];
  let page = 0;
  let totalReportado: number | undefined;

  // Consultar exclusivamente los mensajes del asistente MILE.
  while (true) {
    const response = await axios.get<NovaResponse>(
      `${novaConfig.baseUrl}/api/chat-logs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {
          chatAssistant: novaConfig.mileAssistantId,
          page,
          limit: PAGE_SIZE,
        },
        timeout: TIMEOUT,
      }
    );

    const datos = response.data?.items;
    const paginaMensajes = datos?.items ?? [];

    if (typeof datos?.length === "number") {
      totalReportado = datos.length;
    }

    if (paginaMensajes.length === 0) {
      break;
    }

    mensajes.push(...paginaMensajes);

    if (
      (totalReportado !== undefined &&
        mensajes.length >= totalReportado) ||
      paginaMensajes.length < PAGE_SIZE
    ) {
      break;
    }

    page += 1;
  }

  // Aplicar filtros localmente para no depender de parámetros
  // adicionales cuya aceptación no se haya confirmado en la API.

const limitesInicio = filtros.startCreatedAt
  ? obtenerLimitesDiaColombia(filtros.startCreatedAt)
  : undefined;

const limitesFin = filtros.endCreatedAt
  ? obtenerLimitesDiaColombia(filtros.endCreatedAt)
  : undefined;

if (
  limitesInicio &&
  limitesFin &&
  limitesInicio.inicio > limitesFin.inicio
) {
  throw new Error(
    "La fecha inicial no puede ser posterior a la fecha final."
  );
}

  const threadFiltro = normalizarTexto(filtros.threadId);
  const usuarioFiltro = normalizarTexto(filtros.createdBy);
  const proyectoFiltro = normalizarTexto(filtros.project);
  const mensajeFiltro = normalizarTexto(filtros.message);

  const mensajesFiltrados = mensajes.filter((mensaje) => {
  const fechaMensaje = new Date(mensaje.created_at);
const timestampMensaje = fechaMensaje.getTime();

if (
  limitesInicio &&
  timestampMensaje < limitesInicio.inicio
) {
  return false;
}

if (
  limitesFin &&
  timestampMensaje >= limitesFin.fin
) {
  return false;
}

    if (
      threadFiltro &&
      !normalizarTexto(mensaje.threadId).includes(threadFiltro)
    ) {
      return false;
    }

    const usuario = obtenerUsuario(mensaje);

    if (
      usuarioFiltro &&
      !normalizarTexto(
        `${usuario.nombre} ${usuario.id} ${
          mensaje.createdBy?.username ?? ""
        } ${mensaje.createdBy?.email ?? ""}`
      ).includes(usuarioFiltro)
    ) {
      return false;
    }

    if (
      proyectoFiltro &&
      !normalizarTexto(
        String(mensaje.project ?? "")
      ).includes(proyectoFiltro)
    ) {
      return false;
    }

    if (
      mensajeFiltro &&
      !normalizarTexto(mensaje.message).includes(mensajeFiltro)
    ) {
      return false;
    }

    return true;
  });

  // Orden cronológico para preparar el reporte.
  mensajesFiltrados.sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime()
  );

  // Detalle de cada mensaje para exportación plana.
  const detalleMensajes: MensajeMile[] = mensajesFiltrados.map(
    (mensaje) => {
      const usuario = obtenerUsuario(mensaje);
      const fecha = new Date(mensaje.created_at);

      return {
        id: mensaje.id,
        threadId: mensaje.threadId,
        fecha: obtenerFechaColombia(fecha),
        hora: obtenerHoraColombia(fecha),
        usuario: usuario.nombre,
        usuarioId: usuario.id,
        emisor: mensaje.sender,
        mensaje: mensaje.message,
      };
    }
  );

  // Agrupar los mensajes por conversación.
  const grupos = new Map<string, NovaMessage[]>();

  for (const mensaje of mensajesFiltrados) {
    if (!mensaje.threadId) {
      continue;
    }

    const grupo = grupos.get(mensaje.threadId) ?? [];
    grupo.push(mensaje);
    grupos.set(mensaje.threadId, grupo);
  }

  const conversaciones: ConversacionMile[] = [];

  for (const [threadId, grupo] of grupos) {
    const primerMensaje = grupo[0];
    const ultimoMensaje = grupo[grupo.length - 1];

    const mensajeUsuario = grupo.find(
      (mensaje) => mensaje.sender === "user" && mensaje.createdBy
    );

    const usuario = mensajeUsuario
      ? obtenerUsuario(mensajeUsuario)
      : { nombre: "No identificado", id: "" };

    const consultas = grupo
      .filter((mensaje) => mensaje.sender === "user")
      .map((mensaje) => mensaje.message);

    const respuestas = grupo
      .filter((mensaje) => mensaje.sender === "assistant")
      .map((mensaje) => mensaje.message);

    conversaciones.push({
      fecha: obtenerFechaColombia(
        new Date(primerMensaje.created_at)
      ),
      horaInicial: obtenerHoraColombia(
        new Date(primerMensaje.created_at)
      ),
      horaFinal: obtenerHoraColombia(
        new Date(ultimoMensaje.created_at)
      ),
      threadId,
      asesor: usuario.nombre,
      consultas,
      respuestas,
      totalMensajes: grupo.length,
    });
  }

  // Métricas calculadas sobre los registros filtrados.
  const consultasPorUsuarioYDia = new Map<
    string,
    {
      fecha: string;
      usuario: string;
      usuarioId: string;
      totalConsultas: number;
    }
  >();

  for (const mensaje of mensajesFiltrados) {
    if (mensaje.sender !== "user") {
      continue;
    }

    const usuario = obtenerUsuario(mensaje);
    const fecha = obtenerFechaColombia(
      new Date(mensaje.created_at)
    );

    const clave = `${fecha}|${usuario.id || usuario.nombre}`;

    const actual = consultasPorUsuarioYDia.get(clave);

    if (actual) {
      actual.totalConsultas += 1;
    } else {
      consultasPorUsuarioYDia.set(clave, {
        fecha,
        usuario: usuario.nombre,
        usuarioId: usuario.id,
        totalConsultas: 1,
      });
    }
  }

  return {
    asistenteId: novaConfig.mileAssistantId,
    asistente: "MILE",
    campana: "EMCALI",
    zonaHoraria: TIME_ZONE,
    fechaGeneracion: obtenerFechaHora(new Date()),
    filtros: {
      startCreatedAt: filtros.startCreatedAt ?? null,
      endCreatedAt: filtros.endCreatedAt ?? null,
      threadId: filtros.threadId ?? null,
      createdBy: filtros.createdBy ?? null,
      project: filtros.project ?? null,
      message: filtros.message ?? null,
    },
    totalMensajes: mensajesFiltrados.length,
    totalConsultas: mensajesFiltrados.filter(
      (mensaje) => mensaje.sender === "user"
    ).length,
    totalRespuestas: mensajesFiltrados.filter(
      (mensaje) => mensaje.sender === "assistant"
    ).length,
    totalConversaciones: conversaciones.length,
    sinInteracciones: mensajesFiltrados.length === 0,
    consultasPorUsuarioYDia: Array.from(
      consultasPorUsuarioYDia.values()
    ),
    mensajes: detalleMensajes,
    conversaciones,
  };
}
