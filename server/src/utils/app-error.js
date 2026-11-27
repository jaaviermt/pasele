"use strict";

// Error con código HTTP. Los servicios y middlewares lanzan AppError
// y el errorHandler lo convierte en la respuesta JSON.
class AppError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.details = details; // arreglo de mensajes o null
    }
}

module.exports = AppError;
