import { Component, Input } from '@angular/core';
import { ListEventosAdminComponent } from '../../components/list-eventos-admin/list-eventos-admin.component';
import { FiltrarEventoComponent } from '../../components/filtrar-eventos/filtrar-eventos.component';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-list-admin',
  standalone: true,
  imports: [ListEventosAdminComponent, RouterModule, FiltrarEventoComponent],
  templateUrl: './page-list-admin.component.html',
  styleUrl: './page-list-admin.component.css'
})
export class PageListAdminComponent {

  id: string | null = '';
  filter : 'all' | 'disabled' = 'all'

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get("id");
    });
  }
}

