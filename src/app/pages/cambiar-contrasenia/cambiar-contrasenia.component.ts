import { Component, inject, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from '../../usuario/interfaces/usuario.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'app-cambiar-contrasenia',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './cambiar-contrasenia.component.html',
  styleUrl: './cambiar-contrasenia.component.css'
})
export class CambiarContraseniaComponent implements OnInit {

  faEye = faEye;
  faEyeSlash = faEyeSlash;
  showPassword: boolean = false;


  private active = inject(ActivatedRoute)
  userService = inject(UsuarioService)
  usuario: Usuario | undefined
  private fb = inject(FormBuilder);
  closeForm: boolean = false;

  constructor(private router: Router){}

  ngOnInit(): void {

    this.active.paramMap.subscribe(param => {
      const userId = param.get("id");

      if (userId) {
        this.userService.getUsuariosById(userId).subscribe({
          next: (usuarioEncontrado: Usuario) => {
            this.usuario = usuarioEncontrado
          },
          error: (e: Error) => {
            console.log(e.message);
          }
        })
      }
    })
  }

formCambioContrasenia = this.fb.nonNullable.group({
  respuesta: ['', [Validators.required]],
  nuevaContrasenia: ['', [Validators.required, Validators.minLength(8)]]
});

verificarRta() {
  if (this.formCambioContrasenia.controls['respuesta'].invalid) {
    console.log('Incorrect answer or empty field');
    return;
  }

  const enteredAnswer = this.formCambioContrasenia.controls['respuesta'].value;

  if (this.usuario) {
    if (enteredAnswer === this.usuario.verificacion) {
      this.closeForm = true;
    } else {
      Swal.fire({
        title: 'Incorrect answer',
        text: 'Please try again',
        confirmButtonColor: '#7C3AED',
        icon: 'error',
      });
    }
  }
}

cambiarContrasenia() {
  if (this.formCambioContrasenia.controls['nuevaContrasenia'].invalid) {
    console.log('Invalid password or empty field');
    return;
  }

  const newPassword = this.formCambioContrasenia.controls['nuevaContrasenia'].value;

  if (this.usuario) {
    this.userService.actualizarContrasenia(this.usuario.id, newPassword).subscribe({
      next: () => {
        console.log('Password updated');
        Swal.fire({
          title: 'Password updated successfully',
          confirmButtonColor: '#7C3AED',
          icon: 'success',
        }).then(() => {
          this.router.navigate(['iniciar-sesion']);
        });
      },
      error: (e: Error) => {
        console.log('Error', e.message);
      }
    });
  }
}

}
