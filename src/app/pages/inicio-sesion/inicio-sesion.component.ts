import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../usuario/interfaces/usuario.interface';
import { Autenticacion } from '../../services/autenticacion.service';
import Swal from 'sweetalert2';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; // Importa los íconos
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';



@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './inicio-sesion.component.html',
  styleUrl: './inicio-sesion.component.css'
})

export class InicioSesionComponent implements OnInit{

  constructor (private router: Router){}
  faEye = faEye;
  faEyeSlash = faEyeSlash;


  private auth = inject(Autenticacion);
  private userService = inject(UsuarioService);
  showPassword: boolean = false;

  ngOnInit(): void {
    this.getusersDB();
  }

  usuariosDB: Usuario [] = [];

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

  //comprueba que el usuario y contraseña coincidan
  existeUsuario(nombreUsuarioForm: string, contraseniaForm: string): Usuario | undefined{
    return this.usuariosDB.find(user => user.nombreUsuario == nombreUsuarioForm  && contraseniaForm == user.contrasenia)
  }


  iniciarSesion(form: NgForm) {

  if (form.valid) {

    let user = this.existeUsuario(form.value.usuarioForm, form.value.contraseniaForm);
    let nameUser = this.usernameExiste(form.value.usuarioForm);

    if (user) {

      if (user.alta == false) {
        Swal.fire({
          title: 'Your account has been deactivated',
          text: 'If you believe this is a mistake, please contact us at TicketPassSupport@gmail.com. We will assist you shortly.',
          confirmButtonColor: "#7C3AED",
          icon: "warning",
        });
      } else {
        if (user.tipo == 1) {
          this.router.navigate(["usuarios", user.id]);
          if (user.id)
            this.auth.login(1, user.id);
        }
        else if (user.tipo == 2) {
          this.router.navigate(["usuarios", user.id]);
          if (user.id)
            this.auth.login(2, user.id);
        }
      }
    }

    else if (nameUser) {
      Swal.fire({
        title: 'Incorrect password',
        html: `Forgot your password? <a href="/cambiar-contrasenia/${nameUser.id}" style="color: #36173d;">Click here</a>`,
        confirmButtonColor: "#7C3AED",
        icon: "warning",
      });
    }

    else {
      Swal.fire({
        title: 'Invalid username or password',
        confirmButtonColor: "#7C3AED",
        icon: "error",
      });
    }
  }
}


}
