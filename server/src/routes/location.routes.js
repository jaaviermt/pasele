"use strict";

const express = require("express");

const locationService = require("../services/location.service");
const {
    validateCreateLocation,
    validateUpdateLocation,
    validateLocationQuery
} = require("../middlewares/location.validator");

const router = express.Router();

// GET /api/locations?search=&category=&zone= - Listar puestos filtrados (con estado)
router.get("/", validateLocationQuery, async (req, res, next) => {
    try {
        const locations = await locationService.list({
            search: req.query.search,
            category: req.query.category,
            zone: req.query.zone
        });
        res.status(200).json({ count: locations.length, data: locations });
    } catch (error) {
        next(error);
    }
});

// GET /api/locations/:id - Detalle de un puesto
router.get("/:id", async (req, res, next) => {
    try {
        const location = await locationService.getById(req.params.id);
        res.status(200).json({ data: location });
    } catch (error) {
        next(error);
    }
});

// POST /api/locations - Registrar puesto (lo firma el usuario de la sesión)
router.post("/", validateCreateLocation, async (req, res, next) => {
    try {
        const location = await locationService.create(req.body, req.user._id);
        res.status(201).json({ message: "Puesto registrado correctamente.", data: location });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/locations/:id - Editar puesto
router.patch("/:id", validateUpdateLocation, async (req, res, next) => {
    try {
        const location = await locationService.update(req.params.id, req.body);
        res.status(200).json({ message: "Puesto actualizado correctamente.", data: location });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/locations/:id - Borrar puesto y sus permisos
router.delete("/:id", async (req, res, next) => {
    try {
        const location = await locationService.remove(req.params.id);
        res.status(200).json({ message: "Puesto eliminado correctamente.", data: location });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
