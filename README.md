# Integracion con los servicios web de afip
-----------------------------------------

## Introducción

Implementación de los accesos a las apis de afip para nodejs.
En esta versión estan implementados
- [WSAA](#wsaa) WebService de Autenticación y Autorización
- [wsfev1](#wsfev1) WebService de factura electrónica
- [ws_sr_padron_a5](#ws_sr_padron_a10) WebService de Consulta a Padrón Alcance 10
- [ws_sr_padron_a13 v1.2](#ws_sr_padron_a13) WebService de Consulta a Padrón Alcance 13. [Manual para el desarrollador](http://www.afip.gob.ar/ws/ws-padron-a13/manual-ws-sr-padron-a13-v1.2.pdf)
- [ws_sr_constancia_inscripcion](#ws_sr_constancia_inscripcion) Consulta a Padrón Constancia de Inscripción
- [WSCDC](#WSCDC) Constatacion de Comprobantes

## Errores

En el caso de encontrar un error, crear un issue en el sitio de [seguimiento de errores](https://itstuff.com.ar/redmine/projects/npm-afip-apis/issues)

## Documentación

* [Sitio del Proyecto](https://itstuff.com.ar/redmine/projects/npm-afip-apis)

* [Introducción](#introducción)
* [Instalación](#instalación)
* [Uso](#uso)
* [Testing](#testing)
* [Documentación Afip](http://www.afip.gob.ar/ws/)

## Instalación

### Para instalar usando npm

```
npm install -S afip-apis
```

### Obtención de los certificados para el ambiente de homologación

Seguir los pasos en la documentación oficial:

- [¿Cómo obtener el Certificado Digital para entorno de producción?](http://www.afip.gob.ar/ws/WSAA/wsaa_obtener_certificado_produccion.pdf)
- [¿Cómo asociar el Certificado Digital a un WSN (Web Service de Negocio)?](http://www.afip.gob.ar/ws/WSAA/wsaa_asociar_certificado_a_wsn_produccion.pdf)
- Certificado y autorización en el entorno de homologacion.
Ingresar con clave fiscal a [www.afip.gob.ar](http://www.afip.gob.ar)
Opcion [WSASS - Autogestión Certificados Homologación](https://wsass-homo.afip.gob.ar/wsass/portal/main.aspx)
Esta es la opcion para _Autogestión de certificados para Servicios Web en los ambientes de homologación_
Que permite obtener los certificados y asociar servicios para probar la API en el entorno de homologación.

## Uso

En el diretorio **test** hay más ejemplos, incluyendo las pruebas de todos los metodos de los webservices de factura electrónica y factura electrónica de exportación.

### Javascript

Aunque hay algunos ejemplos en javascript, La mayoria de los ejemplos estan en [Typescript](#Typescript)

Ejemplo de autenticacion usando [wsaa](http://www.afip.gob.ar/ws/paso4.asp?noalert=1) y consulta al metodo Dummy del servicio de facturación electrónica [wsfev1](http://www.afip.gob.ar/ws/paso4.asp?noalert=1) en javascript
Antes de usar el ejemplo, tenes que tener generado un certificado, al menos de homologación. En el ejemplo el certificado y la clave
estan en el path definido en DEFAULT_CERTIFICATE y DEFAULT_CERTIFICATE_KEY

```
"use strict";

var afip_apis_1 = require("afip-apis");
var DEFAULT_URLWSAAWSDL = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL";
var DEFAULT_SERVICIO = "wsfe";
var DEFAULT_CERTIFICATE = "./private/certificate/TEST/09.2021/afip-test.crt";
var DEFAULT_CERTIFICATE_KEY = "./private/certificate/TEST/09.2021/afip-test.key";
var loginTicket = new afip_apis_1.LoginTicket();
loginTicket.wsaaLogin(DEFAULT_SERVICIO, DEFAULT_URLWSAAWSDL, DEFAULT_CERTIFICATE, DEFAULT_CERTIFICATE_KEY)
  .then(function (r) {
    console.log(r.header);
    var wsfev1 = new afip_apis_1.Wsfev1("https://wswhomo.afip.gov.ar/wsfev1/service.asmx?WSDL");
    return wsfev1.FEDummy({})
      .then(function (d) {
        console.log(d);
      });
  })
  .catch(function (e) { return console.error(e); });
```

### Typescript

A continuacion hay algunos ejemplos de uso en *TypeScript*

#### wsaa

Ejemplo de autenticacion usando [wsaa](http://www.afip.gob.ar/ws/paso4.asp?noalert=1) y consulta al metodo Dummy del servicio de facturación electrónica [wsfev1](http://www.afip.gob.ar/ws/paso4.asp?noalert=1) en typescript

```
import { LoginTicket, Wsfev1 } from "afip-apis";

const DEFAULT_URLWSAAWSDL: string = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL";
const DEFAULT_SERVICIO: string = "wsfe";
const DEFAULT_CERTIFICATE: string = "./private/certificate/TEST/09.2021/afip-test.crt";
const DEFAULT_CERTIFICATE_KEY: string = "./private/certificate/TEST/09.2021/afip-test.key";


const loginTicket: LoginTicket = new LoginTicket();
loginTicket.wsaaLogin(DEFAULT_SERVICIO, DEFAULT_URLWSAAWSDL, DEFAULT_CERTIFICATE, DEFAULT_CERTIFICATE_KEY)
  .then(r => {
    console.log(r.header);
    const wsfev1: Wsfev1 = new Wsfev1("https://wswhomo.afip.gov.ar/wsfev1/service.asmx?WSDL");
    return wsfev1.FEDummy({})
      .then(d => {
        console.log(d);
      });
  })
  .catch(e => console.error(e));
```

en la consola se ve el resultado

```
{ source: 'CN=wsaahomo, O=AFIP, C=AR, SERIALNUMBER=CUIT 33693450239',
  destination: 'SERIALNUMBER=CUIT 20999999999, CN=certificadodeprueba',
  uniqueId: '308192521',
  generationTime: '2018-09-21T10:51:22.653-03:00',
  expirationTime: '2018-09-21T22:51:22.653-03:00' }
{ FEDummyResult: { AppServer: 'OK', DbServer: 'OK', AuthServer: 'OK' } }
```

con el encabezado del ticket de autenticación y el resultado del metodo FEDummy

en las constantes
```
const DEFAULT_CERTIFICATE: string = "./private/certificate/TEST/09.2021/afip-test.crt";
const DEFAULT_CERTIFICATE_KEY: string = "./private/certificate/TEST/09.2021/afip-test.key";
```
se incluye el path al certificado y la clave privada

#### wsfev1

Ejemplo de consulta de tipos de iva

```
const DEFAULT_CERTIFICATE: string = "./private/certificate/TEST/09.2021/afip-test.crt";
const DEFAULT_CERTIFICATE_KEY: string = "./private/certificate/TEST/09.2021/afip-test.key";

const loginTicket = new LoginTicket();
const wsfev1 = new Wsfev1(Wsfev1.testWSDL);

loginTicket.wsaaLogin(Wsfev1.serviceId, DEFAULT_URLWSAAWSDL, DEFAULT_CERTIFICATE, DEFAULT_CERTIFICATE_KEY)
  .then(ticket => {
    console.log("ticket:");
    console.log(ticket.header);
    wsfev1.FEDummy({})
      .then(r => {
        console.log("FEDummy:");
        console.log(r);
        return wsfev1.FEParamGetTiposIva({
          Auth: {
            Token: ticket.credentials.token,
            Sign: ticket.credentials.sign,
            Cuit: 20999999999
          }
        })
          .then(r => {
            console.log("FEParamGetTiposIva:");
            if (r.FEParamGetTiposIvaResult.Errors) {
              console.error(r.FEParamGetTiposIvaResult.Errors);
            } else {
              console.log(r.FEParamGetTiposIvaResult.ResultGet);
            }
          });
      });
  })
  .catch(e => {
    console.error(e);
  });

```

resultado

```
ticket:
   { source: 'CN=wsaahomo, O=AFIP, C=AR, SERIALNUMBER=CUIT 33693450239',
     destination: 'SERIALNUMBER=CUIT 20999999999, CN=certificadodeprueba',
     uniqueId: '2894537894',
     generationTime: '2018-09-21T15:30:27.045-03:00',
     expirationTime: '2018-09-22T03:30:27.045-03:00' }

FEDummy:
{ FEDummyResult: { AppServer: 'OK', DbServer: 'OK', AuthServer: 'OK' } }

FEParamGetTiposIva:
{ IvaTipo:
   [ { Id: '3', Desc: '0%', FchDesde: '20090220', FchHasta: 'NULL' },
     { Id: '4', Desc: '10.5%', FchDesde: '20090220', FchHasta: 'NULL' },
     { Id: '5', Desc: '21%', FchDesde: '20090220', FchHasta: 'NULL' },
     { Id: '6', Desc: '27%', FchDesde: '20090220', FchHasta: 'NULL' },
     { Id: '8', Desc: '5%', FchDesde: '20141020', FchHasta: 'NULL' },
     { Id: '9', Desc: '2.5%', FchDesde: '20141020', FchHasta: 'NULL' } ] }
```

#### ws_sr_padron_a10 (WebService de Consulta a Padrón Alcance 10)

> El padrón de alcance 10 es de acceso restringido, y ha sido dado de baja en produción.

#### ws_padron_a13 (WebService de Consulta a Padrón Alcance 13 v1.2)

El siguiente código consulta el Padron de nivel 13

```
const DEFAULT_CERTIFICATE: string = "./private/certificate/TEST/09.2021/afip-test.crt";
const DEFAULT_CERTIFICATE_KEY: string = "./private/certificate/TEST/09.2021/afip-test.key";
const DEFAULT_URLWSAAWSDL: string = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL";

const loginTicket = new LoginTicket();

loginTicket.wsaaLogin(PersonaServiceA13.serviceId, DEFAULT_URLWSAAWSDL, DEFAULT_CERTIFICATE, DEFAULT_CERTIFICATE_KEY)
  .then(ticket => {
    console.log("=== ticket ===");
    console.log(JSON.stringify(ticket));
    const a13 = new PersonaServiceA13(PersonaServiceA13.testWSDL);
    return a13.dummy({})
      .then(r => {
        console.log(`===dummy===\n${JSON.stringify(r)}`);
        return a13.getIdPersonaListByDocumento({
          token: ticket.credentials.token,
          sign: ticket.credentials.sign,
          cuitRepresentada,
          documento
        });
      })
      .then(id => {
        console.log(`===getIdPersonaListByDocumento===\n${JSON.stringify(id)}`);
        return a13.getPersona({
          token: ticket.credentials.token,
          sign: ticket.credentials.sign,
          cuitRepresentada,
          idPersona: id.idPersonaListReturn.idPersona
        });
      })
      .then(p => {
        console.log(`===getPersona===\n${JSON.stringify(p)}`);
        console.log("=== FIN ===");
      });
  })
  .catch(err => {
    console.error(err);
  });

```
En la consola se puede ver el resultado

```
===dummy===
{
  "return": {
    "appserver": "OK",
    "authserver": "OK",
    "dbserver": "OK"
  }
}
===getIdPersonaListByDocumento===
{
  "idPersonaListReturn": {
    "idPersona": "20106316725",
    "metadata": {
      "fechaHora": "2019-11-07T17:12:01.770-03:00",
      "servidor": "setiwsh1.afip.gov.ar"
    }
  }
}
===getPersona===
{
  "personaReturn": {
    "metadata": {
      "fechaHora": "2019-11-07T17:12:02.031-03:00",
      "servidor": "setiwsh1.afip.gov.ar"
    },
    "persona": {
      "apellido": "BERNARD JAMES",
      "descripcionActividadPrincipal": "SERVICIOS DE ASESORAMIENTO,DIRECCION Y GESTION EMPRESARIAL N.C.P.",
      "domicilio": [
        {
        },
        {
        }
      ],
      "estadoClave": "ACTIVO",
      "fechaNacimiento": "1954-04-03T12:00:00-03:00",
      "idActividadPrincipal": "741409",
      "idPersona": "20106316725",
      "mesCierre": "12",
      "nombre": "JUAN ANGEL",
      "numeroDocumento": "10631672",
      "periodoActividadPrincipal": "201012",
      "tipoClave": "CUIT",
      "tipoDocumento": "DNI",
      "tipoPersona": "FISICA"
    }
  }
}
=== FIN ===
```

#### ws_sr_constancia_inscripcion (Consulta a Padrón Constancia de Inscripción)

Similar a [ws_sr_padron_a10](#ws_sr_padron_a10) WebService de Consulta a Padrón Alcance 10

#### WSCDC (Constatación de Comprobantes)

El siguiente código consulta la validez de un comprobante

```
const DEFAULT_CERTIFICATE: string = "./private/certificate/TEST/09.2021/afip-test.crt";
const DEFAULT_CERTIFICATE_KEY: string = "./private/certificate/TEST/09.2021/afip-test.key";
const DEFAULT_URLWSAAWSDL: string = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL";

const loginTicket = new LoginTicket();
const wscdcv1 = new Wscdcv1(Wscdcv1.testWSDL);


loginTicket.wsaaLogin(Wscdcv1.serviceId, DEFAULT_URLWSAAWSDL, DEFAULT_CERTIFICATE, DEFAULT_CERTIFICATE_KEY)
  .then(ticket => {
    console.log("ticket:");
    console.log(ticket.header);
    return wscdcv1.ComprobanteConstatar({
      Auth: {
        Token: ticket.credentials.token,
        Sign: ticket.credentials.sign,
        Cuit: 20221536999
      },
      CmpReq: {
        CbteModo: "CAE",
        CuitEmisor: 30639453738,
        PtoVta: 8340,
        CbteTipo: 6,
        CbteNro: 35100022,
        CbteFch: "20181108",
        ImpTotal: 127200,
        CodAutorizacion: "68428424451327",
        DocTipoReceptor: "96",
        DocNroReceptor: "99777666"
      }
    })
      .then(r => {
        console.log("=== ComprobanteConstatar ===");
        console.log(`resultado (A=Aprobado, R=Rechazado): ${r.ComprobanteConstatarResult.Resultado}. Observacion: ${JSON.stringify(r.ComprobanteConstatarResult.Observaciones)}`);
        console.log("=== FIN ===");
      });
  })
  .catch(e => {
    console.error(e);
  });

```

## Testing

```
npm test
```
En el directorio test hay mas ejemplos incluidos pruebas de todos los metodos de los webservices de factura electrónica y factura electrónica de exportación.

# Changelog

## [0.3.0] - 2019-07-04
### Added
- Constatación de Comprobantes [ManualDelDesarrolladorWSCDCV1.pdf](https://www.afip.gob.ar/ws/WSCDCV1/ManualDelDesarrolladorWSCDCV1.pdf)

### Changed
- Actualización de Dependencias

### Removed
- none

## [0.3.2] - 2019-11-07
### Added
- [ws_sr_padron_a13](#ws_sr_padron_a13) WebService de Consulta a Padrón Alcance 13. [manual-ws-sr-padron-a13-v1.2.pdf](http://www.afip.gob.ar/ws/ws-padron-a13/manual-ws-sr-padron-a13-v1.2.pdf)
- Alerta de depreciación para [ws_sr_padron_a10](#ws_sr_padron_a10)

### Changed
- Actualización de Dependencias

### Removed
- none

## [0.3.3] - 2019-11-13
### Added

### Changed
- Fix error en debug
- Fix error en duracion del ticket
- Fix Promise handle cuando hay errores en los archivos de certificado.

### Removed
- none

## [0.3.4] - 2019-11-14
### Added

### Changed
- actualizacion de ws_rem_harina (no documentado) a version 2.1. [Manual para el desarrollador v2.1](http://www.afip.gob.ar/ws/remitoHTSDMT/Manual-Desarrollador-WSREMHARINA-v-2-1.pdf)
- Actualización de Dependencias

### Removed
- none
