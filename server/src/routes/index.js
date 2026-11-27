"use strict";

const express = require("express");

const { requireAuth } = require("../middlewares/auth.middleware");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const categoryRoutes = require("./category.routes");
const vendorRoutes = require("./vendor.routes");
const permitRoutes = require("./permit.routes");
const locationRoutes = require("./location.routes");
const zoneRoutes = require("./zone.routes");

// Monta todas las rutas bajo /api
function registerRoutes(app) {
    const apiRouter = express.Router();

    // Rutas públicas
    apiRouter.use("/health", healthRoutes);
    apiRouter.use("/auth", authRoutes);

    // Rutas protegidas: requireAuth corre antes de cada una
    apiRouter.use("/categories", requireAuth, categoryRoutes);
    apiRouter.use("/vendors", requireAuth, vendorRoutes);
    apiRouter.use("/permits", requireAuth, permitRoutes);
    apiRouter.use("/locations", requireAuth, locationRoutes);
    apiRouter.use("/zones", requireAuth, zoneRoutes);

    app.use("/api", apiRouter);
}

module.exports = registerRoutes;
