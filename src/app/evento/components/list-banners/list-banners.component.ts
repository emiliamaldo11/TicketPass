import { Component, inject, OnInit } from '@angular/core';
import { Autenticacion } from '../../../services/autenticacion.service';
import { Evento } from '../../interfaces/evento.interface';
import { EventoService } from '../../../services/evento.service';
import { CommonModule } from '@angular/common';
import { RouterModule, } from '@angular/router';

@Component({
  selector: 'app-list-banners',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-banners.component.html',
  styleUrl: './list-banners.component.css'
})
export class ListBannersComponent implements OnInit{

  private authService = inject(Autenticacion)
  private eventosService = inject(EventoService)
  userId : string | null = ''

  listEventos :Evento[] = []

  ngOnInit(): void {
    this.authService.userId.subscribe((id) => {
      this.userId = id;
      console.log('ID Usuario obtenido en list:', this.userId);
    });

    this.listarEventos()

  }


  listarEventos() {
    this.eventosService.getEventos().subscribe(
      {
        next: (eventos: Evento[]) => {
          this.listEventos = eventos;
        },
        error: (err) => {
          console.error('Error al levantar eventos:', err);
        }
      }
    )
  }


  }




