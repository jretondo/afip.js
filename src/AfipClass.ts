//Se importa el módulo jretondo-afip-ws 
import Afip from 'jretondo-afip-ws'

//Creo una interface con la respuesta esperada
interface ResponseAfip {
    status: 200 | 500,
    data: any
}

//Yo recomiendo útilizar clases para crear el objeto con todos los métodos como más le convenga
//En este ejemplo solamente útilizaremos la consulta del padrón A5, ya que es la más útilizada
//Y también la creación de facturas y consultas de último número de factura
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

export enum CbteTipos {
    "Factura A" = 1,
    "Nota de Débito A" = 2,
    "Nota de Crédito A" = 3,
    "Factura B" = 6,
    "Nota de Débito B" = 7,
    "Nota de Crédito B" = 8,
    "Recibos A" = 4,
    "Recibos B" = 9,
    "Factura C" = 11,
    "Nota de Débito C" = 12,
    "Nota de Crédito C" = 13,
    "Recibo C" = 15,
    "Factura M" = 51,
    "Nota de Débito M" = 52,
    "Nota de Crédito M" = 53,
    "Recibo M" = 54,
}
export enum TiposTributo {
    "Impuestos nacionales" = 1,
    "Impuestos provinciales" = 2,
    "Impuestos municipales" = 3,
    "Impuestos Internos" = 99
}
export enum Conceptos {
    "Productos" = 1,
    "Servicios" = 2,
    "Productos y Servicios" = 3
}
export enum DocTipos {
    "CUIT" = 80,
    "DNI" = 96,
    "Sin identificar" = 99
}
export enum AlicuotasIva {
    "0%" = 3,
    "10,5%" = 4,
    "21%" = 5,
    "27%" = 6,
    "5%" = 8,
    "2,5%" = 9
}
export enum DataFactRes {
    "CAE" = "CAE",
    "CAEFchVto" = "CAEFchVto"
}