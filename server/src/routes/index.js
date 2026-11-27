"use strict";

const express = require("express");
const healthRoutes = require("./health.routes");

// Monta todas las rutas bajo /api
function registerRoutes(app) {
    const apiRouter = express.Router();

    apiRouter.use("/health", healthRoutes);

    app.use("/api", apiRouter);
}

module.exports = registerRoutes;
