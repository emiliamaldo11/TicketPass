import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { map, switchMap, catchError } from "rxjs/operators";
import { Injectable } from '@angular/core';
import { environmentSpotify } from "../../environments/environment.development";

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {

  private clientId: string = '73aa9d0997c34a3498d9b89d9559a6e0';
  private clientSecret: string = environmentSpotify.token;
  private tokenUrl: string = 'https://accounts.spotify.com/api/token';
  private baseURL: string = 'https://api.spotify.com/v1';
  private accessToken: string = '';

  constructor(private http: HttpClient) {}

  private getAccessToken(): Observable<string> {
    const body = new URLSearchParams();
    body.set('grant_type', 'client_credentials');

    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(`${this.clientId}:${this.clientSecret}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(this.tokenUrl, body.toString(), { headers }).pipe(
      map(response => {
        this.accessToken = response.access_token;
        return this.accessToken;
      }),
      catchError(err => {
        console.error('Error al obtener el token de acceso:', err);
        return throwError(() => new Error('No se pudo obtener el token de acceso'));
      })
    );
  }



  getCanciones(artista: string): Observable<any> {
    return this.getAccessToken().pipe(
      switchMap(() => {
        if (!this.accessToken) {
          return throwError(() => new Error('Token de acceso no disponible.'));
        }
        //si el token no tira error levanta las canciones
        return this.requestCanciones(artista);
      }),
      catchError(err => {
        console.error('Error al obtener canciones:', err);
        return of(null);
      })
    );
  }

  //levanta las canciones que coincidan con el artista
  private requestCanciones(artista: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`
    });
    const url = `${this.baseURL}/search?q=${artista}&type=track&limit=10`;
    return this.http.get<any>(url, { headers });
  }


}
