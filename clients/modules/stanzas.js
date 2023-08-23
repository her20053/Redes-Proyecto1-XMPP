const fs = require('fs');
const path = require('path');

function pad(str, width, padChar = " ") {
    return str.padEnd(width, padChar).slice(0, width);
}

async function ver_amigos(contactos) {

    if (contactos.length === 0) {
        console.log("\nYou have no friends yet. Add some!");
    } else {
        const columnWidth = 40;
        for (const contact of contactos) {
            console.log(`- ${pad(contact.jid, columnWidth)}${pad("Available", columnWidth)}`);
        }
    }

}

async function ver_contacto(contact, presence) {

    console.log('\n--------- Contact information ---------');
    console.log(' * Basic contact information:');
    console.log(contact);
    console.log(' * Basic contact presence:');
    console.log(presence);

}

async function esuchar_mensajes_privados(client, JID) {
    client.xmpp.on('stanza', (stanza) => {
        if (stanza.is('message') && stanza.attrs.type === 'chat' && stanza.attrs.from.startsWith(JID)) {
            const body = stanza.getChild('body');
            const message = body.text();
            console.log(` + ${JID}: ${message}`);

            if (message.startsWith('File sent: ')) {
                // Decodificar el archivo recibido
                const parts = message.substring(11).split(':');
                const fileName = parts[0];
                const fileBase64 = parts[1];
                const file = Buffer.from(fileBase64, 'base64');

                // guardar el archivo en el directorio ./received_files
                const saveDir = './images2';
                fs.writeFileSync(path.join(saveDir, fileName), file);
                console.log(`${JID}: Envio un archivo: ${fileName}`)
                console.log(`Archivo guardado en: ${saveDir}/${fileName}`);

            } else {
                console.log(`${JID}: ${message}`);
            }

        }

    }
    );
}


module.exports = {
    ver_amigos: ver_amigos,
    ver_contacto: ver_contacto,
    esuchar_mensajes_privados: esuchar_mensajes_privados
};