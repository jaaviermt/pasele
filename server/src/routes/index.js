"use strict";

const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");

// Monta todas las rutas bajo /api
function registerRoutes(app) {
    const apiRouter = express.Router();

    // Rutas públicas
    apiRouter.use("/health", healthRoutes);
    apiRouter.use("/auth", authRoutes);

    // Las rutas protegidas de las siguientes fases usarán requireAuth

    app.use("/api", apiRouter);
}

module.exports = registerRoutes;
