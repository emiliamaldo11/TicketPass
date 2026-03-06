import { Component, NgModule } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { PreguntaFrecuente } from '../../interfaces/pregunta-frecuente';
import { PreguntasfrecuentesService } from '../../../services/preguntasfrecuentes.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-pregunta',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-pregunta.component.html',
  styleUrl: './add-pregunta.component.css'
})
export class AddPreguntaComponent {

  constructor (private preguntasFrecuentesService: PreguntasfrecuentesService, private router: Router){}


  nuevaPregunta: PreguntaFrecuente = {
    id: 0,
    pregunta: '',
    respuesta: ''
  };

  agregarPregunta() {
    if (this.nuevaPregunta.pregunta.trim() && this.nuevaPregunta.respuesta.trim()) {
      this.nuevaPregunta.id = Date.now();
      this.preguntasFrecuentesService.postPregunta(this.nuevaPregunta).subscribe(() => {
        Swal.fire({
                  title: 'Pregunta agregada correctamente',
                  confirmButtonColor: "#631BE9",
                  icon: "success",
                }).then(() => {
                  this.router.navigate(['preguntas-frecuentes-administrador']);
                })
        this.nuevaPregunta = { id: 0, pregunta: '', respuesta: '' };
      });
    }
  }

}
