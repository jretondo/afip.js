# Integracion con los servicios web de afip
-----------------------------------------

## Introducción

Esta es una implementación de los accesos a las apis de afip para NodeJS y TypeScript, en base de un Fork de otro proyecto.
La idea es democratizar el acceso a los diversos servicios de AFIP de la manera más sencilla posible
En esta versión estan implementados
- [WSAA](#wsaa) WebService de Autenticación y Autorización
- [wsfev1](#wsfev1) WebService de factura electrónica
- [ws_sr_padron_a4](#ws_sr_padron_a4) WebService de Consulta a Padrón Alcance 4 (sólo JS)
- [ws_sr_padron_a5](#ws_sr_padron_a5) WebService de Consulta a Padrón Alcance 5
- [ws_sr_padron_a10](#ws_sr_padron_a10) WebService de Consulta a Padrón Alcance 10 (sólo JS)
- [ws_sr_padron_a13](#ws_sr_padron_a13) WebService de Consulta a Padrón Alcance 13. (sólo JS)

## Errores

En el caso de encontrar un error, crear un issue o pull request en GitHub [seguimiento de errores](https://github.com/jretondo/afip.js/issues)

## Documentación

* [Sitio del Proyecto](https://github.com/jretondo/afip.js)

* [Introducción](#introducción)
* [Instalación](#instalación)
* [Uso](#uso)
* [Documentación Afip](http://www.afip.gob.ar/ws/)

## Instalación

### Para instalar usando npm

```
npm install ts-afip-ws
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

Por el momento hay un ssolo ejemplo de uso, creando una clase con los diferentes métodos posibles

### Ejemplo (AfipClass.ts)

Próximamente agregaré más ejemplos y métodos para el uso del presente repositorio

```
import Afip from 'ts-afip-ws'

interface ResponseAfip {
    status: 200 | 500,
    data: any
}

export class AfipClass {
    afip: Afip;
    constructor(
        private CUIT: number,
        private cert: string,
        private key: string,
        private production: boolean,
    ) {
        this.afip = new Afip({
            CUIT: this.CUIT,
            res_folder: `${__dirname}/certs/`,
            cert: this.cert,
            key: this.key,
            ta_folder: `${__dirname}/token/`,
            production: this.production
        })
    }
    async getServerStatusDataCUIT(): Promise<ResponseAfip> {
        const status = await this.afip.RegisterScopeFive.getServerStatus();
        if (status.appserver === "OK" && status.authserver === "OK" && status.dbserver === "OK") {
            const response: ResponseAfip = {
                status: 200,
                data: "Servidores online"
            }
            return response;
        } else {
            const response: ResponseAfip = {
                status: 500,
                data: "Servidores fuera de servicio"
            }
            return response;
        }
    }
    async getServerStatusFAct(): Promise<ResponseAfip> {
        const status = await this.afip.ElectronicBilling.getServerStatus();
        if (status.appserver === "OK" && status.authserver === "OK" && status.dbserver === "OK") {
            const response: ResponseAfip = {
                status: 200,
                data: "Servidores online"
            }
            return response;
        } else {
            const response: ResponseAfip = {
                status: 500,
                data: "Servidores fuera de servicio"
            }
            return response;
        }
    }

    async getDataCUIT(cuit_cons: number): Promise<ResponseAfip> {
        const dataCUIT = await this.afip.RegisterScopeFive.getTaxpayerDetails(cuit_cons);
        if (dataCUIT === null) {
            const response: ResponseAfip = {
                status: 500,
                data: null
            }
            return response;
        } else {
            const response: ResponseAfip = {
                status: 200,
                data: dataCUIT
            }
            return response;
        }
    }
    async lastFact(pv: number, tipo: CbteTipos): Promise<ResponseAfip> {
        try {
            const ultFact = await this.afip.ElectronicBilling.getLastVoucher(pv, tipo);
            const response: ResponseAfip = {
                status: 200,
                data: ultFact
            }
            return response;
        } catch (error) {
            const response: ResponseAfip = {
                status: 500,
                data: String(error)
            }
            return response;
        }
    }
    async newFact(data:
        FactMonotribProd
        | FactMonotribServ
        | FactMonotribProdNC
        | FactMonotribServNC
        | FactInscriptoProd
        | FactInscriptoServ
        | FactInscriptoProdNC
        | FactInscriptoServNC): Promise<ResponseAfip> {
        const nfact = await this.lastFact(data.PtoVta, data.CbteTipo);
        if (nfact.status === 200) {
            data.CbteDesde = Number(nfact.data) + 1;
            const dataFact = await this.afip.ElectronicBilling.createVoucher(data);
            data.CAE = dataFact.CAE
            data.CAEFchVto = dataFact.CAEFchVto
            const response: ResponseAfip = {
                status: 200,
                data: data
            }
            return response;
        } else {
            const response: ResponseAfip = {
                status: 500,
                data: "Punto de venta o tipo de factura incorrecta."
            }
            return response;
        }
    }
}

```