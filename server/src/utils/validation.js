"use strict";

const mongoose = require("mongoose");

// Helpers pequeños que usan todos los validadores.

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim() !== "";
}

function isValidId(value) {
    return typeof value === "string" && mongoose.isValidObjectId(value);
}

// Devuelve un arreglo con un mensaje si llegan campos fuera de la lista
function findUnknownFields(body, allowedFields) {
    const unknown = Object.keys(body).filter((field) => !allowedFields.includes(field));
    return unknown.length > 0 ? [`Campos no permitidos: ${unknown.join(", ")}.`] : [];
}

module.exports = { isPlainObject, isNonEmptyString, isValidId, findUnknownFields };
