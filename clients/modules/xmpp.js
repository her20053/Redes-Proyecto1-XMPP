
const { client, xml } = require("@xmpp/client");
const debug = require("@xmpp/debug");
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


class Client {
    constructor() {
        this.username = null;
        this.password = null;
        this.service = "xmpp://alumchat.xyz:5222";
        this.domain = "alumchat.xyz";
        this.xmpp = null;
        this.notifications = new Set();
        this.receiveNotifications = false;

    }

    async getContacts() {
        /**
         * Fetches the list of contacts for the currently logged in user.
         * 
         * @returns {Promise} Resolves with a list of contacts, rejects on error.
         */
        return new Promise((resolve, reject) => {
            if (!this.xmpp) {
                reject(new Error("There is no active connection."));
            }

            // creando la stanza para obtener los contactos
            const rosterStanza = xml(
                'iq',
                { type: 'get', id: 'roster' },
                xml('query', { xmlns: 'jabber:iq:roster' })
            );

            // Enviar la stanza al servidor
            this.xmpp.send(rosterStanza).catch((err) => {
                reject(new Error('There was an error fetching the contacts.'));
            });

            // Evento para recibir la respuesta del roster del servidor
            this.xmpp.on('stanza', (stanza) => {
                if (stanza.is('iq') && stanza.attrs.type === 'result') {
                    const query = stanza.getChild('query', 'jabber:iq:roster');
                    if (query) {
                        const contacts = query.getChildren('item');

                        let contactList = [];
                        contacts.forEach((contact) => {
                            const jid = contact.attrs.jid;
                            const name = contact.attrs.name || jid;
                            const subscription = contact.attrs.subscription;

                            // Obtener el estado de presencia del contacto (si está disponible)
                            const presence = this.xmpp.presences && this.xmpp.presences[jid];
                            const status = presence && presence.status ? presence.status : 'Offline';

                            contactList.push({ jid, name, subscription, status });
                        });

                        resolve(contactList);
                    }
                }
            });
        });
    }

    async logout() {
        /**
         * Logs out the current user from the XMPP server.
         * 
         * @returns {Promise} Resolves on successful logout, rejects on error.
         */
        if (!this.xmpp) {
            throw new Error("There is no active connection.");
        }

        await this.xmpp.stop();
        this.xmpp = null;
        this.username = null;
        this.password = null;
    }

    async deleteAccount() {
        /**
        * Deletes the account of the currently logged in user.
        * 
        * @returns {Promise} Resolves on successful deletion, rejects on error.
        */
        return new Promise((resolve, reject) => {
            if (!this.xmpp) {
                reject(new Error("There is no active connection."));
            }

            // creando la stanza para eliminar cuenta
            const deleteStanza = xml(
                'iq',
                { type: 'set', id: 'delete' },
                xml('query', { xmlns: 'jabber:iq:register' },
                    xml('remove')
                )
            );

            // Enviar la stanza al servidor
            this.xmpp.send(deleteStanza).then(async () => {
                await this.xmpp.stop();
                this.xmpp = null;
                this.username = null;
                this.password = null;
                resolve();
            }).catch((err) => {
                reject(new Error('There was an error deleting the account.'));
            });

            this.xmpp.on('error', (err) => {
                console.log('There was an error deleting the account.');
            });
        });
    }

    async getPresence(jid, timeout = 2000, delay = 500) {
        /**
         * Fetches the presence status of the currently logged in user.
         * 
         * @returns {Promise} Resolves with the presence status, rejects on error.
         */
        return new Promise((resolve, reject) => {
            if (!this.xmpp) {
                reject(new Error("There is no active connection."));
            }
            const probeStanza = xml(
                "presence",
                { type: "probe", to: jid }
            );

            this.xmpp
                .send(probeStanza)
                .then(() => {
                })
                .catch((err) => {
                    console.error("Error at", err);
                    reject(new Error("There was an error sending the presence probe."));
                });

            const timeoutId = setTimeout(() => {
                reject(new Error("There was an error sending the presence probe."));
            }, timeout);

            let presence = null;

            this.xmpp.on("stanza", (stanza) => {
                if (stanza.is("presence")) {
                    const from = stanza.attrs.from;
                    const fromJid = from.split("/")[0];
                    if (fromJid === jid) {
                        clearTimeout(timeoutId);
                        if (stanza.attrs.type === "error") {
                            presence = { show: "Offline", status: null };
                        } else {
                            let show = stanza.getChildText("show");
                            const status = stanza.getChildText("status");

                            if (show || status) {

                                if (show === null || show === undefined || show === "") {
                                    show = "Available";
                                }
                                else if (show === "away") {
                                    show = "Away";
                                } else if (show === "xa") {
                                    show = "Not Available";
                                } else if (show === "dnd") {
                                    show = "Busy";
                                } else if (show === "unavailable") {
                                    show = "Offline";
                                }
                                presence = { show, status };
                            } else {
                                presence = { show: "Available", status: null };
                            }
                        }
                    }
                }
            });

            setTimeout(() => {
                resolve(presence || { show: "Offline", status: null });
            }, delay);
        });
    }

