import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../usuario/interfaces/usuario.interface';
import { Evento } from '../../../evento/interfaces/evento.interface';
import { SpotifyService } from '../../../services/spotify.service';
import { UsuarioService } from '../../../services/usuario.service';
import { EventoService } from '../../../services/evento.service';
import { Cliente } from '../../../usuario/interfaces/cliente.interface';
import { Autenticacion } from '../../../services/autenticacion.service';

@Component({
  selector: 'app-manejo-fila',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './manejo-fila.component.html',
  styleUrl: './manejo-fila.component.css'
})

export class ManejoFilaComponent implements OnInit {

  artistPlaylistUrl: string = ''
  canciones: any[] = [];
  cancionSeleccionada: any = null;
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  estaEnFila = false
  usuario: Usuario | undefined;
  evento: Evento | undefined;
  fecha: string | null = '';
  idUser :string | null = null;
  progreso: any

  private active = inject(ActivatedRoute);
  private userService = inject(UsuarioService);
  private eventoService = inject(EventoService);
  private authService= inject(Autenticacion);
  private spotifyService = inject(SpotifyService);

  constructor(private router: Router) { }

  ngOnInit(): void {

    this.authService.userId.subscribe((id) => {
      this.idUser = id;
      console.log('User ID obtained in queue:', this.idUser);
    });

    this.active.paramMap.subscribe(param => {
      const eventoId = param.get("idEvento");
      const fechaParam = param.get("fecha");
      this.fecha = fechaParam;

      this.userService.getUsuariosById(this.idUser).subscribe({
        next: (usuarioEncontrado: Usuario) => {
          this.usuario = usuarioEncontrado;
        },
        error: (e: Error) => {
          console.log(e.message);
        }
      });

      this.eventoService.getEventosById(eventoId).subscribe({
        next: (eventoEncontrado: Evento) => {
          this.evento = eventoEncontrado;
        },
        error: (e: Error) => {
          console.log(e.message);
        }
      });
    });
  }

  fila: Cliente[] = [];
  turnoActual: number = 1;

  agregarCliente(nombre: string) {
    this.estaEnFila = true
    const nuevoCliente: Cliente = {
      id: this.fila.length + 1,
      nombre,
      turno: this.turnoActual++,
      haComprado: false,
      estado: 'Waiting for your turn'
    };
    this.fila.push(nuevoCliente);
    this.iniciarCompra(nuevoCliente);
  }

  iniciarCompra(cliente: Cliente) {
    const tiempoEspera = Math.floor(Math.random() * (45000 - 2000 + 1)) + 2000;
    this.progreso = 0;

    this.progreso = setInterval(() => {
      if (this.progreso < 100) {
        this.progreso += 1;
      }
    }, tiempoEspera / 100);

    setTimeout(() => {
      cliente.haComprado = true;
      cliente.estado = 'Entered ticket purchase';
      console.log(cliente.estado);

      this.router.navigate(["elegir-entrada", this.evento?.id, this.fecha]);
      clearInterval(this.progreso);

    }, tiempoEspera);

    this.levantarCanciones()
  }

  levantarCanciones (){
    if (this.evento?.artista_banda) {
      this.spotifyService.getCanciones(this.evento.artista_banda).subscribe({
        next: (canciones) => {
          console.log('Songs retrieved:', canciones);
          this.canciones = canciones.tracks.items;

          if (this.canciones.length > 0) {
            this.seleccionarCancionAleatoria();
          }
        },

        error: (e: Error) => {
          console.error('Error retrieving songs from Spotify:', e);
        }
      });

      console.log('Artist/Band:', this.evento.artista_banda);
      this.artistPlaylistUrl = 'https://open.spotify.com/search/' + encodeURIComponent(this.evento.artista_banda) + '?type=playlist';
      console.log('Generated URL:', this.artistPlaylistUrl);

    } else {
      console.log('The event does not have an associated artist.');
    }
  }

  reproducir() {
    if (this.cancionSeleccionada && this.cancionSeleccionada.preview_url && this.audioPlayer) {
        const audio: HTMLAudioElement = this.audioPlayer.nativeElement;
        audio.onended = null;

        audio.src = this.cancionSeleccionada.preview_url;

        audio.pause();
        audio.currentTime = 0;

        audio.play().then(() => {
            console.log('Playing:', this.cancionSeleccionada.name);
        }).catch(e => console.error('Error trying to play:', e));

        audio.onended = () => {
            console.log('Song ended, selecting another...');
            this.seleccionarCancionAleatoria();
        };
    } else {
        console.error('No preview URL available for this song.');
        console.log('Preview URL:', this.cancionSeleccionada?.preview_url);
    }
}

seleccionarCancionAleatoria() {
    if (this.canciones.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * this.canciones.length);
        this.cancionSeleccionada = this.canciones[indiceAleatorio];
        setTimeout(() => {
            this.reproducir();
        }, 100);
    } else {
        console.log('No songs available to play.');
    }
}

}
