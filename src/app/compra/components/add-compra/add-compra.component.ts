import { Fecha } from './../../../evento/interfaces/fecha.interface';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Entrada } from '../../../evento/interfaces/entrada.interface';
import { Evento } from '../../../evento/interfaces/evento.interface';
import { EventoService } from '../../../services/evento.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../usuario/interfaces/usuario.interface';
import { Compra } from '../../interfaces/compra.interface';
import { CompraService } from '../../../services/compra.service';
import QRCode from 'qrcode';
import { Autenticacion } from '../../../services/autenticacion.service';
import Swal from 'sweetalert2';
import { PagoService } from '../../../services/pago.service';

declare var MercadoPago: any;

@Component({
  selector: 'app-add-compra',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './add-compra.component.html',
  styleUrl: './add-compra.component.css'
})

export class AddCompraComponent implements OnInit {

  yaCompro = false;
  realizarCompra: boolean = false;
  compraCompletaJson ?: Compra

  userId : string | null = null

  compra: Compra = {
    fechaDeCompra: new Date(),
    cliente: {
      nombre: '',
      email: ''
    },
    evento: {
      nombreEvento: '',
      fechaEvento: new Date()
    },
    entrada: {
      sector: '',
      precioUnitario: 0, //segun el sector que elija
      butaca: []
    },
    cantidad: 1, //segun el input
    precioTotal: 0,
    estado: true,
    alta: true
  }

  evento?: Evento //levantamos el evento COMPLETO
  fechaSeleccionada: Fecha = {
    fecha : new Date(),
    hora : '',
    entradas: [],
    disponibilidadTotal : 0 ,
    habilitado: 1  /* 1 fila habilitada 0 no se puede entrar a la fila */
}

  //el checkbox que selecciona el usuario
  sectorSeleccionado: string = '';
  asientosDisponibles: number = 0

  mensaje: string = ""

  private active = inject(ActivatedRoute)
  private userService = inject(UsuarioService)
  private eventoService = inject(EventoService)
  private compraService = inject(CompraService);
  private pagoService = inject(PagoService);
  private authService = inject(Autenticacion);

  preferencia: any = {};
  cantidad : number = 1

  ngOnInit(): void {

    this.realizarCompra = false

    this.authService.userId.subscribe((id) => {
      this.userId = id;
      console.log('ID Usuario obtenido en compra:', this.userId);
    });

    if (this.userId){

      this.userService.getUsuariosById(this.userId).subscribe({
        next: (usuarioEncontrado: Usuario) => {
          console.log(usuarioEncontrado);
          this.compra.cliente.idCliente = usuarioEncontrado.id
          this.compra.cliente.nombre = usuarioEncontrado.nombre
          this.compra.cliente.email = usuarioEncontrado.email
        },
        error: (e: Error) => {
          console.log(e.message);
        }
      })
    }


    this.active.paramMap.subscribe(param => {
      const eventoId = param.get("idEvento");
      const fechaParam = param.get("fecha");

      this.eventoService.getEventosById(eventoId).subscribe({
        next: (eventoEncontrado: Evento) => {
          this.compra.evento.idEvento = eventoEncontrado.id
          this.compra.evento.nombreEvento = eventoEncontrado.nombreEvento

          this.evento = eventoEncontrado;

          const fechaFiltrada = eventoEncontrado.fechas.find((fecha: Fecha) => {
            const formattedFechaParam = new Date(fechaParam! + "T00:00:00Z").toISOString().slice(0, 10);
            return new Date(fecha.fecha).toISOString().slice(0, 10) === formattedFechaParam;
          });

          if (fechaFiltrada) {
            this.fechaSeleccionada = fechaFiltrada
            this.compra.evento.fechaEvento = fechaFiltrada.fecha;
            console.log("Evento con fecha específica:", this.fechaSeleccionada);
          } else {
            console.log("Fecha no encontrada en el array de fechas del evento.");
          }
        },
        error: (e: Error) => {
          console.log(e.message);
        }
      })
    })

  }

  //va cambiando a medida que en el html selecciona sectores y cantidad
  asignarSectorYPrecio(entrada: Entrada) {
    this.compra.entrada.sector = entrada.nombreSector;
    this.compra.entrada.precioUnitario = entrada.precio;
    this.asientosDisponibles = entrada.disponibles;
    this.actualizarTotalPrecio()
  }