    async login(username, password) {
        /**
        * Logs in a user to the XMPP server.
        * 
        * @param {string} username - The username of the account.
        * @param {string} password - The password of the account.
        * @returns {Promise} Resolves on successful login, rejects on error.
        */
        this.username = username;
        this.password = password;
        this.xmpp = client({
            service: this.service,
            domain: this.domain,
            username: this.username,
            password: this.password,
        });

        this.xmpp.on("online", async () => {
            await this.xmpp.send(xml("presence"));
        });
        try {
            await this.xmpp.start();
            this.listnerNotifications();
        } catch (err) {
            if (err.condition === 'not-authorized') {
                throw new Error('\nThe username or password is incorrect.');
            } else {
                throw err;
            }
        }
    }

    async getContact(jid) {
        /**
         * Fetches details of a specific contact.
         * 
         * @param {string} jid - The Jabber ID of the contact to fetch.
         * @returns {Promise} Resolves with the contact details, rejects on error.
         */
        return new Promise((resolve, reject) => {
            if (!this.xmpp) {
                reject(new Error("There is no active connection."));
            }
            const rosterStanza = xml(
                'iq',
                { type: 'get', id: 'roster' },
                xml('query', { xmlns: 'jabber:iq:roster' })
            );
            this.xmpp.send(rosterStanza).catch((err) => {
                reject(new Error('There was an error fetching the contact.'));
            });
            this.xmpp.on('stanza', (stanza) => {
                if (stanza.is('iq') && stanza.attrs.type === 'result') {
                    const query = stanza.getChild('query', 'jabber:iq:roster');
                    if (query) {
                        const contacts = query.getChildren('item');

                        let contactList = [];
                        contacts.forEach((contact) => {
                            if (contact.attrs.jid === jid) {
                                const jid = contact.attrs.jid;
                                const name = contact.attrs.name || jid;
                                const subscription = contact.attrs.subscription;
                                const presence = this.xmpp.presences && this.xmpp.presences[jid];
                                const status = presence && presence.status ? presence.status : 'Offline';

                                contactList.push({ jid, name, subscription, status });
                            }
                        });
                        if (contactList.length === 0) {
                            reject(new Error(`There is no ${jid}.`));
                        } else {
                            resolve(contactList[0]);
                        }
                    }
                }
            });
        });
    }

    async addContact(jid) {
        /**
         * Adds a new contact for the currently logged in user.
         * 
         * @param {string} jid - The Jabber ID of the contact to add.
         * @returns {Promise} Resolves on successful addition, rejects on error.
         */
        return new Promise(async (resolve, reject) => {
            if (!this.xmpp) {
                reject(new Error("E."));
            }
            const addStanza = xml(
                'iq',
                { type: 'set', id: 'add' },
                xml('query', { xmlns: 'jabber:iq:roster' },
                    xml('item', { jid: jid })
                )
            );

            this.xmpp.send(addStanza).then(async () => {
                const presenceStanza = xml(
                    'presence',
                    { type: 'subscribe', to: jid }
                );
                await this.xmpp.send(presenceStanza);

                resolve();
            }).catch((err) => {
                reject(new Error('There was an error adding the contact.'));
            });
        });
    }

    async handleContactRequest(fromJid, accept) {
        /**
         * Handles a contact request (accept or reject).
         * 
         * @param {string} jid - The Jabber ID of the contact sending the request.
         * @param {boolean} accept - Whether to accept (true) or reject (false) the request.
         * @returns {Promise} Resolves on successful handling, rejects on error.
         */
        let fromJId2 = fromJid + "@" + this.domain;
        if (!this.xmpp) {
            throw new Error("E.");
        }
        const stanza = Array.from(this.notifications).find(notification =>
            notification.includes(`You have got a new friend request from: ${fromJid}`)
        );
        if (accept) {
            const presence = xml('presence', { to: fromJId2, type: 'subscribed' });
            this.xmpp.send(presence);
            console.log(`\nAccepted ${fromJid}.`);
        } else {
            const presence = xml('presence', { to: fromJId2, type: 'unsubscribed' });
            this.xmpp.send(presence);
            console.log(`\nRemoved ${fromJid}.`);
        }
        if (stanza) {
            this.notifications.delete(stanza);
        }

    }

