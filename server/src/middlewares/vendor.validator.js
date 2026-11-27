"use strict";

const AppError = require("../utils/app-error");
const { isPlainObject, isNonEmptyString, findUnknownFields } = require("../utils/validation");

const ALLOWED_FIELDS = ["nombre", "apodo", "telefono"];
const PHONE_REGEX = /^\d{10}$/;

// En "crear" solo el nombre es obligatorio; apodo y teléfono son opcionales
function checkFields(body, isCreate) {
    const errors = findUnknownFields(body, ALLOWED_FIELDS);
    const { nombre, apodo, telefono } = body;

    if (nombre !== undefined || isCreate) {
        if (!isNonEmptyString(nombre)) {
            errors.push("El nombre del comerciante es obligatorio.");
        } else if (nombre.trim().length > 80) {
            errors.push("El nombre del comerciante debe tener máximo 80 caracteres.");
        }
    }

    if (apodo !== undefined) {
        if (typeof apodo !== "string") {
            errors.push("El apodo debe ser texto.");
        } else if (apodo.trim().length > 40) {
            errors.push("El apodo debe tener máximo 40 caracteres.");
        }
    }

    if (telefono !== undefined) {
        // Vacío está permitido (sin teléfono); si trae algo, deben ser 10 dígitos
        if (typeof telefono !== "string" || (telefono.trim() !== "" && !PHONE_REGEX.test(telefono.trim()))) {
            errors.push("El teléfono debe tener 10 dígitos, sin espacios ni guiones.");
        }
    }

    return errors;
}

function validateCreateVendor(req, res, next) {
    if (!isPlainObject(req.body)) {
        return next(new AppError(400, "El cuerpo debe ser un objeto JSON."));
    }

    const errors = checkFields(req.body, true);
    if (errors.length > 0) {
        return next(new AppError(400, "Revisa los datos del comerciante.", errors));
    }

    next();
}

function validateUpdateVendor(req, res, next) {
    if (!isPlainObject(req.body) || Object.keys(req.body).length === 0) {
        return next(new AppError(400, "Envía al menos un campo para actualizar."));
    }

    const errors = checkFields(req.body, false);
    if (errors.length > 0) {
        return next(new AppError(400, "Revisa los datos del comerciante.", errors));
    }

    next();
}

module.exports = { validateCreateVendor, validateUpdateVendor };
