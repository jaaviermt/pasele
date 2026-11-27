"use strict";

const AppError = require("../utils/app-error");
const { isPlainObject, isNonEmptyString, findUnknownFields } = require("../utils/validation");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(req, res, next) {
    const body = req.body;

    if (!isPlainObject(body)) {
        return next(new AppError(400, "El cuerpo debe ser un objeto JSON."));
    }

    const { nombre, email, password } = body;
    const errors = findUnknownFields(body, ["nombre", "email", "password"]);

    if (!isNonEmptyString(nombre)) {
        errors.push("El nombre es obligatorio.");
    } else if (nombre.trim().length > 80) {
        errors.push("El nombre debe tener máximo 80 caracteres.");
    }

    if (!isNonEmptyString(email)) {
        errors.push("El correo es obligatorio.");
    } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.push("El correo no tiene un formato válido.");
    }

    if (typeof password !== "string" || password === "") {
        errors.push("La contraseña es obligatoria.");
    } else if (password.length < 8) {
        errors.push("La contraseña debe tener al menos 8 caracteres.");
    } else if (password.length > 72) {
        // bcrypt solo toma en cuenta los primeros 72 bytes
        errors.push("La contraseña debe tener máximo 72 caracteres.");
    }

    if (errors.length > 0) {
        return next(new AppError(400, "Revisa los datos del registro.", errors));
    }

    next();
}

function validateLogin(req, res, next) {
    const body = req.body;

    if (!isPlainObject(body)) {
        return next(new AppError(400, "El cuerpo debe ser un objeto JSON."));
    }

    const { email, password } = body;
    const errors = findUnknownFields(body, ["email", "password"]);

    if (!isNonEmptyString(email)) {
        errors.push("El correo es obligatorio.");
    }

    if (typeof password !== "string" || password === "") {
        errors.push("La contraseña es obligatoria.");
    }

    if (errors.length > 0) {
        return next(new AppError(400, "Revisa los datos de inicio de sesión.", errors));
    }

    next();
}

module.exports = { validateRegister, validateLogin };
