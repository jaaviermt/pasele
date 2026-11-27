"use strict";

const express = require("express");

const categoryService = require("../services/category.service");
const { validateCreateCategory, validateUpdateCategory } = require("../middlewares/category.validator");

const router = express.Router();

// GET /api/categories - Listar giros
router.get("/", async (req, res, next) => {
    try {
        const categories = await categoryService.list();
        res.status(200).json({ count: categories.length, data: categories });
    } catch (error) {
        next(error);
    }
});

// GET /api/categories/:id - Detalle de un giro
router.get("/:id", async (req, res, next) => {
    try {
        const category = await categoryService.getById(req.params.id);
        res.status(200).json({ data: category });
    } catch (error) {
        next(error);
    }
});

// POST /api/categories - Crear giro
router.post("/", validateCreateCategory, async (req, res, next) => {
    try {
        const category = await categoryService.create(req.body);
        res.status(201).json({ message: "Giro creado correctamente.", data: category });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/categories/:id - Editar giro
router.patch("/:id", validateUpdateCategory, async (req, res, next) => {
    try {
        const category = await categoryService.update(req.params.id, req.body);
        res.status(200).json({ message: "Giro actualizado correctamente.", data: category });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/categories/:id - Borrar giro (solo si ningún puesto lo usa)
router.delete("/:id", async (req, res, next) => {
    try {
        const category = await categoryService.remove(req.params.id);
        res.status(200).json({ message: "Giro eliminado correctamente.", data: category });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
