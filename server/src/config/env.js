"use strict";

// Carga las variables de .env y las expone en un solo lugar.
require("dotenv").config({ quiet: true });

const env = {
    port: Number(process.env.PORT) || 3000,
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
    // Orígenes permitidos por CORS, separados por comas en el .env
    clientOrigins: (process.env.CLIENT_ORIGINS || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
};

module.exports = env;
