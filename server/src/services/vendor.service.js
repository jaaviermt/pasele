"use strict";

const Vendor = require("../models/vendor.model");
const Location = require("../models/location.model");
const AppError = require("../utils/app-error");

async function list() {
    return Vendor.find().sort({ nombre: 1 });
}

async function getById(id) {
    const vendor = await Vendor.findById(id);

    if (!vendor) {
        throw new AppError(404, "No se encontró el comerciante.");
    }

    return vendor;
}

async function create(data) {
    return Vendor.create({
        nombre: data.nombre.trim(),
        apodo: (data.apodo || "").trim(),
        telefono: (data.telefono || "").trim()
    });
}

async function update(id, changes) {
    const vendor = await getById(id);

    if (changes.nombre !== undefined) {
        vendor.nombre = changes.nombre.trim();
    }
    if (changes.apodo !== undefined) {
        vendor.apodo = changes.apodo.trim();
    }
    if (changes.telefono !== undefined) {
        vendor.telefono = changes.telefono.trim();
    }

    await vendor.save();
    return vendor;
}

async function remove(id) {
    const vendor = await getById(id);

    // Regla: no se borra un comerciante que atiende puestos
    const inUse = await Location.countDocuments({ vendor: vendor._id });
    if (inUse > 0) {
        throw new AppError(400, `No se puede borrar el comerciante: atiende ${inUse} puesto(s).`);
    }

    await vendor.deleteOne();
    return vendor;
}

module.exports = { list, getById, create, update, remove };
