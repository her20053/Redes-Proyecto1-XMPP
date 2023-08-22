// Importacion de modulos
const rl = require('./modules/lector');
const xmpp = require('./modules/xmpp');
const vistas = require('./modules/vistas');
const stanzas = require('./modules/stanzas');

function empezar_programa() {
    vistas.menu_principal();
    rl.question('What would you like to do? ', (answer) => {
        switch (answer) {
            case '1':
                proceso_registro();
                break;
            case '2':
                proceso_login();
                break;
            case '3':
                console.log('Thanks for using our app!');
                break;
            default:
                console.log('Invalid option, try again.');
                empezar_programa();
        }
    });
}

async function proceso_login_success() {

    vistas.menu_login_success();

    rl.question('What would you like to do? ', async (answer) => {
        switch (answer) {


            case '1':


                const contactos = await client.getContacts();
                stanzas.ver_amigos(contactos);
                proceso_login_success();

                break;



            case '2':

                vistas.menu_contact();

                rl.question('What would you like to do? ', async (answer) => {
                    switch (answer) {
                        case '1':
                            rl.question(' * Username: ', async (username) => {
                                await client.addContact(username + '@alumchat.xyz');
                                console.log('Friend request sent successfully!');
                                proceso_login_success();
                            });
                            break;
                        case '2':
                            rl.question(' * Username: ', async (username) => {
                                await client.handleContactRequest(username + '@alumchat.xyz', true);
                                console.log('Friend request accepted successfully!');
                                proceso_login_success();
                            });
                            break;
                        default:
                            console.log('Invalid option, try again.');
                            proceso_login_success();
                    }
                });

                break;


            case '3':

                vistas.menu_contact_information();

                rl.question(' * Username: ', async (username) => {

                    const JID = username + '@alumchat.xyz';

                    const contact = await client.getContact(JID);

                    const presence = await client.getPresence(JID);

                    await stanzas.ver_contacto(contact, presence);

                    proceso_login_success();

                });

                break;

            case '4':

                vistas.menu_private_chat();

                rl.question(' * Username: ', async (username) => {

                    const JID = username + '@alumchat.xyz';

                    stanzas.esuchar_mensajes_privados(client, JID);

                    rl.on('line', async (line) => {

                        if (line === '/return') {

                            proceso_login_success();

                        }

                        else {

                            await client.directMessage(JID, line);

                        }
                    });

                    rl.setPrompt(`Sending: `);
                    rl.prompt();

                });

                break;

            case '5':

                vistas.menu_group_chat();
                proceso_login_success();
                break;

            case '6':

                vistas.menu_set_presence();

                let presence = 'I am available';

                rl.question(' * Please write out your current status ', async (answer) => {

                    presence = answer;

                    console.log('Your status has been updated successfully!');

                    let status = 'Feel free to call me!';

                    rl.question(' * Please write out your current message ', async (message_) => {

                        status = message_;

                        await client.changeStatus(presence, status);

                        console.log('Your message has been updated successfully!');
                        proceso_login_success();
                    });

                }
                );



                break;

            case '7':

                recibiendo_notificaciones = client.receiveNotifications;

                if (!recibiendo_notificaciones) {
                    client.receiveNotifications = true;
                    console.log('You are currently receiving notifications');
                }
                else {
                    client.receiveNotifications = false;
                    console.log('You are currently not receiving notifications');
                }

                proceso_login_success();

                break;

            case '8':

                vistas.menu_send_files();

                rl.question(' * Username: ', async (username) => {

                    const JID = username + '@alumchat.xyz';

                    rl.question(' * File path: ', async (path) => {

                        const FilePath = path;

                        await client.sendFile(JID, FilePath);

                        console.log('Your file has been sent successfully!');
                        proceso_login_success();

                    });
                });

                break;

            case '09':
                proceso_borrar();
                break;

            case '10':
                console.log('Thanks for using our app!');
                await client.logout();
                empezar_programa();
                break;
            default:
                console.log('Invalid option, try again.');
                proceso_login_success();
        }
    });

}

async function proceso_registro() {
    vistas.menu_registro();
    rl.question(' * Username: ', (username) => {
        rl.question(' * Password: ', (password) => {

            const email = username + '@alumchat.xyz';

            client.register(username, password, email)

            console.log('You have registered successfully!');
            console.log('Your username  is: ' + username);
            console.log('Your password  is: ' + password);
            console.log('Your new email is: ' + email);

            empezar_programa();

        });
    }
    );
}

async function proceso_login() {
    vistas.menu_login();
    rl.question(' * Username: ', (username) => {
        rl.question(' * Password: ', (password) => {

            client.login(username, password);

            console.log('Welcome back! You have logged in successfully!');

            proceso_login_success();

        });
    }
    );
}


async function proceso_borrar() {
    vistas.menu_borrar();
    const usuario = client.username;
    await client.deleteAccount(usuario);
    console.log('Your account has been deleted successfully!');
    empezar_programa();
}




const client = new xmpp();
empezar_programa();



