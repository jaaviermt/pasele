"use strict";

const Zone = require("../models/zone.model");
const AppError = require("../utils/app-error");
const { closeRing } = require("../utils/geo");

// Compara sin distinguir mayúsculas ni acentos
const SPANISH_CASE_INSENSITIVE = { locale: "es", strength: 1 };

async function list() {
    return Zone.find().sort({ nombre: 1 });
}

async function getById(id) {
    const zone = await Zone.findById(id);

    if (!zone) {
        throw new AppError(404, "No se encontró la zona.");
    }

    return zone;
}

async function create(data) {
    const nombre = data.nombre.trim();

    const existing = await Zone.findOne({ nombre }).collation(SPANISH_CASE_INSENSITIVE);
    if (existing) {
        throw new AppError(400, `Ya existe una zona llamada "${existing.nombre}".`);
    }

    return Zone.create({
        nombre,
        dias: [...new Set(data.dias || [])], // sin días repetidos
        area: {
            type: "Polygon",
            // Si el anillo no viene cerrado (primer punto = último), aquí se cierra
            coordinates: [closeRing(data.area.coordinates[0])]
        }
    });
}

async function remove(id) {
    const zone = await getById(id);
    await zone.deleteOne();
    return zone;
}

module.exports = { list, getById, create, remove };
