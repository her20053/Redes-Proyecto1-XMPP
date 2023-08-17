const { registerMain, loginMain, logoutMain, deleteAccountMain, submenu } = require('./utils');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function main() {
    console.log('\nBIENVENIDO AL CHAT');
    menu();
}

function menu() {
    console.log('\nMENU PRINCIPAL:');
    console.log('[1] REGISTRARSE');
    console.log('[2] INICIAR SESION');
    console.log('[3] CERRAR SESION');
    console.log('[4] ELIMINAR CUENTA');

    rl.question('Opcion -> ', answer => {
        switch (answer) {
            case '1':
                registerMain();
                break;
            case '2':
                loginMain();
                break;
            case '3':
                logoutMain();
                break;
            case '4':
                deleteAccountMain();
                break;
            default:
                console.log('Opcion invalida! Intente de nuevo!');
                menu();
        }
    });
}

main();
