import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RecintoService } from '../../../services/recintos.service'; // Asegúrate de que la ruta sea correcta
import { Recinto } from '../../interfaces/recinto.interface';
import { Asiento } from '../../interfaces/asiento.interface';
import { Sector } from '../../interfaces/sector.interface';
import { Direccion } from '../../interfaces/direccion.interface';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-add-recinto',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-recinto.component.html',
  styleUrls: ['./add-recinto.component.css']
})

export class AddRecintoComponent implements OnInit {

  userId: string | null = null;

  constructor(private router: Router){}
  private recintoService = inject(RecintoService);

  @Input()
  recintoRecibido?: Recinto //si lo edita

  ngOnInit(): void {
    if (this.recintoRecibido) {
      this.recinto = this.recintoRecibido
    }
  }

  sectoresTemp: Sector[] = []

  asiento: Asiento = {
    butaca: 0,
    disponibilidad: true
  };

  sector: Sector = {
    nombreSector: '',
    capacidad: 0,
    numerado: false,
    asientos: []
  };

  recinto: Recinto = {
    nombreRecinto: '',
    direccion: { calle: '', numero: 0, ciudad: '', codigoPostal: '', pais: '' },
    urlImg: '',
    capacidadTotal: 0,
    sectores: [],
    alta: true
  };


  direccion: Direccion = {
    calle: '',
    numero: 0,
    ciudad: '',
    codigoPostal: '',
    pais: ''
  };

  //agrega un sector al arreglo temporal
  agregarSector() {
    if (this.sector.nombreSector && this.sector.capacidad > 0) {

      this.sectoresTemp.push(this.sector);

      this.sector = {
        nombreSector: '',
        capacidad: 0,
        numerado: false,
        asientos: []
      };
    }

  }

  agregarSectorEdit() {
      this.crearButacas(this.sector)
      this.recintoRecibido?.sectores.push(this.sector);

      this.sector = {
        nombreSector: '',
        capacidad: 0,
        numerado: false,
        asientos: []
      };

  }

  eliminarSector(pos: number) {
    this.sectoresTemp.splice(pos, 1);
  }

  eliminarSectorEdit(pos: number) {
    this.recinto.sectores.splice(pos, 1);
  }


  //segun la capacidad que se le asigno, se generan las butacas (SI ES NUMERADO)
  crearButacas(sector: Sector) {
    if (sector.numerado === true) {
      for (let i = 1; i <= sector.capacidad; i++) {
        let nuevoAsiento: Asiento = {
          butaca: i,
          disponibilidad: true
        };
        sector.asientos.push(nuevoAsiento);
      }
    }
    else {
      sector.asientos = [];
    }
  }

  //suma total de capacidad de todos los sectores
  capacidadTotalCalculo(): number {
    const capacidadTotal = this.recinto.sectores.reduce((acumulador, sector) => acumulador + sector.capacidad, 0);
    return capacidadTotal;
  }


  addRecinto(formulario: NgForm) {

    if (formulario.invalid) return;

    if (this.recintoRecibido)
    {
      this.recinto.capacidadTotal = this.capacidadTotalCalculo()
      this.editRecinto()
    }

    else
    {
      //rellena con los sectores y los que son numerados rellena las butacas
      this.recinto.sectores = this.sectoresTemp;
      for (let sector of this.recinto.sectores) {

        if (!sector.nombreSector || sector.capacidad <= 0) {
          alert('Por favor, completa al menos un sector.');
          return;
        }
        console.log("encontro un sector");
        this.crearButacas(sector);
      }

      this.recinto.capacidadTotal = this.capacidadTotalCalculo()
      Swal.fire({
        title: "¿Deseas guardar el recinto?",
        showCancelButton: true,
        confirmButtonColor: "#631BE9",
        cancelButtonColor: '#b91c1c',
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          this.postRecinto();
        }
      });

    }
}

  postRecinto() {
    this.recintoService.postRecintos(this.recinto).subscribe(
      {
        next: () => {
          Swal.fire({
            title: "¡Recinto guardado!",
            text: "Tu recinto ha sido guardado y puede ser utilizado para los eventos.",
            confirmButtonColor: "#631BE9",
            icon: "success"
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/recintos']);
            }
          });
        },
        error: (err) => {
          Swal.fire({
            title: "Error al guardar el recinto",
            confirmButtonColor: "#631BE9",
            icon: "error"
          });
          console.error('Error:', err);
        }
      }
    )
  }

  editRecinto() {
    if (this.recinto.id)
      this.recintoService.putRecinto(this.recinto.id, this.recinto).subscribe(
        {
          next: () => {
            console.log('recinto editado');
            Swal.fire({
              title: "Recinto editado correctamente",
              confirmButtonColor: "#631BE9",
              icon: "success"
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/recintos']);
              }
            });
          },
          error: (err) => {
            Swal.fire({
              title: "Error al editar el recinto",
              confirmButtonColor: "#631BE9",
              icon: "error"
            });
            console.error('Error:', err);
          }
        }
      )

  }


}






