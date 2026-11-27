"use strict";

const AppError = require("../utils/app-error");
const { isPlainObject, isNonEmptyString, isValidId, findUnknownFields } = require("../utils/validation");
const { isValidPosition } = require("../utils/geo");

const ALLOWED_FIELDS = ["nombre", "descripcion", "category", "vendor", "ubicacion"];

function isValidPoint(ubicacion) {
    return isPlainObject(ubicacion) && ubicacion.type === "Point" && isValidPosition(ubicacion.coordinates);
}

function checkFields(body, isCreate) {
    const errors = findUnknownFields(body, ALLOWED_FIELDS);
    const { nombre, descripcion, category, vendor, ubicacion } = body;

    if (nombre !== undefined || isCreate) {
        if (!isNonEmptyString(nombre)) {
            errors.push("El nombre del puesto es obligatorio.");
        } else if (nombre.trim().length > 80) {
            errors.push("El nombre del puesto debe tener máximo 80 caracteres.");
        }
    }

    if (descripcion !== undefined || isCreate) {
        if (!isNonEmptyString(descripcion)) {
            errors.push("La descripción es obligatoria.");
        } else if (descripcion.trim().length > 250) {
            errors.push("La descripción debe tener máximo 250 caracteres.");
        }
    }

    if (category !== undefined || isCreate) {
        if (!isValidId(category)) {
            errors.push("El giro (category) debe ser un id válido.");
        }
    }

    // El comerciante es opcional: puede faltar, ser null o "" (sin comerciante)
    if (vendor !== undefined && vendor !== null && vendor !== "" && !isValidId(vendor)) {
        errors.push("El comerciante (vendor) debe ser un id válido.");
    }

    if (ubicacion !== undefined || isCreate) {
        if (!isValidPoint(ubicacion)) {
            errors.push(
                "La ubicación debe ser un GeoJSON Point: { type: \"Point\", coordinates: [longitud, latitud] }."
            );
        }
    }

    return errors;
}

function validateCreateLocation(req, res, next) {
    if (!isPlainObject(req.body)) {
        return next(new AppError(400, "El cuerpo debe ser un objeto JSON."));
    }

    const errors = checkFields(req.body, true);
    if (errors.length > 0) {
        return next(new AppError(400, "Revisa los datos del puesto.", errors));
    }

    next();
}

function validateUpdateLocation(req, res, next) {
    if (!isPlainObject(req.body) || Object.keys(req.body).length === 0) {
        return next(new AppError(400, "Envía al menos un campo para actualizar."));
    }

    const errors = checkFields(req.body, false);
    if (errors.length > 0) {
        return next(new AppError(400, "Revisa los datos del puesto.", errors));
    }

    next();
}

// GET /api/locations?search=&category=&zone=  (vacío = sin filtro)
function validateLocationQuery(req, res, next) {
    const { search, category, zone } = req.query;
    const errors = findUnknownFields(req.query, ["search", "category", "zone"]);

    if (search !== undefined && typeof search !== "string") {
        errors.push("El parámetro 'search' debe ser texto.");
    }
    if (category !== undefined && category !== "" && !isValidId(category)) {
        errors.push("El parámetro 'category' debe ser un id válido.");
    }
    if (zone !== undefined && zone !== "" && !isValidId(zone)) {
        errors.push("El parámetro 'zone' debe ser un id válido.");
    }

    if (errors.length > 0) {
        return next(new AppError(400, "Revisa los filtros de búsqueda.", errors));
    }

    next();
}

module.exports = { validateCreateLocation, validateUpdateLocation, validateLocationQuery };
