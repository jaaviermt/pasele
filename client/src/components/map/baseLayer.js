// Fondo del mapa. Leaflet dibuja las teselas del estilo "light-v11" de Mapbox.
// Si no hay token (VITE_MAPBOX_TOKEN), usa OpenStreetMap para que la app siga funcionando.

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const MAPBOX_STYLE = 'mapbox/light-v11'

export const BASE_LAYER = MAPBOX_TOKEN
  ? {
      url: `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE}/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`,
      // Las teselas de Mapbox miden 512 px: zoomOffset -1 las alinea con la cuadrícula de Leaflet
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 20,
      // Atribución obligatoria de Mapbox y OpenStreetMap
      attribution:
        '© <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a> ' +
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> ' +
        '<strong><a href="https://apps.mapbox.com/feedback/" target="_blank" rel="noopener">Mejorar este mapa</a></strong>',
    }
  : {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      tileSize: 256,
      zoomOffset: 0,
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }
