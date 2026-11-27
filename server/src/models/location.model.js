"use strict";

const mongoose = require("mongoose");

// Puesto del tianguis. Su servicio y rutas se agregan en la fase 3;
// el modelo se necesita desde ya para las reglas de borrado y para Permit.
const locationSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80
        },
        descripcion: {
            type: String,
            required: true,
            trim: true,
            maxlength: 250
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            default: null
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        ubicacion: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            // GeoJSON: siempre [longitud, latitud]
            coordinates: {
                type: [Number],
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

locationSchema.index({ ubicacion: "2dsphere" });

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;
