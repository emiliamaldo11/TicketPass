import { Usuario } from './../../../usuario/interfaces/usuario.interface';
import { Component, inject, Input, OnInit } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { Evento } from '../../interfaces/evento.interface';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import { AddEventoComponent } from "../add-evento/add-evento.component";
import { Fecha } from '../../interfaces/fecha.interface';
import Swal from 'sweetalert2';
import { Autenticacion } from '../../../services/autenticacion.service';
import { DisponibilidadComponent } from "../disponibilidad/disponibilidad.component";
import { RecintoService } from '../../../services/recintos.service';

@Component({
  selector: 'app-detalle-evento',
  standalone: true,
  imports: [CommonModule, RouterModule, AddEventoComponent, DisponibilidadComponent],
  templateUrl: './detalle-evento.component.html',
  styleUrl: './detalle-evento.component.css'
})
export class DetalleEventoComponent implements OnInit {

  private eventosService = inject(EventoService);
  private authService = inject(Autenticacion);
  private recintosService = inject(RecintoService);
  isEditing = false;
  ventana = false;

  eventoSeleccionado: Evento | undefined;
  recintoNombre: string = ''

  id: string | null = ''  //evento
  userId: string | null = ''
  tipo: number | null = null

  private active = inject(ActivatedRoute)

  ngOnInit(): void {

    this.authService.userId.subscribe((id) => {
      this.userId = id;
      console.log('ID Usuario obtenido en detalle:', this.userId);
    });

    this.authService.userType.subscribe((tipo) => {
      this.tipo = tipo;
      console.log('Tipo de usuario:', this.tipo);
    });

    this.active.paramMap.subscribe(param => {
      const id = param.get('id');

      if (id) {
        this.eventosService.getEventosById(id).subscribe({
          next: (eventoSeleccionado: Evento) => {
            this.eventoSeleccionado = eventoSeleccionado;
            this.recintosService.getRecintoById(eventoSeleccionado.recinto_id).subscribe(recinto => {
              this.recintoNombre = recinto.nombreRecinto;
            })
          },
          error: (e: Error) => {
            console.log("Error obteniendo el evento:", e.message);
          }
        });
      } else {
        console.log("ID de evento no encontrado en los parámetros de la ruta.");
      }
    });
  }

  changeEdit() {
    this.isEditing = true;

    setTimeout(() => {
      document.getElementById('editar')?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  }

  //edita el evento
  updateEventos(evento: Evento) {
    this.eventosService.putEvento(evento?.id, evento).subscribe({
      next: () => {
        Swal.fire({
          title: "Event updated successfully",
          confirmButtonColor: "#631BE9",
          icon: "success"

        });
      },
      error: (e: Error) => {
        console.log(e.message);
        Swal.fire({
          title: "Error updating the event",
          confirmButtonColor: "#631BE9",
          icon: "error"
        });
      }
    })
  }

  //si el evento esta deshabilitado NO aparece en el menu principal
  deshabilitarOHabilitar() {
    if (this.eventoSeleccionado) {
      if (this.eventoSeleccionado.alta === 1) {
        this.eventosService.deshabilitarEvento(this.eventoSeleccionado.id, 0).subscribe({
          next: () => {
            Swal.fire({
              title: "Event disabled successfully",
              text: "The event will be hidden from customers",
              confirmButtonColor: "#631BE9",
              icon: "success"
            }).then(() => {
              window.location.reload();
            });
          },
          error: (e: Error) => {
            console.log(e.message);
            Swal.fire({
              title: "Error disabling the event",
              confirmButtonColor: "#631BE9",
              icon: "error"
            })
          }
        })
      }
      else {
        this.eventosService.deshabilitarEvento(this.eventoSeleccionado.id, 1).subscribe({
          next: () => {
            Swal.fire({
              title: "Event enabled successfully",
              text: "The event is now visible to customers.",
              confirmButtonColor: "#631BE9",
              icon: "success"
            }).then(() => {
              window.location.reload();
            });
          },
          error: (e: Error) => {
            console.log(e.message);
            Swal.fire({
              title: "Error disabling the event", confirmButtonColor: "#631BE9",
              icon: "error"
            })
          }
        })
      }
    }

  }

  //si la fila esta deshabilitada el cliente no puede comprar entradas
  cambiarEstadoFila(fecha: Fecha) {
    const fechaActualizar = this.eventoSeleccionado?.fechas.find(f => f.fecha === fecha.fecha);

    if (fechaActualizar) {

      fechaActualizar.habilitado = fechaActualizar.habilitado === 1 ? 0 : 1;
      const accion = fechaActualizar.habilitado === 0 ? 'deshabilitada' : 'habilitada';

      if (this.eventoSeleccionado)
        this.eventosService.putEvento(this.eventoSeleccionado.id, this.eventoSeleccionado).subscribe({
          next: () => {
            Swal.fire({
              title: `Queue ${accion} successfully`,
              text: `The queue is now ${accion === 'habilitada' ? 'visible' : 'hidden'} for customers.`,
              confirmButtonColor: "#631BE9",
              icon: "success"
            }).then(() => {
              window.location.reload();
            });
          },
          error: (e: Error) => {
            console.log(e.message);
            Swal.fire({
              title: `Error trying to ${accion === 'habilitada' ? 'enable' : 'disable'} the queue`,
              confirmButtonColor: "#631BE9",
              icon: "error"
            })
          }
        });
    } else {
      console.error('Fecha no encontrada en eventoSeleccionado');
    }
  }

  confirmarDH() {
    const accion = this.eventoSeleccionado?.alta === 1 ? 'deshabilitar' : 'habilitar';

    Swal.fire({
      title: `Do you want to ${accion} the event?`,
      text: `This action will make the event ${accion === 'deshabilitar' ? 'hidden' : 'visible'} to customers.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#631BE9',
      cancelButtonColor: '#b91c1c',
      confirmButtonText: `Yes, ${accion}`,
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deshabilitarOHabilitar();
      }
    });
  }

  confirmarFila(fecha: Fecha) {
    const fechaActualizar = this.eventoSeleccionado?.fechas.find(f => f.fecha === fecha.fecha);

    if (fechaActualizar) {
      const accion = fechaActualizar.habilitado === 1 ? 'deshabilitar' : 'habilitar';
      Swal.fire({
        title: `Do you want to ${accion} the queue?`,
        text: `This action will make the queue ${accion === 'deshabilitar' ? 'hidden' : 'visible'} to customers.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#631BE9',
        cancelButtonColor: '#b91c1c',
        confirmButtonText: `Yes, ${accion}`,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.cambiarEstadoFila(fecha);
        }
      });
    }
  }

  verDisponibilidad(): void {
    this.ventana = true;
  }

  cerrarVentana(): void {
    this.ventana = false;
  }
}
