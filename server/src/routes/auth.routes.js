"use strict";

const express = require("express");

const userService = require("../services/user.service");
const { validateRegister, validateLogin } = require("../middlewares/user.validator");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

// POST /api/auth/register - Crear cuenta
router.post("/register", validateRegister, async (req, res, next) => {
    try {
        const result = await userService.register(req.body);

        res.status(201).json({
            message: "Cuenta creada correctamente.",
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/login - Iniciar sesión
router.post("/login", validateLogin, async (req, res, next) => {
    try {
        const result = await userService.login(req.body);

        res.status(200).json({
            message: "Sesión iniciada.",
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/auth/me - Usuario de la sesión actual (el cliente lo usa para validar el token)
router.get("/me", requireAuth, (req, res) => {
    res.status(200).json({ data: req.user });
});

module.exports = router;
