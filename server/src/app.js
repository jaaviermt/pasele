"use strict";

const express = require("express");
const cors = require("cors");

const env = require("./config/env");
const registerRoutes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

// Detrás de Render el IP real viene en X-Forwarded-For
app.set("trust proxy", 1);

// Solo el frontend configurado en CLIENT_ORIGINS puede llamar a la API
app.use(cors({ origin: env.clientOrigins }));
app.use(express.json({ limit: "256kb" }));

registerRoutes(app);

// Siempre al final: primero el 404 y luego el manejador de errores.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
