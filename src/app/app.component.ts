import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { CommonModule } from '@angular/common';
import { Autenticacion } from './services/autenticacion.service';
import { FooterComponent } from './shared/footer/footer.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {

  title = 'TicketPass-project';

  isLoggedIn: boolean = false;
  tipoUsuario: number | null = null;
  idUsuario: string | null = null;

  constructor(
    private authService: Autenticacion,
    private router: Router,
  ) { }

  mostrarHeader: boolean = true;


  ngOnInit(): void {
    this.authService.isLoggedIn.subscribe((loggedInStatus) => {
      this.isLoggedIn = loggedInStatus;
    });

    this.authService.userType.subscribe((userType) => {
      this.tipoUsuario = userType;
    });

    this.authService.userId.subscribe((id) => {
      this.idUsuario = id;
      console.log('ID Usuario obtenido en AppComponent:', this.idUsuario);
    });


    //si estoy en iniciar sesion o registrarse no muestra el header
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.mostrarHeader = !(
          event.url === '/iniciar-sesion' ||
          event.url === '/registrarse' ||
          event.url === '/cambiar-contrasenia' ||
          event.url.startsWith('/cambiar-contrasenia/')
        );
      }
    });

  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['']);
  }
}


