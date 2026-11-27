"use strict";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80
        },
        email: {
            type: String,
            required: true,
            unique: true, // índice único: no se repiten correos
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            select: false // nunca sale en las consultas salvo que se pida
        }
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            transform(doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.password; // el hash tampoco se envía al cliente
                return ret;
            }
        }
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
