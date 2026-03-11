import { Component, inject, Input } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Evento } from '../../interfaces/evento.interface';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../usuario/interfaces/usuario.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-eventos-admin',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './list-eventos-admin.component.html',
  styleUrl: './list-eventos-admin.component.css'
})

//muestra TODOS los eventos esten o no habilitados
export class ListEventosAdminComponent {

  userId: string | null = ''

  private userService = inject(UsuarioService)
  private active = inject(ActivatedRoute)

  ngOnInit(): void {

    this.active.paramMap.subscribe(param => {
      this.userId = param.get('id');
    })

    this.listarEventos();
  }

  eventosService= inject(EventoService);
  listaEventos: Evento [] = [];

  listarEventos()
  {
    this.eventosService.getEventos().subscribe(
      {
        next: (eventos: Evento[])=>{
          this.listaEventos= eventos;
        },
        error: (err)=> {
          console.error('Error al levantar eventos:', err);
        }
      }
    )
  }

  cambioAlta (evento: Evento){

    const accion = evento.alta === 1 ? 'deshabilitado' : 'habilitado';
    evento.alta = evento.alta === 1 ? 0 : 1;

    this.eventosService.putEvento(evento.id, evento).subscribe({
      next:()=>{
        Swal.fire({
          title: `Evento ${accion} correctamente`,
          text: `El evento esta ${accion === 'deshabilitado' ? 'oculto' : 'visible'} para los clientes`,
          confirmButtonColor: "#631BE9",
          icon: "success"
        });
      },
      error:(e: Error)=>{
        console.log(e.message);
        Swal.fire({
          title: `Error al ${accion === 'habilitado' ? 'habilitar' : 'deshabilitar'} el evento`,
          confirmButtonColor: "#631BE9",
          icon: "error"
        })
      }
    })

  }

  confirmarDH(evento: Evento){

    const accion = evento.alta === 1 ? 'deshabilitar' : 'habilitar';

    Swal.fire({
      title: `¿Desea ${accion} el evento?`,
      text: `Esta acción hará que el evento esté ${accion === 'deshabilitar' ? 'oculto' : 'visible'} para los clientes.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#631BE9',
      cancelButtonColor: '#b91c1c',
      confirmButtonText: `Si, ${accion}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cambioAlta(evento);
      }
    });
  }
}


