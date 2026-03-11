import { Component, OnInit, inject } from '@angular/core';
import { Recinto } from '../../interfaces/recinto.interface';
import { ActivatedRoute } from '@angular/router';
import { RecintoService } from '../../../services/recintos.service';
import { CommonModule } from '@angular/common';
import { AddRecintoComponent } from "../add-recinto/add-recinto.component";

@Component({
  selector: 'app-detalle-recinto',
  standalone: true,
  imports: [CommonModule, AddRecintoComponent, CommonModule],
  templateUrl: './detalle-recinto.component.html',
  styleUrl: './detalle-recinto.component.css'
})

export class DetalleRecintoComponent implements OnInit {

  idRecinto: number | null = null
  recinto?: Recinto

  mostrarEditar = false

  private activated = inject(ActivatedRoute)
  private recintoService = inject(RecintoService)

  ngOnInit(): void {
    this.activated.paramMap.subscribe(param => {
      this.idRecinto = Number(param.get("id"));

      this.recintoService.getRecintoById(this.idRecinto).subscribe({
        next: (encontrado: Recinto) => {
          this.recinto = encontrado;
        },
        error: (e: Error) => {
          console.log(e.message);
        }
      })
    })
  }

  mostrarForm() {



    setTimeout(() => {
      document.getElementById('editar')?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);

    this.mostrarEditar = !this.mostrarEditar
  }


}
