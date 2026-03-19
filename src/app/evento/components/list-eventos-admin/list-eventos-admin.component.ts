import { Component, inject, Input } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Evento } from '../../interfaces/evento.interface';
import { UsuarioService } from '../../../services/usuario.service';
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

  @Input() filter: string = 'all';

  userId: string | null = ''

  private userService = inject(UsuarioService)
  private active = inject(ActivatedRoute)

  eventosService = inject(EventoService);
  listaEventos: Evento[] = [];
  listaFiltrados: Evento[] = []


  ngOnInit(): void {

    this.active.paramMap.subscribe(param => {
      this.userId = param.get('id');
    })

    this.listarEventos();
  }



  listarEventos() {
    this.eventosService.getEventos().subscribe(
      {
        next: (eventos: Evento[]) => {
          this.listaEventos = eventos;
          this.listaFiltrados = eventos.filter(e => !e.alta)
        },
        error: (err) => {
          console.error('Error al levantar eventos:', err);
        }
      }
    )
  }

  cambioAlta(evento: Evento) {

    const accion = evento.alta === 1 ? 'deshabilitado' : 'habilitado';
    evento.alta = evento.alta === 1 ? 0 : 1;

    this.eventosService.putEvento(evento.id, evento).subscribe({
      next: () => {
        Swal.fire({
          title: `Event ${accion} successfully`,
          text: `The event is now ${accion === 'deshabilitado' ? 'hidden' : 'visible'} to customers`,
          confirmButtonColor: "#631BE9",
          icon: "success"
        });
      },
      error: (e: Error) => {
        console.log(e.message);
        Swal.fire({
          title: `Error while ${accion === 'habilitado' ? 'enabling' : 'disabling'} the event`,
          confirmButtonColor: "#631BE9",
          icon: "error"
        })
      }
    })

  }

  confirmarDH(evento: Evento) {

    const accion = evento.alta === 1 ? 'disable' : 'enable';
    Swal.fire({
      title: `Do you want to ${accion} the event?`,
      text: `This action will make the event ${accion === 'disable' ? 'hidden' : 'visible'} to customers.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#631BE9',
      cancelButtonColor: '#b91c1c',
      confirmButtonText: `Yes, ${accion}`,
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cambioAlta(evento);
      }
    });
  }
}


