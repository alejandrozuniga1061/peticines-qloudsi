const express = require('express');
const fetch = require('node-fetch'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 5000;                  //Save the port number where your server will be listening

let construirBody = (numeroDocumento, idOpcion) => JSON.stringify({
  "peticionDTO": {
    "idOpcion": idOpcion
  },
  "tipoDocumento": "C",
  "numeroDocumento": '' + numeroDocumento
});

let construirRequest = (numeroDocumento, { usuario, clave }, idOpcion) => {
  return {
    'method': 'POST',
    'headers': { usuario: usuario, clave: clave, "Content-Type": "application/json" },
    'body': construirBody(numeroDocumento, idOpcion),
    'redirect': 'follow'
  }
};

let construirPeticion = (numeroDocumento, usuario, idOpcion) => {
  let requestOptions = construirRequest(numeroDocumento, usuario, idOpcion);
  return fetch(URL, requestOptions);
};

let obtenerNumeroRandom = () => Math.random() * (1000 - 1) + 1;

let crearUsuario = class Usuario {
  constructor(usuario, clave, opciones, numeroPeticiones) {
    this.usuario = usuario;
    this.clave = clave;
    this.opciones = opciones;
    this.numeroPeticiones = numeroPeticiones;
  }
};

let construirPeticiones = () => {
  let peticiones = [];
  let usuarios = construirUsuarios();

  usuarios.forEach(usuario => {
    usuario.opciones.forEach(opcion => {
      for (let i = 1; i <= usuario.numeroPeticiones; i++)
        peticiones.push(construirPeticion(obtenerNumeroRandom() + i, usuario, opcion));
    });
  });

  return peticiones;
};

async function procesarEsperandoRespuesta(peticiones) {
  console.time("Total")
  for (const iterator of peticiones) {
    console.time("Proceso")
    await procesarUnoAuno(iterator).finally(() => { console.timeEnd("Proceso") });
  }
  console.timeEnd("Total")
}

function procesarUnoAuno(peticion) {
  return new Promise((resolve) => {
    peticion.finally(() => resolve());
  });
}

function procesarConcurrente(peticiones) {
  console.time("Proceso");
  Promise.all(peticiones)
    .catch(() => console.log("Validar correo"))
    .finally(() => console.timeEnd("Proceso"));
}

//////////////CONFIGURACIONES
const URL = "http://localhost:9021/serviciosqx/conductor/consulta";

let construirUsuarios = () => [
  new crearUsuario("medellin_ssd", "5ijuf6cghU50EzgQ1MYPCw==", [17,3,4], 10)
];

app.listen(port, () => {
  let peticiones = construirPeticiones();
  procesarConcurrente(peticiones); //Varias peticiones en el mismo instante
  //procesarEsperandoRespuesta(peticiones); //Varias peticones esperando cada respuesta antes de enviar la siguiente
});
