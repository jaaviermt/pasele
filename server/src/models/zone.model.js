"use strict";

const mongoose = require("mongoose");

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

// Zona donde se pone un tianguis.
const zoneSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 80
        },
        dias: {
            type: [{ type: String, enum: DIAS }],
            default: []
        },
        area: {
            type: {
                type: String,
                enum: ["Polygon"],
                default: "Polygon"
            },
            // Un anillo cerrado de posiciones [longitud, latitud]
            coordinates: {
                type: [[[Number]]],
                required: true
            }
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

zoneSchema.index({ area: "2dsphere" });

const Zone = mongoose.model("Zone", zoneSchema);

module.exports = Zone;
module.exports.DIAS = DIAS;