    async getContactRequests() {
        if (!this.xmpp) {
            throw new Error("E.");
        }
        const presenceStanzas = Array.from(this.notifications).filter(notification =>
            notification.includes("Nueva solicitud de amistad de:")
        );

        return presenceStanzas;
    }

    async directMessage(destinatario, mensaje) {
        if (!this.xmpp) {
            throw new Error("Error en la conexion, intenta de nuevo.");
        }
        const messageStanza = xml(
            "message",
            { type: "chat", to: destinatario },
            xml("body", {}, mensaje)
        );

        await this.xmpp.send(messageStanza);
    }

    async changeStatus(show, status = "") {
        return new Promise((resolve, reject) => {
            if (!this.xmpp) {
                reject(new Error("E."));
            }
            const statusStanza = xml(
                "presence",
                {},
                xml("show", {}, show),
                xml("status", {}, status)
            );
            this.xmpp.send(statusStanza).then(() => {
                console.log(`\nYour status has been changed to ${show}.`);
                resolve();
            }).catch((err) => {
                console.error('Error:', err);
                reject(err);
            });
        });
    }



    async register(username, password, email) {
        /**
         * Registers a new user on the XMPP server.
         * 
         * @param {string} username - The desired username for the new account.
         * @param {string} password - The password for the new account.
         * @param {string} email - The email associated with the new account.
         * @returns {Promise} Resolves on successful registration, rejects on error.
         */
        return new Promise(async (resolve, reject) => {
            if (this.xmpp) {
                reject(new Error('There is already a client connected.'));
            }

            this.username = username;
            this.password = password;
            this.xmpp = client({
                service: this.service,
                domain: this.domain,
                username: this.username,
                password: this.password,
            });

            try {
                await this.xmpp.start();
            } catch (err) {
                reject(new Error('There was an error connecting to the XMPP server.'));
            }

            const registerStanza = xml(
                'iq',
                { type: 'set', id: 'register' },
                xml('query', { xmlns: 'jabber:iq:register' },
                    xml('username', {}, username),
                    xml('password', {}, password),
                    xml('email', {}, email)
                )
            );

            this.xmpp.send(registerStanza).then(() => {
                resolve();
            }).catch((err) => {
                reject(new Error('There was an error registering the account.'));
            });
        });
    }

    listenForStanzas() {
        if (!this.xmpp) {
            throw new Error("E.");
        }

        const maxLength = 60;

        this.xmpp.on("stanza", (stanza) => {
            if (stanza.is("message") && this.receiveNotifications) {
                const type = stanza.attrs.type;
                const from = stanza.attrs.from;
                let body = stanza.getChildText("body");

                if (type === "chat" && body) {
                    if (body.length > maxLength) {
                        body = body.substring(0, maxLength) + "...";
                    }

                    console.log(`Nuevo mensaje de ${from.split("@")[0]}: ${body}`);
                }
            } else if (stanza.is("presence") && stanza.attrs.type === "subscribe") {
                console.log(`New friend request from : ${stanza.attrs.from.split("@")[0]}`);
                this.notifications.add(`New friend request sent from: ${stanza.attrs.from.split("@")[0]}`);
            }
        });
    }


    async sendFile(jid, filePath) {
        if (!this.xmpp) {
            throw new Error("There is no active connection.");
        }
        const file = fs.readFileSync(filePath);
        const fileBase64 = file.toString('base64');

        const fileName = path.basename(filePath);

        const messageStanza = xml(
            "message",
            { type: "chat", to: jid },
            xml("body", {}, 'File sent: ' + fileName + ':' + fileBase64)
        );
        await this.xmpp.send(messageStanza);
    }


    async listnerNotifications() {

        if (!this.xmpp) {
            throw new Error("There is no active connection.");
        }

        const maxLength = 60;

        this.xmpp.on("stanza", (stanza) => {

            if (stanza.is("message") && this.receiveNotifications) {
                const type = stanza.attrs.type;
                const from = stanza.attrs.from;
                let body = stanza.getChildText("body");

                if (type === "chat" && body) {
                    if (body.length > maxLength) {
                        body = body.substring(0, maxLength) + "...";
                    }

                    console.log(`Nuevo mensaje de ${from.split("@")[0]}: ${body}`);
                }

                else if (type === "groupchat" && body) {
                    if (body.length > maxLength) {
                        body = body.substring(0, maxLength) + "...";
                    }

                    console.log(`Nuevo mensaje de ${from.split("@")[0]}: ${body}`);
                }

            } else if (stanza.is("presence") && stanza.attrs.type === "subscribe") {
                console.log(`New friend request from : ${stanza.attrs.from.split("@")[0]}`);
                this.notifications.add(`New friend request sent from: ${stanza.attrs.from.split("@")[0]}`);
            }


        });

    }

}

module.exports = Client;