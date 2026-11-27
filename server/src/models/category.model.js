"use strict";

const mongoose = require("mongoose");

// Giro del puesto (comida, ropa, frutas...)
const categorySchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 50
        },
        color: {
            type: String,
            required: true,
            match: /^#[0-9a-fA-F]{6}$/ // hexadecimal, ej. #e8201a
        },
        icono: {
            type: String,
            required: true,
            trim: true,
            maxlength: 10 // un emoji o texto corto, ej. "🌮"
        }
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            transform(doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                return ret;
            }
        }
    }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
