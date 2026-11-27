"use strict";

const Permit = require("../models/permit.model");
const Location = require("../models/location.model");
const AppError = require("../utils/app-error");

// populate: en lugar del ObjectId del puesto se devuelve su nombre
const LOCATION_FIELDS = "nombre";

async function ensureLocationExists(locationId) {
    const exists = await Location.exists({ _id: locationId });
    if (!exists) {
        throw new AppError(400, "El puesto indicado no existe.");
    }
}

async function ensureUniqueFolio(folio, excludeId = null) {
    const filter = { folio: folio.trim().toUpperCase() };
    if (excludeId) {
        filter._id = { $ne: excludeId };
    }

    if (await Permit.exists(filter)) {
        throw new AppError(400, `Ya existe un permiso con el folio ${filter.folio}.`);
    }
}

async function list() {
    return Permit.find().populate("location", LOCATION_FIELDS).sort({ vigenteHasta: 1 });
}

async function getById(id) {
    const permit = await Permit.findById(id).populate("location", LOCATION_FIELDS);

    if (!permit) {
        throw new AppError(404, "No se encontró el permiso.");
    }

    return permit;
}

async function create(data) {
    await ensureLocationExists(data.location);
    await ensureUniqueFolio(data.folio);

    const permit = await Permit.create({
        location: data.location,
        folio: data.folio,
        vigenteHasta: data.vigenteHasta,
        cuota: Number(data.cuota)
    });

    return permit.populate("location", LOCATION_FIELDS);
}

async function update(id, changes) {
    const permit = await getById(id);

    if (changes.location !== undefined) {
        await ensureLocationExists(changes.location);
        permit.location = changes.location;
    }
    if (changes.folio !== undefined) {
        await ensureUniqueFolio(changes.folio, permit._id);
        permit.folio = changes.folio;
    }
    if (changes.vigenteHasta !== undefined) {
        permit.vigenteHasta = changes.vigenteHasta;
    }
    if (changes.cuota !== undefined) {
        permit.cuota = Number(changes.cuota);
    }

    await permit.save();
    return permit.populate("location", LOCATION_FIELDS);
}

async function remove(id) {
    const permit = await getById(id);
    await permit.deleteOne();
    return permit;
}

module.exports = { list, getById, create, update, remove };
