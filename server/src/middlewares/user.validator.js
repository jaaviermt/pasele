"use strict";

const AppError = require("../utils/app-error");
const { isPlainObject, isNonEmptyString, findUnknownFields } = require("../utils/validation");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOMBRE_MAX = 80;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

function validateRegister(req, res, next) {
    const body = req.body;

    if (!isPlainObject(body)) {
        return next(new AppError(400, "El cuerpo debe ser un objeto JSON."));
    }

    const { nombre, email, password } = body;
    const errors = findUnknownFields(body, ["nombre", "email", "password"]);

    if (!isNonEmptyString(nombre)) {
        errors.push("El nombre es obligatorio.");
    } else if (nombre.trim().length > NOMBRE_MAX) {
        errors.push(`El nombre debe tener máximo ${NOMBRE_MAX} caracteres.`);
    }

    if (!isNonEmptyString(email)) {
        errors.push("El correo es obligatorio.");
    } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.push("El correo no tiene un formato válido.");
    }

    if (typeof password !== "string" || password === "") {
        errors.push("La contraseña es obligatoria.");
    } else if (password.length < PASSWORD_MIN) {
        errors.push(`La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`);
    } else if (password.length > PASSWORD_MAX) {
        // bcrypt solo toma en cuenta los primeros 72 bytes
        errors.push(`La contraseña debe tener máximo ${PASSWORD_MAX} caracteres.`);
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
