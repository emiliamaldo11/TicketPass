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
export class DetalleEventoComponent implements OnInit{

  private eventosService= inject(EventoService);
  private authService = inject(Autenticacion);
    private recintosService = inject(RecintoService);
  isEditing = false;
  ventana= false;

  eventoSeleccionado: Evento | undefined;
  recintoNombre: string = ''

  id: string | null = ''  //evento
  userId: string | null = ''
  tipo : number | null = null

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
    this.isEditing = !this.isEditing;
    console.log(this.eventoSeleccionado?.alta);
  }

  //edita el evento
  updateEventos(evento: Evento){
    this.eventosService.putEvento(evento?.id, evento).subscribe({
      next:()=>{
        Swal.fire({
          title: "Evento editado correctamente",
          confirmButtonColor: "#36173d",
          icon: "success"
        });
      },
      error:(e: Error)=>{
        console.log(e.message);
        Swal.fire({
          title: "Error al editar el evento",
          confirmButtonColor: "#36173d",
          icon: "error"
        });
      }
    })
  }

  //si el evento esta deshabilitado NO aparece en el menu principal
   deshabilitarOHabilitar(){
    if(this.eventoSeleccionado){
      if(this.eventoSeleccionado.alta === 1)
        {
          this.eventosService.deshabilitarEvento(this.eventoSeleccionado.id, 0).subscribe({
            next:()=>{
              Swal.fire({
                title: "Evento deshabilitado correctamente",
                text: "El evento estara oculto para los clientes",
                confirmButtonColor: "#36173d",
                icon: "success"
              }).then(() => {
                window.location.reload();
              });
            },
            error:(e: Error)=>{
              console.log(e.message);
              Swal.fire({
                title: "Error al deshabilitar el evento",
                confirmButtonColor: "#36173d",
                icon: "error"
              })
            }
          })
        }
        else
          {
            this.eventosService.deshabilitarEvento(this.eventoSeleccionado.id, 1).subscribe({
              next:()=>{
                Swal.fire({
                  title: "Evento habilitado correctamente",
                  text: "El evento esta visible para los clientes.",
                  confirmButtonColor: "#36173d",
                  icon: "success"
                }).then(() => {
                  window.location.reload();
                });
              },
              error:(e: Error)=>{
                console.log(e.message);
                Swal.fire({
                  title: "Error al deshabilitar el evento",
                  confirmButtonColor: "#36173d",
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
        next:()=>{
          Swal.fire({
            title: `Fila ${accion} correctamente`,
            text: `La fila ahora está ${accion === 'habilitada' ? 'visible' : 'oculta'} para los clientes.`,
            confirmButtonColor: "#36173d",
            icon: "success"
          }).then(() => {
            window.location.reload();
          });
        },
        error:(e: Error)=>{
          console.log(e.message);
          Swal.fire({
            title: `Error al ${accion === 'habilitada' ? 'habilitar' : 'deshabilitar'} la fila`,
            confirmButtonColor: "#36173d",
            icon: "error"
          })
        }
      });
    } else {
      console.error('Fecha no encontrada en eventoSeleccionado');
    }
  }

  confirmarDH(){
    const accion = this.eventoSeleccionado?.alta === 1 ? 'deshabilitar' : 'habilitar';

    Swal.fire({
      title: `¿Desea ${accion} el evento?`,
      text: `Esta acción hará que el evento esté ${accion === 'deshabilitar' ? 'oculto' : 'visible'} para los clientes.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#36173d',
      cancelButtonColor: "#ff4845",
      confirmButtonText: `Si, ${accion}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deshabilitarOHabilitar();
      }
    });
  }

  confirmarFila(fecha: Fecha){
    const fechaActualizar = this.eventoSeleccionado?.fechas.find(f => f.fecha === fecha.fecha);

    if (fechaActualizar) {
      const accion = fechaActualizar.habilitado === 1 ? 'deshabilitar' : 'habilitar';
      Swal.fire({
        title: `¿Desea ${accion} la fila?`,
        text: `Esta acción hará que la fila esté ${accion === 'deshabilitar' ? 'oculto' : 'visible'} para los clientes.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#36173d',
        cancelButtonColor: "#ff4845",
        confirmButtonText: `Si, ${accion}`,
        cancelButtonText: 'Cancelar'
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
