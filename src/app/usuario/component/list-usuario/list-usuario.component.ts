import { Component, inject } from '@angular/core';
import { Usuario } from '../../interfaces/usuario.interface';
import { UsuarioService } from '../../../services/usuario.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { FiltrarUsuariosComponent } from '../filtrar-usuarios/filtrar-usuarios.component';

@Component({
  selector: 'app-list-usuario',
  standalone: true,
  imports: [RouterModule, FiltrarUsuariosComponent],
  templateUrl: './list-usuario.component.html',
  styleUrl: './list-usuario.component.css'
})
export class ListUsuarioComponent {

  listaUsuarios: Usuario[] = [];
  usuariosService = inject(UsuarioService)

  adminId: string | null = ''
  active = inject(ActivatedRoute)

  ngOnInit(): void {

    this.active.paramMap.subscribe(param => {
      this.adminId = param.get('adminId');
    })

    this.listarEventos();
  }

  listarEventos(): void {
    this.usuariosService.getUsuarios().subscribe(
      {
        next: (usuarios: Usuario[]) => {
          // Filtra los eventos deshabilitados (alta === 0)
          this.listaUsuarios = usuarios
        },
        error: (err) => {
          console.error('Error al levantar usuarios:', err);
        }
      }
    );
  }


  habilitarDeshabilitar (usuario: Usuario)
  {
    const accion = usuario.alta ? 'deshabilitado' : 'habilitado';
    usuario.alta = !usuario.alta;
    if (usuario.id)
    this.usuariosService.putUsuario(usuario.id, usuario).subscribe({
      next: () => {
        Swal.fire({
          title: `Usuario ${accion} correctamente`,
          confirmButtonColor: "#631BE9",
          icon: "success"
        });
      },
      error: (e: Error) => {
        console.log(e.message);
        Swal.fire({
          title: `Error al ${accion === 'habilitado' ? 'habilitar' : 'deshabilitar'} el usuario`,
          confirmButtonColor: "#631BE9",
          icon: "error"
        });
      }
  })
  }

  confirmarDHR(usuario: Usuario){

    const accion = usuario.alta ? 'deshabilitar' : 'habilitar';

    Swal.fire({
      title: `¿Desea ${accion} el usuario?`,
      text: `Esta acción hará que el usuario ${accion === 'deshabilitar' ? 'no pueda' : 'este habilitado'} a ingresar a su cuenta.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#631BE9',
      cancelButtonColor: '#ff4845',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.habilitarDeshabilitar(usuario);
      }
    });
  }


}

