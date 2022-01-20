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

declare interface datosGenerales {
    domicilioFiscal: {
        codPostal: string,
        descripcionProvincia: string,
        direccion: string,
        idProvincia: number,
        tipoDomicilio: string,
        localidad?: string,
    },
    estadoClave: string,
    idPersona: number,
    mesCierre: number,
    tipoClave: string,
    tipoPersona: "FISICA" | "JURIDICA"
}
declare interface datGenPerFisica extends datosGenerales {
    apellido: string,
    nombre: string
}
declare interface datGenPerJuridica extends datosGenerales {
    fechaContratoSocial: string,
    razonSocial: string
}
declare interface DataCUIT {
    datosGenerales: datGenPerFisica | datGenPerJuridica,
    datosRegimenGeneral?: {
        actividad?: Array<{
            descripcionActividad: string,
            idActividad: number,
            nomenclador: number,
            orden: number,
            periodo: number
        }>,
        impuesto?: Array<{
            descripcionImpuesto: string,
            idImpuesto: number,
            periodo: number
        }>,
        regimen?: Array<{
            descripcionRegimen: string,
            idImpuesto: number,
            idRegimen: number,
            periodo: number,
            tipoRegimen?: string
        }>
    },
    datosMonotributo?: {
        actividad: Array<{
            descripcionActividad: string,
            idActividad: number,
            nomenclador: number,
            orden: number,
            periodo: number
        }>,
        actividadMonotributista: {
            descripcionActividad: string,
            idActividad: number,
            nomenclador: number,
            orden: number,
            periodo: number
        },
        categoriaMonotributo: {
            descripcionCategoria: string,
            idCategoria: number,
            idImpuesto: number,
            periodo: number
        },
        impuesto?: Array<{
            descripcionImpuesto: string,
            idImpuesto: number,
            periodo: number
        }>
    }
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
    Concepto: Conceptos.Productos
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
    Tributos?: Array<{
        id: TiposTributo,
        BaseImp: number,
        Alic: number,
        Importe: number,
        Desc?: string,
    }>,
    Iva?: Array<{
        Id: AlicuotasIva,
        BaseImp: number,
        Importe: number
    }>
}

declare interface FactNotaCred {
    CbtesAsoc: Array<{
        Tipo: CbteTipos,
        PtoVta: number,
        Nro: number,
        Cuit: number
    }>
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

declare module "ts-afip-ws" {
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

    /**
     * Función relacionada con todo lo relaciona a consulta de padrón A5
     * @example
     * //Contiene los siguientes métodos
     * 
     * function getServerStatus() //Obtiene el estado del servicio
     * function getTaxpayerDetails(CUIT: number) //Obtiene todos los datos del contribuyente. Ver interface.
     * 
     *
     */
    interface RegisterScopeFive {

        /**
         * Función para obtener datos de un contribuyente, tipo de consulta A5
         * 
         * @param CUIT cuit del contribuyente a consultar
         * 
         * @example
         * //Esqueleto de la respuesta
         * const DataCUIT = {
                datosGenerales: {
                    domicilioFiscal: {
                    codPostal: string,
                    descripcionProvincia: string,
                    direccion: string,
                    idProvincia: number,
                    tipoDomicilio: string,
                    localidad?: string,
                },
                estadoClave: string,
                idPersona: number,
                mesCierre: number,
                tipoClave: string,
                tipoPersona: "FISICA" | "JURIDICA",
                .
                //Si es persona fisica:
                apellido?: string,
                nombre?: string,
                .
                //Si es persona juridica:
                fechaContratoSocial: string,
                razonSocial: string
                }
                datosRegimenGeneral?: {
                    actividad?: Array<{
                        descripcionActividad: string,
                        idActividad: number,
                        nomenclador: number,
                        orden: number,
                        periodo: number
                    }>,
                    impuesto?: Array<{
                        descripcionImpuesto: string,
                        idImpuesto: number,
                        periodo: number
                    }>,
                    regimen?: Array<{
                        descripcionRegimen: string,
                        idImpuesto: number,
                        idRegimen: number,
                        periodo: number,
                        tipoRegimen?: string
                    }>
                },
                datosMonotributo?: {
                    actividad: Array<{
                        descripcionActividad: string,
                        idActividad: number,
                        nomenclador: number,
                        orden: number,
                        periodo: number
                    }>,
                    actividadMonotributista: {
                        descripcionActividad: string,
                        idActividad: number,
                        nomenclador: number,
                        orden: number,
                        periodo: number
                    },
                    categoriaMonotributo: {
                        descripcionCategoria: string,
                        idCategoria: number,
                        idImpuesto: number,
                        periodo: number
                    },
                    impuesto?: Array<{
                        descripcionImpuesto: string,
                        idImpuesto: number,
                        periodo: number
                    }>
                }
            }
         */
        getTaxpayerDetails(CUIT: number): Promise<DataCUIT> | null,
        /**
         * Obtener el estado de servidores de padrón A5
         * @example
         * //Respuesta de ejemplo, en caso de funcionar
         * {
         * appserver: "OK",
         * dbserver: "OK",
         * authserver: "OK"
         * }
         */
        getServerStatus(): Promise<ServerStatus>
    }


