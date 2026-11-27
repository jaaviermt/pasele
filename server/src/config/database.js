"use strict";

const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
    if (!env.mongodbUri) {
        throw new Error("Falta la variable MONGODB_URI en el .env");
    }

    await mongoose.connect(env.mongodbUri);
    console.log(`MongoDB conectado a la base: ${mongoose.connection.name}`);
}

module.exports = { connectDatabase };
