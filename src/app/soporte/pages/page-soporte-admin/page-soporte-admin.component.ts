import { Component, OnInit } from '@angular/core';
import { PreguntaFrecuente } from '../../interfaces/pregunta-frecuente';
import { PreguntasfrecuentesService } from '../../../services/preguntasfrecuentes.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-page-soporte-admin',
  standalone: true,
  imports: [NgFor, RouterModule, NgClass],
  templateUrl: './page-soporte-admin.component.html',
  styleUrl: './page-soporte-admin.component.css'
})

export class AdminPreguntasComponent implements OnInit {
  preguntas: PreguntaFrecuente[] = [];

  constructor(private preguntaService: PreguntasfrecuentesService) {}

  ngOnInit(): void {
    this.preguntaService.getPreguntas().subscribe((data) => {
      this.preguntas = data.map(pregunta => ({ ...pregunta, mostrar: false }));
    });
  }

  eliminarPregunta(id: number): void {
    Swal.fire({
      title: `¿Desea eliminar la pregunta?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#631BE9',
      cancelButtonColor: "#ff4845",
      confirmButtonText: `Si, eliminar`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.preguntaService.deletePregunta(id).subscribe(() => {
          this.preguntas = this.preguntas.filter(p => p.id !== id);
        });
      }
    });
  }

  preguntaSeleccionada: number | null = null;

}


