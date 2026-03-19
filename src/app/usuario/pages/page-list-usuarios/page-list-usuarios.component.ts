import { Component } from '@angular/core';
import { ListUsuarioComponent } from '../../component/list-usuario/list-usuario.component';
import { FiltrarUsuariosComponent } from '../../component/filtrar-usuarios/filtrar-usuarios.component';

@Component({
  selector: 'app-page-list-usuarios',
  standalone: true,
  imports: [ListUsuarioComponent, FiltrarUsuariosComponent],
  templateUrl: './page-list-usuarios.component.html',
  styleUrl: './page-list-usuarios.component.css'
})
export class PageListUsuariosComponent {

  filter : 'all' | 'disabled' = 'all';

}
