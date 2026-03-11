import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CompraService } from '../../../services/compra.service';
import { Compra } from '../../interfaces/compra.interface';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { FiltrarComprasComponent } from "../filtrar-compras/filtrar-compras.component";
import { CommonModule } from '@angular/common';
import { EventoService } from '../../../services/evento.service';
import { Evento } from '../../../evento/interfaces/evento.interface';
import { ComprasDevueltasService } from '../../../services/compras-devueltas.service';


@Component({
  selector: 'app-list-entradas-admin',
  standalone: true,
  imports: [RouterModule, FiltrarComprasComponent, CommonModule],
  templateUrl: './list-entradas-admin.component.html',
  styleUrl: './list-entradas-admin.component.css'
})
export class ListEntradasAdminComponent implements OnInit {

  private compraService = inject(CompraService)
  private eventoService = inject(EventoService)
  private compraDevueltaService = inject(ComprasDevueltasService)

  filtro: string = 'todos'

  compras?: Compra[]
  comprasFiltradas?: Compra[]

  listadoEventosFiltros: { id?: string; nombreEvento: string, alta: number }[] = [];
  eventos: Evento[] = [] //levanto los eventos para poder editar si se repone stock

  comprasDevueltas: string[] = [];


  ngOnInit(): void {
    this.compraService.getCompras().subscribe({
      next: (comprasJson: Compra[]) => {
        this.compras = comprasJson
        this.comprasFiltradas = this.compras
      },
      error: (e: Error) => {
        console.log(e.message);
      }
    })

    this.eventoService.getEventosIdsYNombre().subscribe({
      next: (eventos) => {
        this.listadoEventosFiltros = eventos
        console.log(this.listadoEventosFiltros);
      },
      error: (e: Error) => {
        console.log(e.message);
      }
    })

    this.eventoService.getEventos().subscribe({
      next: (eventosJson: Evento[]) => {
        this.eventos = eventosJson
      },
      error: (e: Error) => {
        console.log(e.message);
      }
    })

    this.compraDevueltaService.getComprasDevueltas().subscribe({
      next: (comprasDevJson: { id: string }[]) => {
        this.comprasDevueltas = comprasDevJson.map(compra => compra.id);
        console.log('Compras Devueltas cargadas:', this.comprasDevueltas);
      },
      error: (e: Error) => {
        console.error('Error al cargar compras devueltas:', e.message);
      }
    });

  }

  habilitarDeshabilitar(compra: Compra) {
    const accion = compra.alta ? 'deshabilitado' : 'habilitado';
    compra.alta = !compra.alta;
    if (compra.id)
      this.compraService.putCompra(compra.id, compra).subscribe({
        next: () => {
          Swal.fire({
            title: `Recinto ${accion} correctamente`,
            confirmButtonColor: "#631BE9",
            icon: "success"
          });
        },
        error: (e: Error) => {
          console.log(e.message);
          Swal.fire({
            title: `Error al ${accion === 'habilitado' ? 'habilitar' : 'deshabilitar'} el recinto`,
            confirmButtonColor: "#631BE9",
            icon: "error"
          });
        }
      })
  }

