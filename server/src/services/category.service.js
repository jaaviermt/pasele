"use strict";

const Category = require("../models/category.model");
const Location = require("../models/location.model");
const AppError = require("../utils/app-error");

// Compara sin distinguir mayúsculas ni acentos ("Ropa" = "ropa")
const SPANISH_CASE_INSENSITIVE = { locale: "es", strength: 1 };

async function ensureUniqueName(nombre, excludeId = null) {
    const filter = { nombre: nombre.trim() };
    if (excludeId) {
        filter._id = { $ne: excludeId };
    }

    const existing = await Category.findOne(filter).collation(SPANISH_CASE_INSENSITIVE);
    if (existing) {
        throw new AppError(400, `Ya existe un giro llamado "${existing.nombre}".`);
    }
}

async function list() {
    return Category.find().sort({ nombre: 1 });
}

async function getById(id) {
    const category = await Category.findById(id);

    if (!category) {
        throw new AppError(404, "No se encontró el giro.");
    }

    return category;
}

async function create(data) {
    await ensureUniqueName(data.nombre);

    return Category.create({
        nombre: data.nombre.trim(),
        color: data.color,
        icono: data.icono.trim()
    });
}

async function update(id, changes) {
    const category = await getById(id);

    if (changes.nombre !== undefined) {
        await ensureUniqueName(changes.nombre, category._id);
        category.nombre = changes.nombre.trim();
    }
    if (changes.color !== undefined) {
        category.color = changes.color;
    }
    if (changes.icono !== undefined) {
        category.icono = changes.icono.trim();
    }

    await category.save();
    return category;
}

async function remove(id) {
    const category = await getById(id);

    // Regla: no se borra un giro que todavía usan puestos
    const inUse = await Location.countDocuments({ category: category._id });
    if (inUse > 0) {
        throw new AppError(400, `No se puede borrar el giro: lo usan ${inUse} puesto(s).`);
    }

    await category.deleteOne();
    return category;
}

module.exports = { list, getById, create, update, remove };
