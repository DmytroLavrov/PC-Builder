import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Category, Product, ProductFilter, SortOption } from '@models/product.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  private http: HttpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl.endsWith('/products')
    ? environment.apiUrl
    : `${environment.apiUrl}/products`;

  public getProducts(
    category: Category,
    page: number,
    limit: number,
    sort: SortOption,
    search: string,
    filters: ProductFilter,
  ): Observable<HttpResponse<Product[]>> {
    let params = new HttpParams().set('category', category).set('_page', page).set('_limit', limit);

    if (search) {
      params = params.set('q', search);
    }

    if (sort !== 'default') {
      switch (sort) {
        case 'price-asc':
          params = params.set('_sort', 'price').set('_order', 'asc');
          break;
        case 'price-desc':
          params = params.set('_sort', 'price').set('_order', 'desc');
          break;
        case 'name':
          params = params.set('_sort', 'name').set('_order', 'asc');
          break;
      }
    }

    if (filters.minPrice) params = params.set('price_gte', filters.minPrice);
    if (filters.maxPrice) params = params.set('price_lte', filters.maxPrice);

    Object.keys(filters).forEach((key) => {
      if (key !== 'minPrice' && key !== 'maxPrice' && filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<Product[]>(this.apiUrl, { params, observe: 'response' });
  }
}
