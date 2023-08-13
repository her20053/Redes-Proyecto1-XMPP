const { client, xml } = require("@xmpp/client");
const readline = require("readline");
const debug = require("@xmpp/debug");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

class ClienteXMPP {
    constructor(username, password, service = "xmpp://alumchat.xyz:5222", domain = "alumchat.xyz") {
        this.username = username;
        this.password = password;
        this.service = service;
        this.domain = domain;
        this.xmpp = null;
        this.usuariosEnLinea = [];
        this.mensajes = {}; // Guardar mensajes aquí
    }

    async conectar() {
        this.xmpp = client({
            service: this.service,
            domain: this.domain,
            username: this.username,
            password: this.password,
        });

        this.xmpp.on("error", (err) => {
            console.error(err);
        });

        this.xmpp.on("online", async () => {
            await this.xmpp.send(xml("presence"));
        });

        this.xmpp.on("stanza", (stanza) => {

            //console.log("Estrofa recibida: ", stanza.toString());

            if (stanza.is("presence") && stanza.attrs.type !== 'unavailable') {
                this.usuariosEnLinea.push(stanza.attrs.from.split("@")[0]);
            }

            if (stanza.is("message")) {
                const from = stanza.attrs.from;
                const body = stanza.getChild("body");
                if (!body) {
                    return;
                }
                const mensaje = body.text();
                if (!this.mensajes[from]) {
                    this.mensajes[from] = [];
                }
                this.mensajes[from].push(mensaje);
                console.log("Mensaje almacenado de " + from + ": " + mensaje);
            }
        });

        await this.xmpp.start().catch(console.error);
    }

    async enviarMensaje(destinatario, mensaje) {
        if (!this.xmpp) {
            throw new Error("El cliente XMPP no está conectado. Primero llama al método 'conectar()'.");
        }

        const message = xml(
            "message",
            { type: "chat", to: destinatario },
            xml("body", {}, mensaje)
        );

        await this.xmpp.send(message);
    }

    async obtenerUsuariosEnLinea() {
        this.usuariosEnLinea = [];
        this.xmpp.on("stanza", (stanza) => {
            if (stanza.is("presence") && stanza.attrs.type !== 'unavailable') {
                this.usuariosEnLinea.push(stanza.attrs.from.split("@")[0]);
            }
        });
        await this.xmpp.send(xml("presence"));

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.usuariosEnLinea);
            }, 2000);  // Espera un poco para recibir respuestas antes de resolver la promesa
        });
    }

    async mostrarMensajes() {
        if (!this.xmpp) {
            throw new Error("El cliente XMPP no está conectado. Primero llama al método 'conectar()'.");
        }

        console.log("Mensajes:");
        for (const usuario in this.mensajes) {
            console.log(`De ${usuario}:`);
            for (const mensaje of this.mensajes[usuario]) {
                console.log(`  - ${mensaje}`);
            }
        }
    }

    // Add a method to disconnect from XMPP
    async desconectar() {
        if (this.xmpp) {
            await this.xmpp.stop();
            this.xmpp = null;
            console.log("Desconectado del servidor XMPP.");
        }
    }
}

// Function to read user input from the command line
function leerEntrada(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Create the client outside the menu function so it's always connected
const cliente = new ClienteXMPP("her20053", "Formula1!");
cliente.conectar().catch(console.error);

async function menu() {
    console.log("[ * ] Bienvenido al cliente XMPP!");
    console.log("[ 1 ] Enviar mensaje");
    console.log("[ 2 ] Mostrar mensajes");
    console.log("[ 3 ] Mostrar usuarios en línea"); // Nueva opción
    console.log("[ 4 ] Salir.");

    const opcion = await leerEntrada("Opcion: ");

    if (opcion === "1") {
        const destinatario = await leerEntrada("Ingrese el nombre de usuario del destinatario: ");
        const mensaje = await leerEntrada("Ingrese el mensaje: ");

        await cliente.enviarMensaje(destinatario, mensaje);
        console.log("Mensaje enviado correctamente.");
    } else if (opcion === "2") {
        await cliente.mostrarMensajes();
    } else if (opcion === "3") { // Opción para mostrar usuarios en línea
        const usuariosEnLinea = await cliente.obtenerUsuariosEnLinea();
        console.log("Usuarios en línea: ", usuariosEnLinea.join(', '));
    } else if (opcion === "4") { // Cambiado de 3 a 4
        await cliente.desconectar();
        process.exit(0); // Exit the application with success code
    } else {
        console.log("Opción inválida. Intente nuevamente.");
    }

    // After handling the chosen option, display the menu again
    await menu();
}

// Call the menu function to start the application
menu().catch((error) => {
    console.error("Error:", error);
});