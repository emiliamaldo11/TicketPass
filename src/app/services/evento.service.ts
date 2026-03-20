import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Evento } from '../evento/interfaces/evento.interface';
import { map, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
  })

  export class EventoService {

    urlBase: string = 'http://localhost:3001/eventos'
    constructor (private http: HttpClient ){};

    getEventos() : Observable <Evento[]>{
        return this.http.get<Evento[]>(this.urlBase);
    }

    postEvento (evento: Evento): Observable <Evento>{
     return this.http.post<Evento>(this.urlBase, evento);
    }

    getEventosById(id: string | null): Observable<Evento> {
      return this.http.get<Evento>(`${this.urlBase}/${id}`);
    }

    putEvento (id: string | undefined, evento: Evento): Observable<Evento> {
      return this.http.put<Evento>(`${this.urlBase}/${id}`, evento);
    }

    deshabilitarEvento(id: string | undefined, valor: number): Observable<Evento>{
      return this.http.patch<Evento>(`${this.urlBase}/${id}`, { alta: valor });
    }

    getEventosIdsYNombre(): Observable<{ id?: string; nombreEvento: string ; alta: number}[]> {
    return this.getEventos().pipe(
      map(eventos =>
        eventos
          .filter(evento => evento.id !== undefined && evento.nombreEvento !== undefined)
          .map(evento => ({
            id: evento.id ,
            nombreEvento: evento.nombreEvento  ,
            alta: evento.alta
          }))
      )
    );
  }

}


