import { Component, inject, Input, OnInit } from '@angular/core';
import { Usuario } from '../../interfaces/usuario.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FontAwesomeModule, RouterModule],
  templateUrl: './editar-usuario.component.html',
  styleUrl: './editar-usuario.component.css'
})
export class EditarUsuarioComponent implements OnInit {

  @Input()
  usuarioRecibido?: Usuario

  faEye = faEye;
  faEyeSlash = faEyeSlash;
  showPassword: boolean = false;

  nombresUsuario: string[] = [];

  fb = inject(FormBuilder);
  usuariosService = inject(UsuarioService);

  ngOnInit(): void {
    this.listarNombreUsuario();
    console.log(this.nombresUsuario);

    if (this.usuarioRecibido) {
      this.formularioUsuario.setValue({
        nombre: this.usuarioRecibido.nombre,
        apellido: this.usuarioRecibido.apellido,
        telefono: this.usuarioRecibido.telefono,
        email: this.usuarioRecibido.email,
        direccion: {
          calle: this.usuarioRecibido.direccion.calle,
          numero: this.usuarioRecibido.direccion.numero,
          ciudad: this.usuarioRecibido.direccion.ciudad,
          codigoPostal: this.usuarioRecibido.direccion.codigoPostal,
          pais: this.usuarioRecibido.direccion.pais
        },
        nombreUsuario: this.usuarioRecibido.nombreUsuario,
        contrasenia: this.usuarioRecibido.contrasenia,
        pregunta: this.usuarioRecibido.pregunta,
        verificacion: this.usuarioRecibido.verificacion,
        tipo: this.usuarioRecibido.tipo,
        alta: this.usuarioRecibido.alta
      });

    }
  }

  listarNombreUsuario() {
    this.usuariosService.getUsuarios().subscribe(
      {
        next: (usuarios: Usuario[]) => {

          usuarios.forEach(usuario => {
            this.nombresUsuario.push(usuario.nombreUsuario)
          });
        },
        error: (err) => {
          console.error('Error al levantar nombres de usuario:', err);
        }
      }
    )
  }

  formularioUsuario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    telefono: [0, [Validators.required]],
    email: ['', [Validators.email, Validators.required]],
    direccion: this.fb.nonNullable.group({
      calle: ['', [Validators.required]],
      numero: [0, [Validators.required]],
      ciudad: ['', [Validators.required]],
      codigoPostal: ['', [Validators.required]],
      pais: ['', [Validators.required]]
    }),
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    contrasenia: ['', [Validators.required, Validators.minLength(8)]],
    pregunta: ['', [Validators.required]],
    verificacion: ['', [Validators.required]],
    tipo: [2, [Validators.required]],
    alta: [true, [Validators.required]]
  })



  editarUsuario(usuario: Usuario) {
    if (this.usuarioRecibido) {

      if (this.usuarioRecibido.id)
        this.usuariosService.putUsuario(this.usuarioRecibido.id, usuario).subscribe({
          next: () => {
            Swal.fire({
              title: "Profile updated successfully",
              confirmButtonColor: "#631BE9",
              icon: "success"
            })
          },
          error: (err) => {
            Swal.fire({
              title: "Error updating profile",
              confirmButtonColor: "#631BE9",
              icon: "error"
            });
            console.error('Error:', err);
          }
        })
    }


  }

  addUsuario() {
    if (this.formularioUsuario.invalid) {
      console.log('Formulario inválido');
      return;
    }

    const usuario: Usuario = this.formularioUsuario.getRawValue();
    const usuarioEncontrado = this.nombresUsuario.find(nombre => nombre == usuario.nombreUsuario);
    console.log(usuarioEncontrado);
    if (usuarioEncontrado && usuarioEncontrado != this.usuarioRecibido?.nombreUsuario) {
      Swal.fire({
        title: "Username already in use",
        text: "Please choose a different username",
        confirmButtonColor: "#631BE9",
        icon: "warning"
      });
    }
    else {
      this.editarUsuario(usuario)
    }

  }



}
