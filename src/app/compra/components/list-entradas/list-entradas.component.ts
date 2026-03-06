import { Compra } from './../../interfaces/compra.interface';
import { Component, inject, OnInit } from '@angular/core';
import { CompraService } from '../../../services/compra.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Autenticacion } from '../../../services/autenticacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-entradas',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './list-entradas.component.html',
  styleUrl: './list-entradas.component.css'
})
export class ListEntradasComponent implements OnInit {

  private compraService = inject(CompraService)
  private authService = inject(Autenticacion)

  listaCompras: Compra[] = []
  idUsuario: string | null = null;


  ngOnInit(): void {
    this.authService.userId.subscribe((id) => {
      this.idUsuario = id;
      console.log('ID Usuario obtenido en compra:', this.idUsuario);
    });

    this.listarCompras();
  }

  listarCompras() {
    this.compraService.getCompras().subscribe(
      {
        next: (compras: Compra[]) => {
          this.listaCompras = compras.filter(compra => compra.cliente.idCliente == this.idUsuario);
          console.log(this.listaCompras);
        },
        error: (err) => {
          console.error('Error al levantar compras:', err);
        }
      }
    )
  }

  bajaEntrada(compra: Compra) {
    compra.alta = false;

    if (compra.id)
      this.compraService.putCompra(compra.id, compra).subscribe({
        next: () => {
          Swal.fire({
            title: "Ticket successfully refunded",
            confirmButtonColor: "#36173d",
            icon: 'success'
          });
        },
        error: (e: Error) => {
          Swal.fire({
            title: "Error refunding the ticket",
            confirmButtonColor: "#36173d",
            icon: 'error'
          });
        }
      });

  }

  confirmarBajaEntrada(compra: Compra) {
    Swal.fire({
      title: `Are you sure you want to refund your ticket for "${compra.evento.nombreEvento}"?`,
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Refund ticket",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#36173d",
      cancelButtonColor: "#ff4845b2",
      icon: "warning"
    }).then((result) => {
      if (result.isConfirmed) {
        this.bajaEntrada(compra);
      }
    });

  }

  paginaActual = 0;

get totalTickets() {
  return this.listaCompras.filter(c => c.cliente.idCliente == this.idUsuario && c.alta).length;
}

get maxPagina() {
  return Math.ceil(this.totalTickets / 2) - 1;
}

siguiente() {
  if (this.paginaActual < this.maxPagina) {
    this.paginaActual++;
  }
}

anterior() {
  if (this.paginaActual > 0) {
    this.paginaActual--;
  }
}


}


