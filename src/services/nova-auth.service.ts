import axios from "axios";
import { novaConfig } from "../config/nova.config";

export async function loginNova(): Promise<string> {
const username = process.env.NOVA_EMAIL;
const password = process.env.NOVA_PASSWORD;

if (!username || !password) {
throw new Error(
"Faltan NOVA_EMAIL o NOVA_PASSWORD en el archivo .env"
);
}

const response = await axios.post(
`${novaConfig.baseUrl}/api/auth/login`,
{
username,
password,
captcha: "1",
},
{
timeout: 30000,
headers: {
"Content-Type": "application/json",
},
}
);

const token = response.data?.token;

if (!token) {
throw new Error(
"Nova respondió al login, pero no se encontró el token en response.data.token"
);
}

return token;
}