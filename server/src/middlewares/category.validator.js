"use strict";

const AppError = require("../utils/app-error");
const { isPlainObject, isNonEmptyString, findUnknownFields } = require("../utils/validation");

const ALLOWED_FIELDS = ["nombre", "color", "icono"];
const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

// Revisa cada campo; en "crear" todos son obligatorios, en "editar" solo los que lleguen
function checkFields(body, isCreate) {
    const errors = findUnknownFields(body, ALLOWED_FIELDS);
    const { nombre, color, icono } = body;

    if (nombre !== undefined || isCreate) {
        if (!isNonEmptyString(nombre)) {
            errors.push("El nombre del giro es obligatorio.");
        } else if (nombre.trim().length > 50) {
            errors.push("El nombre del giro debe tener máximo 50 caracteres.");
        }
    }

    if (color !== undefined || isCreate) {
        if (typeof color !== "string" || !COLOR_REGEX.test(color)) {
            errors.push("El color debe ser hexadecimal, por ejemplo #e8201a.");
        }
    }

    if (icono !== undefined || isCreate) {
        if (!isNonEmptyString(icono)) {
            errors.push("El icono es obligatorio.");
        } else if (icono.trim().length > 10) {
            errors.push("El icono debe tener máximo 10 caracteres.");
        }
    }

    return errors;
}

function validateCreateCategory(req, res, next) {
    if (!isPlainObject(req.body)) {
        return next(new AppError(400, "El cuerpo debe ser un objeto JSON."));
    }

    const errors = checkFields(req.body, true);
    if (errors.length > 0) {
        return next(new AppError(400, "Revisa los datos del giro.", errors));
    }

    next();
}

function validateUpdateCategory(req, res, next) {
    if (!isPlainObject(req.body) || Object.keys(req.body).length === 0) {
        return next(new AppError(400, "Envía al menos un campo para actualizar."));
    }

    const errors = checkFields(req.body, false);
    if (errors.length > 0) {
        return next(new AppError(400, "Revisa los datos del giro.", errors));
    }

    next();
}

module.exports = { validateCreateCategory, validateUpdateCategory };
