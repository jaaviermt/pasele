"use strict";

// Carga datos de prueba: un usuario, giros, comerciantes, 2 zonas, puestos en los
// tres estados y sus permisos.
//
//   npm run seed            -> solo si la base está vacía
//   npm run seed -- --reset -> BORRA todas las colecciones de la app y las vuelve a llenar
//
// Usa los mismos servicios que la API, así los datos pasan por las mismas reglas
// (anillo cerrado, folios únicos, contraseña cifrada con bcrypt).

const mongoose = require("mongoose");
const { connectDatabase } = require("./config/database");

const User = require("./models/user.model");
const Category = require("./models/category.model");
const Vendor = require("./models/vendor.model");
const Location = require("./models/location.model");
const Zone = require("./models/zone.model");
const Permit = require("./models/permit.model");

const userService = require("./services/user.service");
const categoryService = require("./services/category.service");
const vendorService = require("./services/vendor.service");
const zoneService = require("./services/zone.service");
const locationService = require("./services/location.service");
const permitService = require("./services/permit.service");

// Usuario de prueba para la revisión (también aparece en el README)
const TEST_USER = { nombre: "Lupita Revisora", email: "demo@pasele.mx", password: "Pasele2026" };

const MODELS = [Permit, Location, Zone, Vendor, Category, User];

// Fecha "AAAA-MM-DD" a N días de hoy (en horario de México), para que los permisos
// sigan vigentes o vencidos durante todo el periodo de revisión
function daysFromToday(days) {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}

// Rectángulo como anillo GeoJSON [longitud, latitud]
function rectangle(west, south, east, north) {
    return [[west, south], [east, south], [east, north], [west, north]];
}

async function seed() {
    const reset = process.argv.includes("--reset");

    const counts = await Promise.all(MODELS.map((model) => model.countDocuments()));
    if (counts.some((count) => count > 0) && !reset) {
        console.log("La base ya tiene datos. No se cargó nada.");
        console.log("Para borrar TODO y cargar los datos de prueba: npm run seed -- --reset");
        return;
    }

    if (reset) {
        for (const model of MODELS) {
            await model.deleteMany({});
        }
        console.log("Colecciones vaciadas.");
    }

    // Índices (2dsphere, únicos) por si la base es nueva
    await Promise.all(MODELS.map((model) => model.syncIndexes()));

    // 1. Usuario
    const { user } = await userService.register(TEST_USER);

    // 2. Giros
    const giros = {};
    for (const data of [
        { nombre: "Antojitos", color: "#d81e0e", icono: "🌮" },
        { nombre: "Frutas y verduras", color: "#1f8a4c", icono: "🍉" },
        { nombre: "Ropa y paca", color: "#1638d6", icono: "👕" },
        { nombre: "Fierros viejos", color: "#6b4a2b", icono: "🔧" },
        { nombre: "Dulces típicos", color: "#c21bd6", icono: "🍬" }
    ]) {
        giros[data.nombre] = await categoryService.create(data);
    }

    // 3. Comerciantes
    const comerciantes = {};
    for (const data of [
        { nombre: "Rosa María Hernández", apodo: "Doña Rosy", telefono: "4771234567" },
        { nombre: "José Luis Pérez", apodo: "El Güero", telefono: "4777654321" },
        { nombre: "Marisol Cruz", apodo: "La Mari", telefono: "4772223333" },
        { nombre: "Ernesto Ramírez", apodo: "Don Neto", telefono: "" }
    ]) {
        comerciantes[data.nombre] = await vendorService.create(data);
    }

    // 4. Zonas (León, Gto.)
    await zoneService.create({
        nombre: "Tianguis del Centro",
        dias: ["martes", "viernes"],
        area: { type: "Polygon", coordinates: [rectangle(-101.690, 21.118, -101.676, 21.130)] }
    });
    await zoneService.create({
        nombre: "Tianguis de San Juan",
        dias: ["sabado", "domingo"],
        area: { type: "Polygon", coordinates: [rectangle(-101.668, 21.112, -101.659, 21.119)] }
    });

    // 5. Puestos. permiso: "vigente" | "vencido" | null (sin permiso)
    //    Dentro de zona + vigente = en regla; dentro sin vigente = permiso vencido; fuera = fuera de zona
    const puestos = [
        { nombre: "Tacos El Compa", descripcion: "Suadero, longaniza y campechanos", giro: "Antojitos", comerciante: "José Luis Pérez", lng: -101.6840, lat: 21.1230, permiso: "vigente" },
        { nombre: "Frutas La Güera", descripcion: "Mango, papaya y sandía de temporada", giro: "Frutas y verduras", comerciante: "Rosa María Hernández", lng: -101.6800, lat: 21.1260, permiso: "vigente" },
        { nombre: "Dulces Tía Chabe", descripcion: "Cocadas, alegrías y jamoncillo", giro: "Dulces típicos", comerciante: null, lng: -101.6640, lat: 21.1160, permiso: "vigente" },
        { nombre: "La Paca de Mari", descripcion: "Ropa americana a $20 y $50", giro: "Ropa y paca", comerciante: "Marisol Cruz", lng: -101.6860, lat: 21.1270, permiso: "vencido" },
        { nombre: "Quesadillas Lupe", descripcion: "Con y sin queso, de comal", giro: "Antojitos", comerciante: null, lng: -101.6620, lat: 21.1150, permiso: null },
        { nombre: "Verduras Don Chuy", descripcion: "Jitomate, cebolla y chiles", giro: "Frutas y verduras", comerciante: null, lng: -101.6780, lat: 21.1200, permiso: "vencido" },
        { nombre: "Fierros Don Neto", descripcion: "Herramienta usada y refacciones", giro: "Fierros viejos", comerciante: "Ernesto Ramírez", lng: -101.6720, lat: 21.1340, permiso: "vigente" },
        { nombre: "Elotes La Esquina", descripcion: "Elotes y esquites con todo", giro: "Antojitos", comerciante: null, lng: -101.6950, lat: 21.1150, permiso: null }
    ];

    let folio = 1;
    for (const puesto of puestos) {
        const location = await locationService.create({
            nombre: puesto.nombre,
            descripcion: puesto.descripcion,
            category: giros[puesto.giro].id,
            vendor: puesto.comerciante ? comerciantes[puesto.comerciante].id : null,
            ubicacion: { type: "Point", coordinates: [puesto.lng, puesto.lat] }
        }, user._id);

        if (puesto.permiso) {
            await permitService.create({
                location: location.id,
                folio: `TNG-2026-${String(folio++).padStart(4, "0")}`,
                vigenteHasta: puesto.permiso === "vigente" ? daysFromToday(365) : daysFromToday(-30),
                cuota: puesto.permiso === "vigente" ? 450 : 380
            });
        }
    }

    // Resumen con el estado calculado por el servicio
    const locations = await locationService.list();
    const byState = locations.reduce((acc, location) => {
        acc[location.estado] = (acc[location.estado] || 0) + 1;
        return acc;
    }, {});

    console.log("Datos de prueba cargados:");
    console.log(`  ${Object.keys(giros).length} giros, ${Object.keys(comerciantes).length} comerciantes, 2 zonas, ${locations.length} puestos`);
    console.log("  Estados:", byState);
    console.log(`  Usuario de prueba: ${TEST_USER.email} / ${TEST_USER.password}`);
}

connectDatabase()
    .then(seed)
    .catch((error) => {
        console.error("Error al cargar los datos:", error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
