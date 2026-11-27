"use strict";

const mongoose = require("mongoose");

// Comerciante que atiende uno o varios puestos
const vendorSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80
        },
        apodo: {
            type: String,
            trim: true,
            maxlength: 40,
            default: ""
        },
        telefono: {
            type: String,
            trim: true,
            match: /^(\d{10})?$/, // 10 dígitos o vacío
            default: ""
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

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
