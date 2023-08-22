## Guía de Instalación y Ejecución para xmpp-cliente

### Paso 1: Preparación del entorno

Asegurese de tener instalado Node.js y npm en su sistema. Si aún no los tiene, puede descargarlos e instalarlos desde la página oficial de Node.js.

https://nodejs.org/en

### Paso 2: Clonar o descargar el repositorio

git clone https://github.com/her20053/Redes-Proyecto1-XMPP
cd Redes-Proyecto1-XMPP

### Paso 3: Instalar las dependencias

npm install

Esto instalará todos los módulos listados en la sección "dependencies" del archivo package.json.

### Paso 4: Ejecución del programa

npm start


¡Y eso es todo! Siguiendo estos pasos, deberías ser capaz de instalar y ejecutar el proyecto xmpp-cliente en tu máquina local.

## lector.js
Este archivo se encarga de proporcionar una interfaz para leer líneas desde la entrada estándar.

Métodos y funciones:

No tiene métodos ni funciones definidos en el archivo.
Exportaciones:

Exporta la interfaz rl creada con el módulo readline de Node.js, que permite leer líneas desde la entrada estándar (stdin) y escribir en la salida estándar (stdout).

## stanzas.js
Este archivo proporciona funciones para mostrar información sobre contactos y escuchar mensajes privados.

Funciones:

async ver_amigos(contactos):

Descripción: Muestra la lista de amigos en la consola.
Parámetros:
contactos: Una lista de contactos.
Retorno: Ninguno.
async ver_contacto(contact, presence):

Descripción: Muestra información detallada sobre un contacto específico y su presencia.
Parámetros:
contact: Información sobre el contacto.
presence: Información sobre la presencia del contacto.
Retorno: Ninguno.
async esuchar_mensajes_privados(client, JID):

Descripción: Escucha mensajes privados de un JID específico.
Parámetros:
client: Una instancia del cliente.
JID: El JID desde el cual se quieren escuchar los mensajes.
Retorno: Ninguno.


## vistas.js
Este archivo proporciona funciones para mostrar diferentes menús y mensajes en la consola.

Funciones:

menu_principal():

Descripción: Muestra el menú principal de la aplicación.
Retorno: Ninguno.
menu_registro():

Descripción: Muestra el menú para el registro de una cuenta.
Retorno: Ninguno.
menu_login():

Descripción: Muestra el menú para iniciar sesión en una cuenta.
Retorno: Ninguno.
menu_borrar():

Descripción: Muestra el mensaje para borrar una cuenta.
Retorno: Ninguno.
menu_login_success():

Descripción: Muestra las opciones disponibles después de un inicio de sesión exitoso.
Retorno: Ninguno.

## xmpp.js
Este archivo define una clase Client relacionada con la funcionalidad del protocolo XMPP.

Importaciones:

Se importan varios módulos, incluyendo @xmpp/client, @xmpp/debug, fs y path.
Variables globales:

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";: Desactiva la verificación de certificados TLS.
Clase: Client

Propiedades:
username: Nombre de usuario del cliente.
password: Contraseña del cliente.
service: URL del servicio XMPP.
domain: Dominio del servicio XMPP.
xmpp: Objeto relacionado con la funcionalidad XMPP.
notifications: Conjunto de notificaciones.
receiveNotifications: Bandera para determinar si se deben recibir notificaciones o no.
Métodos de la clase Client:

async getContacts():
Descripción: Obtiene la lista de contactos del usuario actualmente autenticado.
Retorno: Una promesa que se resuelve con una lista de contactos o se rechaza en caso de error.

## cliente.js
Este archivo es el controlador principal que interactúa con el usuario, mostrando menús y procesando las respuestas del usuario.

Importaciones:

Se importan varios módulos, entre ellos lector, xmpp, vistas y stanzas.
Funciones:

empezar_programa():

Descripción: Muestra el menú principal y espera la respuesta del usuario para decidir qué hacer a continuación. Dependiendo de la elección del usuario, puede iniciar el proceso de registro, el proceso de inicio de sesión o salir del programa.
Retorno: Ninguno.
async proceso_login_success():

Descripción: Se ejecuta después de un inicio de sesión exitoso, muestra un menú de opciones post-login y espera la elección del usuario.
Retorno: Ninguno.