  //se acualiza en base a los sectores y cantidad que pone
  actualizarTotalPrecio() {
    this.compra.precioTotal = this.compra.cantidad * this.compra.entrada.precioUnitario;
    console.log(this.compra);
  }

  ////////////////////////////////////////////////////////////////


  //levanta api de mercado pago
  iniciarPago() {
    this.cantidad = Number(this.compra.cantidad)
    //ponemos de precio 1 para que sea una pruena (para hacerlo real deberia ir tihs.compra.precioTotal)
    this.pagoService.crearPreferencia(this.compra.evento.nombreEvento, this.cantidad, 1)
      .subscribe({
        next: (response: any) => {
          if (response && response.id) {
            const mp = new MercadoPago('APP_USR-a9929fea-ac74-4d7e-b31e-055201ba23a2', {
              locale: 'es-AR'
            });

            mp.checkout({
              preference: { id: response.id },
              autoOpen: true,

            });
          } else {
            console.error('ID de preferencia inválido en la respuesta');
          }
        },
        error: (err: Error) => {
          console.error('Error en la creación de preferencia:', err.message);
        }
      });

      //simula q se realizo el pago
      this.comprarEntrada()

  }


  comprarEntrada() {
    this.actualizarStockEntradas()
    this.editarEvento()
    this.postCompra()
  }


  /////////////////////////////////////////////////////////////


  actualizarStockEntradas() {
    //si es numerado --elegir butaca y ponerle que no esta disponible

    if (this.fechaSeleccionada.entradas) {

      this.fechaSeleccionada.entradas.forEach(entrada => {
        if (entrada.nombreSector == this.compra.entrada.sector) {
          if (entrada.asientos) {
            this.elegirButacaDisponible(entrada, this.compra.cantidad)
          }
          //restamos disponibilidad en fecha elegida en ese sector
          entrada.disponibles = entrada.disponibles - this.compra.cantidad;

          //actualiza el stock total
          this.fechaSeleccionada.disponibilidadTotal = this.fechaSeleccionada.disponibilidadTotal - this.compra.cantidad;
          console.log(this.evento);

        }
      });
    }
  }

  //se llama si el sector que elegimos es numerado true
  elegirButacaDisponible(entrada: Entrada, cantidad: number) {
    let i = 1;
    entrada.asientos.forEach(asiento => {

      if (asiento.disponibilidad == true && i <= cantidad) {
        this.compra.entrada.butaca?.push(asiento.butaca)
        asiento.disponibilidad = false;
        i++;
      }

    });
  }

  postCompra() {
    this.compraService.postCompras(this.compra).subscribe({
      next: (compraCargada : Compra) => {
        this.yaCompro= true
        console.log("compra cargada");
        this.compraCompletaJson = compraCargada
        this.generarQR(this.compraCompletaJson)
      },
      error: (e: Error) => {
        console.log(e.message);
      }
    })
  }

  generarQR (compra: Compra){
    //url ficticio funcionaria cuando se escanea la entrada en el recinto
    const qrUrl = `http://localhost:4200/validar-entrada/${compra.id}`;
    QRCode.toDataURL(qrUrl)
      .then(url=> {
        console.log('url generado con exito');
        //guardo el url en el json de compras
        compra.qrEntrada = url ;

        if (compra.id){
          this.compraService.putCompra(compra.id , compra).subscribe({
            next: ()=> {
              console.log('compra editada con qr');
            },
            error : (e:Error)=> {
              console.log(e.message);
            }
          })
        }

      })
      .catch(e => {
        console.log(e);
      })
  }


  editarEvento() {
    this.evento?.fechas.forEach(fecha => {
      if (fecha.fecha == this.fechaSeleccionada.fecha) {
        fecha = this.fechaSeleccionada;
      }
    });

    if (this.evento?.id) {
      this.eventoService.putEvento(this.evento.id, this.evento).subscribe({
        next: () => {
          console.log('evento editado');
        },
        error: (e: Error) => {
          console.log(e.message);
        }
      })
    }
  }


}