  confirmarDHR(compra: Compra) {

    const accion = compra.alta ? 'dar de baja' : 'habilitar';

    Swal.fire({
      title: `¿Desea ${accion} la compra?`,
      text: `Esta acción hará que la compra ${accion === 'dar de baja' ? 'se deshabilite' : 'se habilite'} `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#631BE9',
      cancelButtonColor: '#b91c1c',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.habilitarDeshabilitar(compra);
      }
    });
  }

  //filtros
  filtrarComprasPorEstado(estado: string): void {
    this.filtro = estado;
    if (estado === 'habilitado') {
      this.comprasFiltradas = this.compras?.filter(compra => compra.alta === true);
    } else if (estado === 'deshabilitado') {
      this.comprasFiltradas = this.compras?.filter(compra => compra.alta === false);
    } else {
      this.comprasFiltradas = this.compras;
    }
  }

  filtrarComprasPorShow(idEvento?: string) {
    this.filtro = "show"
    this.comprasFiltradas = this.compras?.filter(compra => compra.evento.idEvento === idEvento);
  }
   /////////////////


  //las puse asincronicas porque sino se pisaban las actualizaciones
  async reponerStockTodas() {

    if (!this.comprasFiltradas || !this.eventos) {
      console.error('No hay compras o eventos');
      return;
    }

    console.log(this.comprasFiltradas);

    for (const compra of this.comprasFiltradas) {
      await this.reponerStockIndividual(compra);
    }
  }

  async reponerStockIndividual(compra: Compra): Promise<void> {

    if (this.yaRespusoStock(compra.id)) {
      console.log(`Stock repuesto con exito: ${compra.id}`);
      return;
    }

    //la compra tiene q estar deshabilitada para reponer el stock
    if (compra.alta === false) {
      //busca el evento que pertenece la compra
      const eventoEncontrado = this.eventos.find(evento => evento.id === compra.evento.idEvento);

      if (eventoEncontrado) {
        //busca la fecha especifica
        const fechaEvento = eventoEncontrado.fechas.find(fechaBuscada => fechaBuscada.fecha === compra.evento.fechaEvento);

        if (fechaEvento) {
          //repone en la disponiblidad total de esa fecha la cantidad de entradas que compro
          fechaEvento.disponibilidadTotal = fechaEvento.disponibilidadTotal + Number(compra.cantidad);

          const entradaEncontrada = fechaEvento.entradas.find(entrada => entrada.nombreSector === compra.entrada.sector);

          if (entradaEncontrada) {
            //repone en ese sector especifico la cantidad
             entradaEncontrada.disponibles += Number(compra.cantidad);

             //si el sector tiene butacas repone la disponiblidad a true
            if (entradaEncontrada.asientos.length > 0) {
                compra.entrada.butaca?.forEach(butacaComprada => {
                const asiento = entradaEncontrada.asientos.find(asiento => asiento.butaca === butacaComprada);
                if (asiento) {
                  asiento.disponibilidad = true;
                }
              });
            }
          }

          //edita el evento con los cambios de stock
          this.eventoService.putEvento(eventoEncontrado.id, eventoEncontrado).subscribe({
            next: () => {
              console.log('Evento editado correctamente.');
            },
            error: error => {
              console.error('Error al editar evento:', error);
            }
          });

          await this.registrarCompraDevuelta(compra);
        }
      }
    }
  }


  //guarda el id de las compras devueltas en un json (las compras devueltas no se pueden volver a habilitar)
  registrarCompraDevuelta(compra: Compra): Promise<void> {
    return new Promise((resolve, reject) => {
      this.compraDevueltaService.postCompraDevuelta(compra.id).subscribe({
        next: () => {
          console.log('Compra devuelta registrada:', compra.id);
          if (compra.id) {
            this.comprasDevueltas.push(compra.id);
          }
          resolve();
        },
        error: (error) => {
          console.error('Error al registrar compra devuelta:', error);
          reject(error);
        }
      });
    });
  }

  //verficia si ya se devolvio
  yaRespusoStock(id?: string): boolean {
    return id ? this.comprasDevueltas.includes(id) : false;
  }


  //verifica si en las entradas que filtro hay alguna para reponer (es para el btn de devolver todas)
encontroCompraParaReponer(): boolean {
  if (!this.comprasFiltradas || this.comprasFiltradas.length === 0) {
    return false;
  }

  const hayParaReponer = this.comprasFiltradas.some(compra =>
    compra.id !== undefined &&
    !this.comprasDevueltas.includes(compra.id) &&
    compra.alta === false
  );

  return hayParaReponer;

}

confirmarReponerIndividual(compra: Compra){

  Swal.fire({
    title: '¿Desea reponer el stock de esta entrada?',
    text: 'Esta acción no permitira habilitar la entrada',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#631BE9',
    cancelButtonColor:'#b91c1c',
    confirmButtonText: 'Sí, reponer stock',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.reponerStockIndividual(compra);
    }
  });
}

confirmarReponerTodas (){
  Swal.fire({
    title: '¿Desea reponer el stock de todas las entradas deshabilitadas?',
    text: 'Esta acción no permitira habilitar las entradas',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#631BE9',
    cancelButtonColor: '#b91c1c',
    confirmButtonText: 'Sí, reponer stock',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.reponerStockTodas();
    }
  });
}

}
