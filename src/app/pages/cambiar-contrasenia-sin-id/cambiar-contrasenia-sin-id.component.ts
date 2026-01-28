import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../usuario/interfaces/usuario.interface';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-cambiar-contrasenia-sin-id',
  standalone: true,
  imports: [FormsModule, NgIf, RouterModule],
  templateUrl: './cambiar-contrasenia-sin-id.component.html',
  styleUrl: './cambiar-contrasenia-sin-id.component.css'
})
export class CambiarContraseniaSinIdComponent implements OnInit {

  constructor(private router: Router) { }

  private userService = inject(UsuarioService);

  ngOnInit(): void {
    this.getusersDB();
  }

  usuariosDB: Usuario[] = [];

  submitted = false;

  getusersDB() {
    this.userService.getUsuarios().subscribe(
      {
        next: (users: Usuario[]) => {
          this.usuariosDB = users;
        },
        error: (e: Error) => {
          console.log(e.message);
        }
      }
    );
  }

  // Verifica si el nombre de usuario existe
  usernameExiste(nombreUsuarioForm: string): Usuario | undefined {
    return this.usuariosDB.find(user => user.nombreUsuario === nombreUsuarioForm);
  }

buscarUsername(form: NgForm) {
  if (form.valid) {

    const user = this.usernameExiste(form.value.usuarioForm);

    if (user) {
      this.router.navigate([`/cambiar-contrasenia/${user.id}`]);
    } else {
      Swal.fire({
        title: 'User not found',
        text: 'Please try again',
        confirmButtonColor: '#7C3AED',
        icon: 'error'
      });
    }
  }
}


}

