import { Injectable, Inject } from '@angular/core';
import { ServicesModule, API_CONFIG } from './services.module';
import { Observable } from 'rxjs';
import { Singer } from './data-types/common.types';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/internal/operators';
import queryString from 'queryString';
interface SingerParams {
  offset: number;
  limit: number;
  cat?: string;
}

const defaultParams: SingerParams = {
  offset: 0,
  limit: 5,
  cat: '5001'
};

@Injectable({
  providedIn: ServicesModule
})
export class SingerService {

  constructor(private http: HttpClient, @Inject(API_CONFIG) private uri: string) { }

  // 入驻歌手列表
  getArtistList(args: SingerParams = defaultParams): Observable<Singer[]> {
    const params = new HttpParams({ fromString: queryString.stringify(args) });
    return this.http.get(`${this.uri}artist/list`, { params })
      .pipe(map((res: { artists: Singer[] }) => res.artists));
  }
}
