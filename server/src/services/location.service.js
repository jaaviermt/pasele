"use strict";

const Location = require("../models/location.model");
const Category = require("../models/category.model");
const Vendor = require("../models/vendor.model");
const Permit = require("../models/permit.model");
const Zone = require("../models/zone.model");
const AppError = require("../utils/app-error");
const zoneService = require("./zone.service");

// La fecha "de hoy" se toma en horario de México, aunque el server corra en UTC
const TIME_ZONE = "America/Mexico_City";

// Con populate, la tabla recibe nombres en lugar de ObjectId
const POPULATE = [
    { path: "category", select: "nombre color icono" },
    { path: "vendor", select: "nombre apodo telefono" },
    { path: "createdBy", select: "nombre" }
];

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Hoy a las 00:00 UTC; así se compara con vigenteHasta, que se guarda igual
function startOfToday() {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
    return new Date(`${today}T00:00:00Z`);
}

// Agrega "estado" a cada puesto. No se guarda: se calcula cada vez.
//   fuera_de_zona   -> el punto no cae en ninguna zona
//   permiso_vencido -> está en zona, pero sin permiso vigente
//   en_regla        -> en zona y con permiso vigente
async function addEstado(locations) {
    const ids = locations.map((location) => location._id);

    // 1. ¿Qué puestos caen dentro de alguna zona? Una consulta por zona.
    const inZone = new Set();
    const zones = await Zone.find();
    for (const zone of zones) {
        const idsInside = await Location.find({
            _id: { $in: ids },
            ubicacion: { $geoWithin: { $geometry: zone.area } }
        }).distinct("_id");
        idsInside.forEach((id) => inZone.add(id.toString()));
    }

    // 2. ¿Qué puestos tienen al menos un permiso vigente?
    const withPermit = await Permit.distinct("location", {
        location: { $in: ids },
        vigenteHasta: { $gte: startOfToday() }
    });
    const vigentes = new Set(withPermit.map((id) => id.toString()));

    return locations.map((location) => {
        const id = location._id.toString();
        let estado = "fuera_de_zona";
        if (inZone.has(id)) {
            estado = vigentes.has(id) ? "en_regla" : "permiso_vencido";
        }
        return { ...location.toJSON(), estado };
    });
}

async function ensureCategoryExists(categoryId) {
    if (!(await Category.exists({ _id: categoryId }))) {
        throw new AppError(400, "El giro indicado no existe.");
    }
}

async function ensureVendorExists(vendorId) {
    if (!(await Vendor.exists({ _id: vendorId }))) {
        throw new AppError(400, "El comerciante indicado no existe.");
    }
}

// Filtros: search (nombre parcial), category (id del giro), zone (id de la zona)
async function list(filters = {}) {
    const query = {};

    const search = (filters.search || "").trim();
    if (search) {
        // "i" = sin distinguir mayúsculas; escapeRegex evita que "." o "(" rompan la búsqueda
        query.nombre = { $regex: escapeRegex(search), $options: "i" };
    }

    if (filters.category) {
        query.category = filters.category;
    }

    if (filters.zone) {
        const zone = await zoneService.getById(filters.zone);
        query.ubicacion = { $geoWithin: { $geometry: zone.area } };
    }

    const locations = await Location.find(query).populate(POPULATE).sort({ createdAt: -1 });
    return addEstado(locations);
}

async function findDocument(id) {
    const location = await Location.findById(id);

    if (!location) {
        throw new AppError(404, "No se encontró el puesto.");
    }

    return location;
}

// Devuelve el puesto con populate y estado, listo para el cliente
async function getById(id) {
    const location = await findDocument(id);
    await location.populate(POPULATE);
    const [withEstado] = await addEstado([location]);
    return withEstado;
}

async function create(data, userId) {
    await ensureCategoryExists(data.category);
    if (data.vendor) {
        await ensureVendorExists(data.vendor);
    }

    const location = await Location.create({
        nombre: data.nombre.trim(),
        descripcion: data.descripcion.trim(),
        category: data.category,
        vendor: data.vendor || null,
        createdBy: userId,
        ubicacion: {
            type: "Point",
            coordinates: data.ubicacion.coordinates // [longitud, latitud]
        }
    });

    return getById(location._id);
}

async function update(id, changes) {
    const location = await findDocument(id);

    if (changes.nombre !== undefined) {
        location.nombre = changes.nombre.trim();
    }
    if (changes.descripcion !== undefined) {
        location.descripcion = changes.descripcion.trim();
    }
    if (changes.category !== undefined) {
        await ensureCategoryExists(changes.category);
        location.category = changes.category;
    }
    if (changes.vendor !== undefined) {
        // null o "" quita al comerciante
        if (changes.vendor) {
            await ensureVendorExists(changes.vendor);
        }
        location.vendor = changes.vendor || null;
    }
    if (changes.ubicacion !== undefined) {
        location.ubicacion = { type: "Point", coordinates: changes.ubicacion.coordinates };
    }

    await location.save();
    return getById(location._id);
}

async function remove(id) {
    const location = await getById(id);

    // Regla: al borrar un puesto se borran también sus permisos
    const { deletedCount } = await Permit.deleteMany({ location: id });
    await Location.deleteOne({ _id: id });

    return { ...location, permisosEliminados: deletedCount };
}

module.exports = { list, getById, create, update, remove };