    /**
     * Función relacionada con todo lo relaciona a faturación
     * @example
     * //Contiene los siguientes métodos
     * 
     * function getServerStatus() //Obtiene el estado del servicio
     * function getLastVoucher(pv: number, tipo: number) //Obtiene el último núemro de factura
     * function createVoucher(data:
        FactMonotribProd
        | FactMonotribServ
        | FactMonotribProdNC
        | FactMonotribServNC
        | FactInscriptoProd
        | FactInscriptoServ
        | FactInscriptoProdNC
        | FactInscriptoServNC) //Crea una factura nueva, ver las interfaces para poder crearlas
     * 
     *
     */
    interface ElectronicBilling {
        /**
         * Obtener el estado de servidores de para facturación electrónica
         * @example
         * //Respuesta de ejemplo, en caso de funcionar
         * {
         * appserver: "OK",
         * dbserver: "OK",
         * authserver: "OK"
         * }
         *
         */
        getServerStatus(): Promise<ServerStatus>,
        /**
         * Obtener último comprobante emitido de un punto de venta y tipo de factura
         * @param pv es el punto de venta a consultar
         * @param tipo es el tipo de comprobante, consultar los tipos en https://www.afip.gob.ar/canasta-alimentaria/documentos/Tipos-de-comprobantes-de-ventas.pdf, en este paquete hay un enum con los más usados
         * @example
         * //La respuesta siempre es un número, en caso de no corresponder salta un error del servidor. Capturar con un catch y try
         * try {
         *     const ultFact = await this.afip.ElectronicBilling.getLastVoucher(pv, tipo);
         *     return ultFact;
         *   } catch (error) {
         *     throw new Error(error)
         *   }
         *
         */
        getLastVoucher(pv: number, tipo: number): Promise<number>,
        /**
         * Crear un nuevo comprobante
         * @param data Acá tiene que ir todo lo necesario para crear un nuevo comprobante, en las interfaces verá todo lo necesario. 
         * @example
         * //Hay datos generales que se le pide a todas las facturas:
         * const dataFactReq = {
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
                .
                .                
         * //Los demas datos van a depender Tipo de venta:
         * //Productos
         *      .
         *      Concepto: "Productos"
         *      .
         * // Servicios
         *      .
         *      Concepto: "Servicios",
                FchServDesde: string,
                FchServHasta: string,
                FchVtoPago: string
                .
         * 
         * //Y tambien de si es Monotributista:
         *      .
         *      ImpTotConc: 0,
                ImpNeto: number,
                ImpOpEx: 0,
                ImpIVA: 0,
                ImpTrib: 0
                .
         *  //O si es inscripto (Res inscripto, Exento, etc...) 
         *      .
         *      ImpTotConc: number,
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
         *      }

         * //Puede utilizar la función de obetener la última factura para crear una nueva (usando la siguiente)
         *  const nfact = await this.lastFact(dataFactReq.PtoVta, dataFactReq.CbteTipo);
            dataFactReq.CbteDesde = Number(nfact.data) + 1;
            const dataFactRes = await this.afip.ElectronicBilling.createVoucher(dataFactReq);
            dataFactReq.CAE = dataFactRes.CAE
            dataFactReq.CAEFchVto = dataFactRes.CAEFchVto
            return dataFactReq
            //Obtiene todos los datos de la factura, junto con el CAE y VtoCAE
            @returns dataFactReq
         *
         */
        createVoucher(data:
            FactMonotribProd
            | FactMonotribServ
            | FactMonotribProdNC
            | FactMonotribServNC
            | FactInscriptoProd
            | FactInscriptoServ
            | FactInscriptoProdNC
            | FactInscriptoServNC
        ): Promise<
            FactMonotribProd
            | FactMonotribServ
            | FactMonotribProdNC
            | FactMonotribServNC
            | FactInscriptoProd
            | FactInscriptoServ
            | FactInscriptoProdNC
            | FactInscriptoServNC
        >,

        /**
         * Obtener información de un comprobante en particular
         * @param ncbte en el nñumero de factura o recibo a consultar
         * @param pv es el punto de venta a consultar
         * @param tipo es el tipo de comprobante, consultar los tipos en https://www.afip.gob.ar/canasta-alimentaria/documentos/Tipos-de-comprobantes-de-ventas.pdf, en este paquete hay un enum con los más usados
         * @example
         * //La respuesta es un objeto con toda la información del comprobante, tal cual como en la interfaz presente:
         * const dataFactReq = {
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
                .
                .                
         * //Los demas datos van a depender Tipo de venta:
         * //Productos
         *      .
         *      Concepto: "Productos"
         *      .
         * // Servicios
         *      .
         *      Concepto: "Servicios",
                FchServDesde: string,
                FchServHasta: string,
                FchVtoPago: string
                .
         * 
         * //Y tambien de si es Monotributista:
         *      .
         *      ImpTotConc: 0,
                ImpNeto: number,
                ImpOpEx: 0,
                ImpIVA: 0,
                ImpTrib: 0
                .
         *  //O si es inscripto (Res inscripto, Exento, etc...) 
         *      .
         *      ImpTotConc: number,
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
         *      }
         *
         */
        getVoucherInfo(ncbte: number, pv: number, tipo: CbteTipos): Promise<
            FactMonotribProd
            | FactMonotribServ
            | FactMonotribProdNC
            | FactMonotribServNC
            | FactInscriptoProd
            | FactInscriptoServ
            | FactInscriptoProdNC
            | FactInscriptoServNC
        >
    }

    export interface Afip {
        RegisterScopeFive: RegisterScopeFive,
        ElectronicBilling: ElectronicBilling
    }

    /**
     * Instrucciones para armar el objeto AFIP y con él realizar las consultas
     * @param CUIT Es el cuit del contribuyente, quién va a realizar la consulta.
     * @param res_folder Es el directorio raíz del certificado y la llave       
     * @param cert Es el nombre del certificado.       
     * @param key Es el nombre de la llave.
     * @param ta_folder Es el directorio raíz donde se almacenarán los token.      
     * @param production Es el ambiente en el que se va a consultar (True | False). 
     *       
     * @example
     * //Se importa el módulo jretondo-afip-ws 
     * import Afip from 'ts-afip-ws';
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
