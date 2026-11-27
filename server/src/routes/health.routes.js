"use strict";

const express = require("express");

const router = express.Router();

// GET /api/health - Comprueba que el servidor responde
router.get("/", (req, res) => {
    res.status(200).json({
        data: {
            status: "ok",
            message: "El servidor de ¡Pásele! funciona correctamente",
            timestamp: new Date().toISOString()
        }
    });
});

module.exports = router;
