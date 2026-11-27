"use strict";

const express = require("express");
const cors = require("cors");

const env = require("./config/env");
const registerRoutes = require("./routes");

const app = express();

// Solo el frontend configurado en CLIENT_ORIGINS puede llamar a la API
app.use(cors({ origin: env.clientOrigins }));
app.use(express.json());

registerRoutes(app);

module.exports = app;
