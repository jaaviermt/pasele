"use strict";

// Helpers de geometría para GeoJSON. Las posiciones son [longitud, latitud].

function isValidPosition(position) {
    return (
        Array.isArray(position) &&
        position.length === 2 &&
        position.every((value) => typeof value === "number" && Number.isFinite(value)) &&
        position[0] >= -180 && position[0] <= 180 && // longitud
        position[1] >= -90 && position[1] <= 90 // latitud
    );
}

function samePosition(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}

// GeoJSON exige que el anillo termine en el mismo punto donde empieza
function closeRing(ring) {
    const first = ring[0];
    const last = ring[ring.length - 1];
    return samePosition(first, last) ? ring : [...ring, first];
}

// Orientación de tres puntos: >0 giro a la izquierda, <0 a la derecha, 0 alineados
function orientation(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

// ¿El punto c está sobre el segmento a-b? (solo se usa cuando ya están alineados)
function onSegment(a, b, c) {
    return (
        Math.min(a[0], b[0]) <= c[0] && c[0] <= Math.max(a[0], b[0]) &&
        Math.min(a[1], b[1]) <= c[1] && c[1] <= Math.max(a[1], b[1])
    );
}

// Dos valores quedan en lados opuestos cuando uno es positivo y el otro negativo
function oppositeSigns(a, b) {
    return (a > 0 && b < 0) || (a < 0 && b > 0);
}

// ¿Los segmentos p1-p2 y p3-p4 se tocan o se cruzan?
function segmentsIntersect(p1, p2, p3, p4) {
    const d1 = orientation(p3, p4, p1);
    const d2 = orientation(p3, p4, p2);
    const d3 = orientation(p1, p2, p3);
    const d4 = orientation(p1, p2, p4);

    // Caso normal: cada segmento deja los extremos del otro en lados opuestos
    if (oppositeSigns(d1, d2) && oppositeSigns(d3, d4)) {
        return true;
    }

    // Casos especiales: un extremo cae justo sobre el otro segmento
    return (
        (d1 === 0 && onSegment(p3, p4, p1)) ||
        (d2 === 0 && onSegment(p3, p4, p2)) ||
        (d3 === 0 && onSegment(p1, p2, p3)) ||
        (d4 === 0 && onSegment(p1, p2, p4))
    );
}

// Recibe un anillo cerrado. Compara cada lado con los que no son sus vecinos:
// si alguno se toca, el polígono se cruza a sí mismo.
function hasSelfIntersection(closedRing) {
    const sides = closedRing.length - 1;

    for (let i = 0; i < sides; i++) {
        for (let j = i + 1; j < sides; j++) {
            const areNeighbors = j === i + 1 || (i === 0 && j === sides - 1);
            if (areNeighbors) {
                continue;
            }
            if (segmentsIntersect(closedRing[i], closedRing[i + 1], closedRing[j], closedRing[j + 1])) {
                return true;
            }
        }
    }

    return false;
}

// Área con la fórmula del zapato (shoelace). Si es 0, todos los puntos están en línea.
function ringArea(closedRing) {
    let sum = 0;
    for (let i = 0; i < closedRing.length - 1; i++) {
        const [x1, y1] = closedRing[i];
        const [x2, y2] = closedRing[i + 1];
        sum += x1 * y2 - x2 * y1;
    }
    return Math.abs(sum) / 2;
}

// Revisa un GeoJSON Polygon de un solo anillo. Devuelve un arreglo de errores (vacío = válido).
function validatePolygon(area) {
    if (!area || typeof area !== "object" || area.type !== "Polygon" || !Array.isArray(area.coordinates)) {
        return ["El área debe ser un GeoJSON Polygon."];
    }
    if (area.coordinates.length !== 1 || !Array.isArray(area.coordinates[0])) {
        return ["El polígono debe tener un solo anillo, sin huecos."];
    }

    const ring = area.coordinates[0];
    if (!ring.every(isValidPosition)) {
        return ["Cada vértice debe ser [longitud, latitud] con longitud entre -180 y 180 y latitud entre -90 y 90."];
    }

    const closed = ring.length > 0 ? closeRing(ring) : ring;
    if (closed.length < 4) {
        return ["El polígono necesita al menos 3 vértices distintos."];
    }
    // Primero el cruce: en un "moño" las dos mitades se restan y el área también da 0
    if (hasSelfIntersection(closed)) {
        return ["El polígono se cruza consigo mismo. Dibuja la zona sin que sus lados se crucen."];
    }
    if (ringArea(closed) === 0) {
        return ["Los vértices del polígono no pueden estar todos en línea."];
    }

    return [];
}

module.exports = { isValidPosition, closeRing, hasSelfIntersection, validatePolygon };
