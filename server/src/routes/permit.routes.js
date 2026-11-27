"use strict";

const express = require("express");

const permitService = require("../services/permit.service");
const { validateCreatePermit, validateUpdatePermit } = require("../middlewares/permit.validator");

const router = express.Router();

// GET /api/permits - Listar permisos (con el nombre del puesto)
router.get("/", async (req, res, next) => {
    try {
        const permits = await permitService.list();
        res.status(200).json({ count: permits.length, data: permits });
    } catch (error) {
        next(error);
    }
});

// GET /api/permits/:id - Detalle de un permiso
router.get("/:id", async (req, res, next) => {
    try {
        const permit = await permitService.getById(req.params.id);
        res.status(200).json({ data: permit });
    } catch (error) {
        next(error);
    }
});

// POST /api/permits - Crear permiso
router.post("/", validateCreatePermit, async (req, res, next) => {
    try {
        const permit = await permitService.create(req.body);
        res.status(201).json({ message: "Permiso registrado correctamente.", data: permit });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/permits/:id - Editar permiso
router.patch("/:id", validateUpdatePermit, async (req, res, next) => {
    try {
        const permit = await permitService.update(req.params.id, req.body);
        res.status(200).json({ message: "Permiso actualizado correctamente.", data: permit });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/permits/:id - Borrar permiso
router.delete("/:id", async (req, res, next) => {
    try {
        const permit = await permitService.remove(req.params.id);
        res.status(200).json({ message: "Permiso eliminado correctamente.", data: permit });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
