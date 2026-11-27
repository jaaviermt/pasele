"use strict";

const mongoose = require("mongoose");
const AppError = require("../utils/app-error");

// Se ejecuta cuando ninguna ruta coincidió
function notFound(req, res, next) {
    next(new AppError(404, `No existe la ruta ${req.method} ${req.originalUrl}.`));
}

// Manejo centralizado: todo error termina aquí y sale con el mismo formato
function errorHandler(err, req, res, next) {
    let error = err;

    // JSON mal escrito en el cuerpo de la petición
    if (err.type === "entity.parse.failed") {
        error = new AppError(400, "El cuerpo de la petición no es un JSON válido.");
    }

    // Cuerpo demasiado grande (por ejemplo, un polígono con demasiados vértices)
    else if (err.type === "entity.too.large") {
        error = new AppError(413, "La petición es demasiado grande.");
    }

    // Reglas del esquema de Mongoose (required, maxlength, enum...)
    else if (err instanceof mongoose.Error.ValidationError) {
        const details = Object.values(err.errors).map((item) => item.message);
        error = new AppError(400, "Datos inválidos.", details);
    }

    // Id mal formado o tipo incorrecto (ej. texto donde va un número)
    else if (err instanceof mongoose.Error.CastError) {
        error = err.path === "_id"
            ? new AppError(400, "El id enviado no es válido.")
            : new AppError(400, `Valor inválido para el campo '${err.path}'.`);
    }

    // Índice único violado (ej. dos peticiones con el mismo correo a la vez)
    else if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "campo";
        error = new AppError(400, `Ya existe un registro con ese valor de '${field}'.`);
    }

    // MongoDB no pudo indexar la geometría (ej. polígono inválido que pasó la validación)
    else if (err.code === 16755) {
        error = new AppError(400, "La geometría enviada no es válida.");
    }

    else if (!(err instanceof AppError)) {
        // Error no previsto: se registra completo, pero al cliente no se le dan detalles
        console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
        console.error(err);
        error = new AppError(500, "Ocurrió un error interno en el servidor.");
    }

    res.status(error.statusCode).json({
        error: {
            status: error.statusCode,
            message: error.message,
            details: error.details
        }
    });
}

module.exports = { notFound, errorHandler };
