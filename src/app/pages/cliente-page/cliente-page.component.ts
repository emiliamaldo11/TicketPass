import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ListEventoComponent } from '../../evento/components/list-evento/list-evento.component';
import { Usuario } from '../../usuario/interfaces/usuario.interface';
import { FiltrarEventoComponent } from '../../evento/components/filtrar-eventos/filtrar-eventos.component';
import { Autenticacion } from '../../services/autenticacion.service';
import { ListBannersComponent } from "../../evento/components/list-banners/list-banners.component";

@Component({
  selector: 'app-cliente-page',
  standalone: true,
  imports: [ListEventoComponent, FiltrarEventoComponent, ListBannersComponent],
  templateUrl: './cliente-page.component.html',
  styleUrl: './cliente-page.component.css'
})

//es el menu principal  '' // 'usuarios/:id'
export class ClientePageComponent implements OnInit{

  id: string | null = ''
  private authService = inject(Autenticacion)

  usuario : Usuario | undefined

  ngOnInit(): void {
    this.authService.userId.subscribe((id) => {
      this.id = id;
      console.log('ID Usuario obtenido en page:', this.id);
    });

  }
}


