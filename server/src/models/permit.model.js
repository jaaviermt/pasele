"use strict";

const mongoose = require("mongoose");

// Permiso municipal de un puesto.
const permitSchema = new mongoose.Schema(
    {
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location",
            required: true
        },
        folio: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: 30
        },
        vigenteHasta: {
            type: Date,
            required: true
        },
        cuota: {
            type: Number,
            required: true,
            min: 0
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

const Permit = mongoose.model("Permit", permitSchema);

module.exports = Permit;
