import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
 private apiUrl = 'http://localhost:3000/api/libros';

  constructor(private http: HttpClient) {}

  getLibros(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get(this.apiUrl, { params });
  }

 postLibros(data: any): Promise<any> {
   return firstValueFrom(this.http.post('http://localhost:3000/api/libros', data));
  }

  updateLibros(isbn: any, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.apiUrl}/${isbn}`, data));
  }
}
