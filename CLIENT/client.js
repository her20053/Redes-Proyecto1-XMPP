// Jose Andres Hernandez Guerra 20053
// Cliente para el servidor de chat en Node.js

// Importar librerías
const { client, xml } = require("@xmpp/client");
const { v4: uuidv4 } = require('uuid');
const debug = require("@xmpp/debug");
const mime = require('mime-types');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Desactivar las comprobaciones de certificados TLS 
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

class SimpleXMPPClient {

    constructor() {
        this.service = "xmpp://alumchat.xyz:5222";
        this.domain = "alumchat.xyz";
        this.username = null;
        this.password = null;
        this.xmpp = null;
    }

    displaySubMenu() {
        console.log('\n¿Qué deseas hacer?');
        console.log('[1] Mostrar todos los usuarios/contactos y su estado');
        console.log('[2] Agregar un usuario a los contactos');
        console.log('[3] Mostrar detalles de contacto de un usuario');
        console.log('[4] Comunicación 1 a 1 con cualquier usuario/contacto');
        console.log('[5] Participar en conversaciones grupales');
        console.log('[6] Definir mensaje de presencia');
        console.log('[7] Enviar/recibir notificaciones');
        console.log('[8] Enviar/recibir archivos');
        console.log('[9] Regresar al menú principal');

        rl.question('\nTu elección: ', (answer) => {
            switch (answer) {
                case '1':
                    // Llamar a la función para mostrar todos los usuarios
                    break;
                case '2':
                    // Llamar a la función para agregar un usuario
                    break;
                // ... (Así sucesivamente para cada opción)
                case '9':
                    displayMenu();
                    break;
                default:
                    console.log('\nOpción no válida. Inténtalo de nuevo.');
                    this.displaySubMenu();
                    break;
            }
        });
    }

    // Método para conectarse al servidor XMPP
    async connect(username, password) {
        this.username = username;
        this.password = password;

        this.xmpp = client({
            service: this.service,
            domain: this.domain,
            username: this.username,
            password: this.password,
        });

        // Manejar errores de conexión
        this.xmpp.on('error', err => {
            console.error('Error:', err);
        });

        // Manejar conexión exitosa
        this.xmpp.on('online', address => {
            console.log('\n + Conectado exitosamente como:', address.toString());
        });

        // Intentar conectarse
        try {
            await this.xmpp.start();
            console.log('\n + Conexión iniciada...');
        } catch (err) {
            console.error('\n - Error al establecer la conexión:', err);
        }
    }

    // Método para registrar un nuevo usuario
    async register(username, password) {
        return new Promise(async (resolve, reject) => {
            if (this.xmpp) {
                reject(new Error('Ya existe una conexión.'));
                return;
            }

            this.username = username;
            this.password = password;

            console.log('\n + Registrando usuario...');
            console.log(' > Nombre de usuario  :', this.username);
            console.log(" > Contraseña         :", this.password);
            console.log(" > Correo             :", (this.username + '@prueba_her20053.com'))

            this.xmpp = client({
                service: this.service,
                domain: this.domain,
                username: this.username,
                password: this.password,
            });

            try {
                await this.xmpp.start();
            } catch (err) {
                reject(new Error('Error al establecer la conexión.'));
            }

            const registerStanza = xml(
                'iq',
                { type: 'set', id: 'register' },
                xml('query', { xmlns: 'jabber:iq:register' },
                    xml('username', {}, username),
                    xml('password', {}, password),
                    xml('email', {}, (username + '@prueba_her20053.com')))
            );

            this.xmpp.send(registerStanza).then(() => {
                resolve();
            }).catch((err) => {
                reject(new Error('Error al registrar el usuario.'));
            });
        });
    }




}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const displayMenu = () => {


    console.log('\nSeleccione una opción:');
    console.log('1. Crear una cuenta');
    console.log('2. Iniciar sesión');
    console.log('3. Salir');

    rl.question('\nTu elección: ', (answer) => {

        switch (answer) {

            case '1':
                rl.question('\nNombre de usuario (para registro): ', username => {
                    rl.question('Contraseña (para registro): ', password => {
                        const myClient = new SimpleXMPPClient();
                        myClient.register(username, password)
                            .then(() => {
                                console.log('Usuario registrado exitosamente.');
                                displayMenu();
                            })
                            .catch(err => {
                                console.error('Error al registrar:', err.message);
                                displayMenu();
                            });
                    });
                });
                break;



            case '2':
                rl.question('\nNombre de usuario: ', username => {
                    rl.question('Contraseña: ', password => {
                        const myClient = new SimpleXMPPClient();
                        myClient.connect(username, password)
                            .then(() => {
                                myClient.displaySubMenu();
                            })
                            .catch(err => {
                                console.error('Error al iniciar sesión:', err.message);
                                displayMenu();
                            });
                        rl.close();
                    });
                });
                break;



            case '3':
                console.log('\nAdiós!');
                rl.close();
                break;
            default:
                console.log('\nOpción no válida. Inténtalo de nuevo.');
                displayMenu();
                break;



        }
    });
};

displayMenu();
