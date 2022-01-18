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

    export class Afip {
        constructor(options: options)
    }

    export default Afip;
}
