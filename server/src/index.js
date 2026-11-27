"use strict";

const app = require("./app");
const env = require("./config/env");

app.listen(env.port, () => {
    console.log(`Servidor de ¡Pásele! en http://localhost:${env.port}`);
    console.log(`Salud:  http://localhost:${env.port}/api/health`);
});
