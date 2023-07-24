const xmpp = require("node-xmpp-client");

const XMPP_DOMAIN = "alumchat.xyz";
const XMPP_USERNAME = "her20053";
const XMPP_PASSWORD = "Formula1!";

const client = new xmpp.Client({
    jid: XMPP_USERNAME + "@" + XMPP_DOMAIN,
    password: XMPP_PASSWORD,
});

// Evento que se activa cuando la conexión se establece correctamente.
client.on("online", function () {
    console.log("Conexión establecida.");

    // Cerrar la conexión después de un tiempo.
    setTimeout(() => {
        client.end();
    }, 5000);
});

// Evento que se activa cuando hay un error en la conexión.
client.on("error", function (err) {
    console.error("Error de conexión:", err);
});

// Evento que se activa cuando se cierra la conexión.
client.on("close", function () {
    console.log("Conexión cerrada.");
});

// Conectar al servidor XMPP
client.connect();
