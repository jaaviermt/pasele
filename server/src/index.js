"use strict";

const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/database");

async function startServer() {
    try {
        if (!env.jwtSecret) {
            throw new Error("Falta la variable JWT_SECRET en el .env");
        }

        // Primero la base de datos: sin ella la API no sirve
        await connectDatabase();

        app.listen(env.port, () => {
            console.log(`Servidor de ¡Pásele! en http://localhost:${env.port}`);
            console.log(`Salud:  http://localhost:${env.port}/api/health`);
        });
    } catch (error) {
        console.error("No se pudo iniciar el servidor:", error.message);
        process.exit(1);
    }
}

startServer();
