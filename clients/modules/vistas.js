function menu_principal() {
    console.log('\n--------- Welcome to alumchat.xyz ---------');
    console.log('[ 1 ] Id like to register an account');
    console.log('[ 2 ] Id like to login to my account');
    console.log('[ 3 ] Id like to exit the app');
}

function menu_registro() {
    console.log('\n--------- Register an account ---------');
    console.log('Please enter your username and password.');
}

function menu_login() {
    console.log('\n--------- Login to your account ---------');
    console.log('Please enter your username and password.');
}

function menu_borrar() {
    console.log('\n--------- Delete your account ---------');
    console.log('Eraising your account...');
}

function menu_login_success() {
    console.log('\n--------- What would yo like to do? ---------');
    console.log('[ 01 ] Id like to show all users and their status');
    console.log('[ 02 ] Id like to add a user to my contacts');
    console.log('[ 03 ] Id like to show contact details');
    console.log('[ 04 ] Id like to chat with a user');
    console.log('[ 05 ] Id like to join a group chat');
    console.log('[ 06 ] Id like to set my presence message');
    console.log('[ 07 ] Id like to send/receive notifications');
    console.log('[ 08 ] Id like to send/receive files');
    console.log('[ 09 ] Id like to delete my account');
    console.log('[ 10 ] Id like to logout');
}

function menu_contact() {
    console.log('\n--------- What would yo like to do? ---------');
    console.log('[ 01 ] Id like to send a friend request');
    console.log('[ 02 ] Id like to accept a friend request');
}

function menu_contact_information() {
    console.log('\n--------- Contact information ---------');
    console.log('Please provide a valid username.');
}

function menu_private_chat() {
    console.log('\n--------- Private chat ---------');
    console.log('Please provide a username youd like to chat with.');
    console.log(' ! You can send messages by typing them and pressing enter.');
    console.log(' ! You can exit the chat by typing /return and pressing enter.');
}

function menu_group_chat() {
    console.log('\n--------- Group chat ---------');
    console.log('Please provide a group name youd like to chat with.');
    console.log(' ! You can send messages by typing them and pressing enter.');
    console.log(' ! You can exit the chat by typing /return and pressing enter.');
}

function menu_set_presence() {
    console.log('\n--------- Set presence message ---------');
    console.log('Please provide a presence message and status.');
}

function menu_send_files() {
    console.log('\n--------- Send files ---------');
    console.log('Please provide a valid username and a file path.');
}

module.exports = {
    menu_principal: menu_principal,
    menu_registro: menu_registro,
    menu_login: menu_login,
    menu_borrar: menu_borrar,
    menu_login_success: menu_login_success,
    menu_contact: menu_contact,
    menu_contact_information: menu_contact_information,
    menu_private_chat: menu_private_chat,
    menu_group_chat: menu_group_chat,
    menu_set_presence: menu_set_presence,
    menu_send_files: menu_send_files
};