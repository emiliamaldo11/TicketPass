
export interface Compra {
  id?: string,
  fechaDeCompra: Date,
  cliente: {
    idCliente?: string,
    nombre: string,
    email: string
  },
  evento: {
    idEvento?: string,
    nombreEvento: string,
    artista: string,
    fechaEvento: Date | null
  },
  entrada: {
    sector: string,
    butaca?: number[],
    precioUnitario: number
  },
  cantidad: number,
  precioTotal: number,
  qrEntrada ?: string,
  estado: boolean //estado de pago
  alta: boolean
}
