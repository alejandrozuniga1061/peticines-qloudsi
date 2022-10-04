const express = require('express');
const fetch = require('node-fetch'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 5000;                  //Save the port number where your server will be listening

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
    await procesarUnoAuno(iterator)
      .then(res => {
        console.log("_________________________________________");
        console.log(res);
      })
      .catch( error => {
        console.log("_________________________________________");
        console.log(error);
      })    
      .finally(() => { console.timeEnd("Proceso") });
  }
  console.log("_________________________________________");
  console.timeEnd("Total")
}

function procesarUnoAuno(peticion) {
  return new Promise((resolve, reject) => {
    peticion
      .then(res => resolve(res.json()))
      .catch(error => reject(error.json()))
  });
}

function procesarConcurrente(peticiones) {
  console.time("Proceso");
  Promise.all(peticiones)
    .catch(() => console.log("Validar correo"))
    .finally(() => console.timeEnd("Proceso"));
}

//////////////CONFIGURACIONES
const URL = "http://localhost:9021/serviciosqx/vehiculo/consulta";

let construirBody = (numeroDocumento, idOpcion) => JSON.stringify({
  "peticionDTO": {
    "idOpcion": idOpcion
  },
  "placa": '' + numeroDocumento
});

let construirUsuarios = () => [
  new crearUsuario("palmira_comparenderas", "5ijuf6cghU50EzgQ1MYPCw==", [1], 3),
  new crearUsuario("mosquera_comparenderas", "5ijuf6cghU50EzgQ1MYPCw==", [1], 7)
];

app.listen(port, () => {
  let peticiones = construirPeticiones();
  //procesarConcurrente(peticiones); //Varias peticiones en el mismo instante
  procesarEsperandoRespuesta(peticiones); //Varias peticones esperando cada respuesta antes de enviar la siguiente
});
