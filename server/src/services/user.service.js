"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const AppError = require("../utils/app-error");
const env = require("../config/env");

const SALT_ROUNDS = 10;

function createToken(user) {
    // "sub" (subject) guarda el id del usuario dueño del token
    return jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

async function register({ nombre, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
        throw new AppError(400, "Ya existe una cuenta con ese correo.");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
        nombre: nombre.trim(),
        email: normalizedEmail,
        password: passwordHash
    });

    return { user, token: createToken(user) };
}

async function login({ email, password }) {
    // +password: el campo tiene select:false, aquí sí lo necesitamos para comparar
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

    // Mismo mensaje si no existe el correo o si falla la contraseña,
    // para no revelar qué correos están registrados
    const isValid = user && (await bcrypt.compare(password, user.password));
    if (!isValid) {
        throw new AppError(401, "Correo o contraseña incorrectos.");
    }

    return { user, token: createToken(user) };
}

async function getById(id) {
    const user = await User.findById(id);

    if (!user) {
        throw new AppError(404, "No se encontró el usuario.");
    }

    return user;
}

module.exports = { register, login, getById };
