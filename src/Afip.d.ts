//Estaticos
declare enum CbteTipos {
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
declare enum TiposTributo {
    "Impuestos nacionales" = 1,
    "Impuestos provinciales" = 2,
    "Impuestos municipales" = 3,
    "Impuestos Internos" = 99
}
declare enum Conceptos {
    "Productos" = 1,
    "Servicios" = 2,
    "Productos y Servicios" = 3
}
declare enum DocTipos {
    "CUIT" = 80,
    "DNI" = 96,
    "Sin identificar" = 99
}
declare enum AlicuotasIva {
    "0%" = 3,
    "10,5%" = 4,
    "21%" = 5,
    "27%" = 6,
    "5%" = 8,
    "2,5%" = 9
}

declare interface FactBase {
    CantReg: number,
    PtoVta: number,
    CbteTipo: CbteTipos,
    DocTipo: DocTipos,
    DocNro: number,
    CbteFch: string,
    ImpTotal: number,
    MonCotiz: 1,
    MonId: "PES",
    CbteDesde?: number,
    CbteHasta?: number,
    CAE?: string,
    CAEFchVto?: string
}

declare interface FactServicios {
    Concepto: Conceptos.Servicios,
    FchServDesde: string,
    FchServHasta: string,
    FchVtoPago: string
}

declare interface FactProductos {
    Concepto: Conceptos.Productos,
    FchServDesde: null,
    FchServHasta: null,
    FchVtoPago: null
}

declare interface FactMonotrib {
    ImpTotConc: 0,
    ImpNeto: number,
    ImpOpEx: 0,
    ImpIVA: 0,
    ImpTrib: 0
}

declare interface FactInscriptos {
    ImpTotConc: number,
    ImpNeto: number,
    ImpOpEx: number,
    ImpIVA: number,
    ImpTrib: number,
    Tributos?: {
        id: TiposTributo,
        BaseImp: number,
        Alic: number,
        Importe: number,
        Desc?: string,
    },
    Iva?: {
        Id: AlicuotasIva,
        BaseImp: number,
        Importe: number
    }
}

declare interface FactNotaCred {
    CbtesAsoc: {
        Tipo: CbteTipos,
        PtoVta: number,
        Nro: number,
        Cuit: number
    }
}

declare interface FactMonotribProd extends FactBase, FactMonotrib, FactProductos {
}
declare interface FactMonotribServ extends FactBase, FactMonotrib, FactServicios {
}
declare interface FactMonotribProdNC extends FactBase, FactMonotrib, FactProductos, FactNotaCred {
}
declare interface FactMonotribServNC extends FactBase, FactMonotrib, FactServicios, FactNotaCred {
}

declare interface FactInscriptoProd extends FactBase, FactInscriptos, FactProductos {
}
declare interface FactInscriptoServ extends FactBase, FactInscriptos, FactServicios {
}
declare interface FactInscriptoProdNC extends FactBase, FactInscriptos, FactProductos, FactNotaCred {
}
declare interface FactInscriptoServNC extends FactBase, FactInscriptos, FactServicios, FactNotaCred {
}

declare module "jretondo-afip-ws" {
    interface options {
        CUIT: number,
        res_folder: string,
        cert: string,
        key: string,
        ta_folder: string,
        production: boolean
    }

    interface ServerStatus {
        appserver: string,
        dbserver: string,
        authserver: string
    }

    interface RegisterScopeFive {
        getTaxpayerDetails(CUIT: number): Promise<any> | null,
        getServerStatus(): Promise<ServerStatus>
    }

    interface ElectronicBilling {
        getServerStatus(): Promise<ServerStatus>,
        getLastVoucher(pv: number, tipo: number): Promise<number>,
        createVoucher(data:
            FactMonotribProd
            | FactMonotribServ
            | FactMonotribProdNC
            | FactMonotribServNC
            | FactInscriptoProd
            | FactInscriptoServ
            | FactInscriptoProdNC
            | FactInscriptoServNC
        ): Promise<{
            CAE: string,
            CAEFchVto: string
        }>
    }

    export interface Afip {
        RegisterScopeFive: RegisterScopeFive,
        ElectronicBilling: ElectronicBilling
    }

    /**
     * @param CUIT Es el cuit del contribuyente, quién va a realizar la consulta.
     * @param res_folder Es el directorio raíz del certificado y la llave       
     * @param cert Es el nombre del certificado.       
     * @param key Es el nombre de la llave.
     * @param ta_folder Es el directorio raíz donde se almacenarán los token.      
     * @param production Es el ambiente en el que se va a consultar (True | False). 
     *       
     * @example
     * //Se importa el módulo jretondo-afip-ws 
     * import Afip from 'jretondo-afip-ws';
     * 
     * //Cree una interface con la respuesta que va a esperar a la salida
     * interface ResponseAfip {
        status: 200 | 500,
        data: any
        }
     * 
     * //Luego recomiendo crear una clase para trabajar sobre ella con los métodos que mejor se acomoden
     * export class AfipClass {
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

    //Hay un archivo de ejemplo AfipClass.ts con algunos enum e interfaces
     *
     */
    export class Afip {
        constructor(options: options)
    }

    export default Afip;
}
