import { Component, inject, Input } from '@angular/core';
import { Usuario } from '../../interfaces/usuario.interface';
import { UsuarioService } from '../../../services/usuario.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-list-usuario',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './list-usuario.component.html',
  styleUrl: './list-usuario.component.css'
})
export class ListUsuarioComponent {

   @Input () filter : string = 'all';

  listaUsuarios: Usuario[] = [];
  usuariosFiltrados : Usuario [] = [];
  usuariosService = inject(UsuarioService)

  adminId: string | null = ''
  active = inject(ActivatedRoute)

  ngOnInit(): void {

    this.active.paramMap.subscribe(param => {
      this.adminId = param.get('adminId');
    })

    this.listarUsuarios();
  }

  listarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe(
      {
        next: (usuarios: Usuario[]) => {
             this.listaUsuarios = usuarios
             this.usuariosFiltrados = usuarios.filter (u => !u.alta)

        },
        error: (err) => {
          console.error('Error al levantar usuarios:', err);
        }
      }
    );
  }



  habilitarDeshabilitar(usuario: Usuario) {
    const accion = usuario.alta ? 'disabled' : 'enabled';
    usuario.alta = !usuario.alta;
    if (usuario.id)
      this.usuariosService.putUsuario(usuario.id, usuario).subscribe({
        next: () => {
          Swal.fire({
            title: `User ${accion} successfully`,
            confirmButtonColor: "#631BE9",
            icon: "success"
          });
        },
        error: (e: Error) => {
          console.log(e.message);
          Swal.fire({
            title: `Error while ${accion === 'enabled' ? 'enabling' : 'disabling'} the user`,
            confirmButtonColor: "#631BE9",
            icon: "error"
          });
        }
      })
  }

  confirmarDHR(usuario: Usuario) {

    const accion = usuario.alta ? 'disable' : 'enable';
    Swal.fire({
      title: `Do you want to ${accion} the user?`,
      text: `This action will make the user ${accion === 'disable' ? 'unable' : 'able'} to access their account.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#631BE9',
      cancelButtonColor: '#b91c1c',
      confirmButtonText: `Yes, ${accion}`,
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.habilitarDeshabilitar(usuario);
      }
    });
  }


}

