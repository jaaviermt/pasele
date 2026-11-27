"use strict";

const AppError = require("../utils/app-error");
const { DIAS } = require("../models/zone.model");
const { isPlainObject, isNonEmptyString, findUnknownFields } = require("../utils/validation");
const { validatePolygon } = require("../utils/geo");

function validateCreateZone(req, res, next) {
    const body = req.body;

    if (!isPlainObject(body)) {
        return next(new AppError(400, "El cuerpo debe ser un objeto JSON."));
    }

    const { nombre, dias, area } = body;
    const errors = findUnknownFields(body, ["nombre", "dias", "area"]);

    if (!isNonEmptyString(nombre)) {
        errors.push("El nombre de la zona es obligatorio.");
    } else if (nombre.trim().length > 80) {
        errors.push("El nombre de la zona debe tener máximo 80 caracteres.");
    }

    // dias es opcional; si llega, solo puede traer días válidos
    if (dias !== undefined) {
        if (!Array.isArray(dias) || !dias.every((dia) => DIAS.includes(dia))) {
            errors.push(`Los días deben ser una lista con valores de: ${DIAS.join(", ")}.`);
        }
    }

    // Forma de GeoJSON, rangos, mínimo 3 vértices y sin autointersecciones
    errors.push(...validatePolygon(area));

    if (errors.length > 0) {
        return next(new AppError(400, "Revisa los datos de la zona.", errors));
    }

    next();
}

module.exports = { validateCreateZone };
