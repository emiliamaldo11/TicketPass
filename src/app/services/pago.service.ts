import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environmentMP } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private mercadopagoUrl = 'https://api.mercadopago.com/checkout/preferences';
  private accessToken = environmentMP.token;

  constructor(private http: HttpClient) {}

  crearPreferencia(descripcion: string, cantidad: number, precio: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    const preference = {
      items: [
        {
          title: descripcion,
          quantity: cantidad,
          unit_price: precio
        }
      ],
      back_urls: {
        success: 'http://localhost:4200/ver-mis-entradas',
        failure: 'http://localhost:4200',
        pending: 'http://localhost:4200'
      },
      auto_return: 'approved'
    };

    return this.http.post<any>(this.mercadopagoUrl, preference, { headers });
  }

}
