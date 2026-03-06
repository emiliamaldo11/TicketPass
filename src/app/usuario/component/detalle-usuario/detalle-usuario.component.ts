import { Component, inject } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';
import { ActivatedRoute, RouterOutlet, RouterLink } from '@angular/router';
import { Usuario } from '../../interfaces/usuario.interface';
import { CommonModule, NgIf } from '@angular/common';
import { AddUsuarioComponent } from '../add-usuario/add-usuario.component';
import { Autenticacion } from '../../../services/autenticacion.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './detalle-usuario.component.html',
  styleUrl: './detalle-usuario.component.scss'
})
export class DetalleUsuarioComponent {

  private active = inject(ActivatedRoute)
  private userService = inject(UsuarioService)
  fb = inject(FormBuilder);


  usuario?: Usuario
  userId: string | null = null;
  adminId: string | null = null;
  isEditing = false;
  nombresUsuario: string[] = []

  ngOnInit(): void {

    this.active.paramMap.subscribe(param => {
      this.adminId = param.get("adminId");
      const userId = param.get("id");

      this.userService.getUsuariosById(userId).subscribe({
        next: (usuarioEncontrado: Usuario) => {
          this.usuario = usuarioEncontrado

          this.formularioUsuario.setValue({
          nombre: this.usuario.nombre,
          apellido: this.usuario.apellido,
          telefono: this.usuario.telefono,
          email: this.usuario.email,
          direccion: {
            calle: this.usuario.direccion.calle,
            numero: this.usuario.direccion.numero,
            ciudad: this.usuario.direccion.ciudad,
            codigoPostal: this.usuario.direccion.codigoPostal,
            pais: this.usuario.direccion.pais
          },
          nombreUsuario: this.usuario.nombreUsuario,
          contrasenia: this.usuario.contrasenia,
          pregunta: this.usuario.pregunta,
          verificacion: this.usuario.verificacion,
          tipo: this.usuario.tipo,
          alta: this.usuario.alta
        });

        },
        error: (e: Error) => {
          console.log(e.message);
        }
      })

  })
}

 formularioUsuario = this.fb.nonNullable.group({
    nombre:['',[Validators.required]],
    apellido:['',[Validators.required]],
    telefono:[0,[Validators.required]],
    email:['',[Validators.email, Validators.required]],
    direccion: this.fb.nonNullable.group({
      calle:['',[Validators.required]],
      numero:[0,[Validators.required]],
      ciudad:['',[Validators.required]],
      codigoPostal: ['',[Validators.required]],
      pais:['',[Validators.required]]
    }),
    nombreUsuario:['',[Validators.required, Validators.minLength(3)]],
    contrasenia:['', [Validators.required, Validators.minLength(8)]],
    pregunta: ['', [Validators.required]],
    verificacion: ['', [Validators.required]],
    tipo:[2, [Validators.required]],
    alta:[true, [Validators.required]]
  })



editUser() {

  if (!this.isEditing) {
    this.isEditing = true;
    return;
  }

  // Si ya está editando → guardar
  this.saveUser();
  this.isEditing = false;
}

mensaje(usuario: Usuario) {

  if (this.usuario) {

    if (this.usuario.id)

      this.userService.putUsuario(this.usuario.id, usuario).subscribe({
        next: () => {
          Swal.fire({
            title: "Profile updated successfully",
            confirmButtonColor: "#631BE9",
            icon: "success"
          });
        },
        error: (err) => {
          Swal.fire({
            title: "Error updating profile",
            confirmButtonColor: "#631BE9",
            icon: "error"
          });
          console.error('Error:', err);
        }
      });
  }
}

listarNombreUsuario ()
  {
    this.userService.getUsuarios().subscribe(
      {
        next: (usuarios: Usuario[])=>{

          usuarios.forEach(usuario => {
            this.nombresUsuario.push(usuario.nombreUsuario)
          });
        },
        error: (err)=> {
          console.error('Error al levantar nombres de usuario:', err);
        }
      }
    )
  }

  saveUser() {

    if (this.formularioUsuario.invalid) {
      console.log('Formulario inválido');
      return;
    }

    const usuario: Usuario = this.formularioUsuario.getRawValue();

    const usuarioEncontrado = this.nombresUsuario.find(nombre => nombre == usuario.nombreUsuario);
    console.log(usuarioEncontrado);
    if (usuarioEncontrado && usuarioEncontrado!=this.usuario?.nombreUsuario)
    {
     alert("The username is already in use!");
    }
    else
    {
        this.mensaje(usuario)
    }

  }



}
