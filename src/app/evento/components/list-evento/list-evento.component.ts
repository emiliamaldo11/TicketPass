import { Component, inject, Input, OnInit } from '@angular/core';
import { AddEventoComponent } from '../add-evento/add-evento.component';
import { Evento } from '../../interfaces/evento.interface';
import { EventoService } from '../../../services/evento.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Autenticacion } from '../../../services/autenticacion.service';
import { RecintoService } from '../../../services/recintos.service';

@Component({
  selector: 'app-list-evento',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './list-evento.component.html',
  styleUrl: './list-evento.component.css'
})

//compartida con cliente y admin, con visual principal
export class ListEventoComponent implements OnInit {

  userId: string | null = '' //id del evento

  private authService = inject(Autenticacion)
  private eventosService = inject(EventoService);
  private recintosService = inject(RecintoService)
  listaEventos: Evento[] = [];
  recintosNombres: { [key: number]: string } = {};



  ngOnInit(): void {
    this.authService.userId.subscribe((id) => {
      this.userId = id;
      console.log('ID Usuario obtenido en list:', this.userId);
    });

    this.listarEventos();
  }

  listarEventos() {
    this.eventosService.getEventos().subscribe(
      {
        next: (eventos: Evento[]) => {
          this.listaEventos = eventos;

          eventos.forEach(evento => {
            this.recintosService.getRecintoById(evento.recinto_id)
              .subscribe(recinto => {
                this.recintosNombres[evento.recinto_id] = recinto.nombreRecinto;
              })
          })


        },
        error: (err) => {
          console.error('Error al levantar eventos:', err);
        }
      }
    )
  }


  currentIndex: number = 0;


  //carrousel de banners de eventos
  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.listaEventos.filter(evento => evento.alta === 1).length;
  }

  prevSlide() {
    this.currentIndex =
      (this.currentIndex - 1 + this.listaEventos.filter(evento => evento.alta === 1).length) %
      this.listaEventos.filter(evento => evento.alta === 1).length;
  }


}
