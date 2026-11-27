"use strict";

const jwt = require("jsonwebtoken");

const AppError = require("../utils/app-error");
const env = require("../config/env");
const userService = require("../services/user.service");

// Exige el header "Authorization: Bearer <token>".
// Si el token es válido deja al usuario en req.user.
async function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const [scheme, token] = header.split(" ");

        if (scheme !== "Bearer" || !token) {
            throw new AppError(401, "Debes iniciar sesión.");
        }

        let payload;
        try {
            payload = jwt.verify(token, env.jwtSecret);
        } catch {
            throw new AppError(401, "La sesión no es válida o ya expiró. Inicia sesión de nuevo.");
        }

        // El usuario pudo borrarse después de crear el token
        try {
            req.user = await userService.getById(payload.sub);
        } catch {
            throw new AppError(401, "La sesión no es válida. Inicia sesión de nuevo.");
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = { requireAuth };
