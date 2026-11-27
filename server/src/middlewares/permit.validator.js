"use strict";

const AppError = require("../utils/app-error");
const { isPlainObject, isNonEmptyString, isValidId, findUnknownFields } = require("../utils/validation");

const ALLOWED_FIELDS = ["location", "folio", "vigenteHasta", "cuota"];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/; // AAAA-MM-DD

function isValidDate(value) {
    if (typeof value !== "string" || !DATE_REGEX.test(value)) {
        return false;
    }
    // Rechaza fechas imposibles como 2026-02-31
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function checkFields(body, isCreate) {
    const errors = findUnknownFields(body, ALLOWED_FIELDS);
    const { location, folio, vigenteHasta, cuota } = body;

    if (location !== undefined || isCreate) {
        if (!isValidId(location)) {
            errors.push("El puesto (location) debe ser un id válido.");
        }
    }

    if (folio !== undefined || isCreate) {
        if (!isNonEmptyString(folio)) {
            errors.push("El folio es obligatorio.");
        } else if (folio.trim().length > 30) {
            errors.push("El folio debe tener máximo 30 caracteres.");
        }
    }

    if (vigenteHasta !== undefined || isCreate) {
        if (!isValidDate(vigenteHasta)) {
            errors.push("La fecha de vigencia debe tener el formato AAAA-MM-DD.");
        }
    }

    if (cuota !== undefined || isCreate) {
        if (typeof cuota !== "number" || !Number.isFinite(cuota) || cuota < 0) {
            errors.push("La cuota debe ser un número mayor o igual a 0.");
        }
    }

    return errors;
}

function validateCreatePermit(req, res, next) {
    if (!isPlainObject(req.body)) {
        return next(new AppError(400, "El cuerpo debe ser un objeto JSON."));
    }

    const errors = checkFields(req.body, true);
    if (errors.length > 0) {
        return next(new AppError(400, "Revisa los datos del permiso.", errors));
    }

    next();
}

function validateUpdatePermit(req, res, next) {
    if (!isPlainObject(req.body) || Object.keys(req.body).length === 0) {
        return next(new AppError(400, "Envía al menos un campo para actualizar."));
    }

    const errors = checkFields(req.body, false);
    if (errors.length > 0) {
        return next(new AppError(400, "Revisa los datos del permiso.", errors));
    }

    next();
}

module.exports = { validateCreatePermit, validateUpdatePermit };
