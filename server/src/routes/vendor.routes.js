"use strict";

const express = require("express");

const vendorService = require("../services/vendor.service");
const { validateCreateVendor, validateUpdateVendor } = require("../middlewares/vendor.validator");

const router = express.Router();

// GET /api/vendors - Listar comerciantes
router.get("/", async (req, res, next) => {
    try {
        const vendors = await vendorService.list();
        res.status(200).json({ count: vendors.length, data: vendors });
    } catch (error) {
        next(error);
    }
});

// GET /api/vendors/:id - Detalle de un comerciante
router.get("/:id", async (req, res, next) => {
    try {
        const vendor = await vendorService.getById(req.params.id);
        res.status(200).json({ data: vendor });
    } catch (error) {
        next(error);
    }
});

// POST /api/vendors - Crear comerciante
router.post("/", validateCreateVendor, async (req, res, next) => {
    try {
        const vendor = await vendorService.create(req.body);
        res.status(201).json({ message: "Comerciante registrado correctamente.", data: vendor });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/vendors/:id - Editar comerciante
router.patch("/:id", validateUpdateVendor, async (req, res, next) => {
    try {
        const vendor = await vendorService.update(req.params.id, req.body);
        res.status(200).json({ message: "Comerciante actualizado correctamente.", data: vendor });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/vendors/:id - Borrar comerciante (solo si no atiende puestos)
router.delete("/:id", async (req, res, next) => {
    try {
        const vendor = await vendorService.remove(req.params.id);
        res.status(200).json({ message: "Comerciante eliminado correctamente.", data: vendor });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
