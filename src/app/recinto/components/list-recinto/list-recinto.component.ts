import { RecintoService } from './../../../services/recintos.service';
import { Component, inject, OnInit, Output } from '@angular/core';
import { Recinto } from '../../interfaces/recinto.interface';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-recinto',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './list-recinto.component.html',
  styleUrl: './list-recinto.component.css'
})
export class ListRecintoComponent implements OnInit {

  private recintosService = inject(RecintoService);
  listaRecintos: Recinto[] = [];

  ngOnInit(): void {
    this.listarRecintos();
  }

  listarRecintos() {
    this.recintosService.getRecintos().subscribe(
      {
        next: (recintos: Recinto[]) => {
          this.listaRecintos = recintos;
        },
        error: (err) => {
          console.error('Error al levantar recintos:', err);
        }
      }
    )
  }

  //si se deshabilita no aparece en el select de add evento
  habilitarDeshabilitar(recinto: Recinto) {
    const accion = recinto.alta ? 'disable' : 'enable';
    if (recinto.id)
      this.recintosService.putRecinto(recinto.id, recinto).subscribe({
        next: () => {
          Swal.fire({
            title: `Venue ${accion} successfully`,
            confirmButtonColor: "#631BE9",
            icon: "success"
          });
        },
        error: (e: Error) => {
          console.log(e.message);
          Swal.fire({
            title: `Error while ${accion === 'enable' ? 'enabling' : 'disabling'} the venue`,
            confirmButtonColor: "#631BE9",
            icon: "error"
          });
        }
      })
  }

  confirmarDHR(recinto: Recinto) {

    const accion = recinto.alta ? 'disable' : 'enable';
    Swal.fire({
      title: `Do you want to ${accion} the venue?`,
      text: `This action will make the venue ${accion === 'disable' ? 'unavailable' : 'available'} for event creation.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#631BE9',
      cancelButtonColor: '#b91c1c',
      confirmButtonText: `Yes, ${accion}`,
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.habilitarDeshabilitar(recinto);
      }
    });
  }

}



