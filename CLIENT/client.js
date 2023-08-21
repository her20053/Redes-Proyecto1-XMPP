const { client, xml } = require("@xmpp/client");
const { v4: uuidv4 } = require('uuid');
const debug = require("@xmpp/debug");
const mime = require('mime-types');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

class SimpleXMPPClient {

    constructor() {
        this.service = "xmpp://alumchat.xyz:5222";
        this.domain = "alumchat.xyz";
        this.username = null;
        this.password = null;
        this.xmpp = null;
    }

    async connectToServer(username, password) {
        this.username = username;
        this.password = password;

        this.xmpp = client({
            service: this.service,
            domain: this.domain,
            username: this.username,
            password: this.password,
        });

        this.xmpp.on('error', err => {
            console.error('Error:', err);
        });

        this.xmpp.on('online', address => {
            console.log('\n + Connected successfully as:', address.toString());
        });

        try {
            await this.xmpp.start();
            console.log('\n + Connection started...');
        } catch (err) {
            console.error('\n - Error establishing connection:', err);
        }
    }

    async registerNewUser(username, password) {
        if (this.xmpp) {
            throw new Error('A connection already exists.');
        }

        this.username = username;
        this.password = password;

        console.log('\n + Registering user...');
        this.xmpp = client({
            service: this.service,
            domain: this.domain,
            username: this.username,
            password: this.password,
        });

        try {
            await this.xmpp.start();
        } catch (err) {
            throw new Error('Error establishing connection.');
        }

        const registerStanza = xml(
            'iq',
            { type: 'set', id: 'register' },
            xml('query', { xmlns: 'jabber:iq:register' },
                xml('username', {}, username),
                xml('password', {}, password),
                xml('email', {}, (username + '@prueba_her20053.com')))
        );

        try {
            await this.xmpp.send(registerStanza);
        } catch (err) {
            throw new Error('Error registering the user.');
        }
    }

    showUserOptions() {
        console.log('\nWhat would you like to do?');
        // ... Rest of the options ...
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const mainMenu = () => {
    console.log('\nChoose an option:');
    console.log('1. Create an account');
    console.log('2. Log in');
    console.log('3. Exit');

    rl.question('\nYour choice: ', (answer) => {
        switch (answer) {
            case '1':
                rl.question('\nUsername (for registration): ', username => {
                    rl.question('Password (for registration): ', password => {
                        const xmppClient = new SimpleXMPPClient();
                        xmppClient.registerNewUser(username, password)
                            .then(() => {
                                console.log('User registered successfully.');
                                mainMenu();
                            })
                            .catch(err => {
                                console.error('Registration error:', err.message);
                                mainMenu();
                            });
                    });
                });
                break;
            case '2':
                rl.question('\nUsername: ', username => {
                    rl.question('Password: ', password => {
                        const xmppClient = new SimpleXMPPClient();
                        xmppClient.connectToServer(username, password)
                            .then(() => {
                                xmppClient.showUserOptions();
                            })
                            .catch(err => {
                                console.error('Login error:', err.message);
                                mainMenu();
                            });
                        rl.close();
                    });
                });
                break;
            case '3':
                console.log('\nGoodbye!');
                rl.close();
                break;
            default:
                console.log('\nInvalid option. Try again.');
                mainMenu();
                break;
        }
    });
};

mainMenu();
