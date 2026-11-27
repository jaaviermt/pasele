"use strict";

const express = require("express");

const zoneService = require("../services/zone.service");
const { validateCreateZone } = require("../middlewares/zone.validator");

const router = express.Router();

// GET /api/zones - Listar zonas (el mapa las carga al abrir)
router.get("/", async (req, res, next) => {
    try {
        const zones = await zoneService.list();
        res.status(200).json({ count: zones.length, data: zones });
    } catch (error) {
        next(error);
    }
});

// POST /api/zones - Guardar una zona dibujada
router.post("/", validateCreateZone, async (req, res, next) => {
    try {
        const zone = await zoneService.create(req.body);
        res.status(201).json({ message: "Zona guardada correctamente.", data: zone });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/zones/:id - Borrar zona
router.delete("/:id", async (req, res, next) => {
    try {
        const zone = await zoneService.remove(req.params.id);
        res.status(200).json({ message: "Zona eliminada correctamente.", data: zone });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
