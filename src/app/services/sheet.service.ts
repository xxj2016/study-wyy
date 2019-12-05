import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG, ServicesModule } from './services.module';
import { Inject, Injectable } from '@angular/core';
import { SongSheet, Song } from './data-types/common.types';
import { Observable } from 'rxjs';
import { map, pluck, switchMap } from 'rxjs/internal/operators';
import { SongService } from './song.service';


@Injectable({
  providedIn: ServicesModule
})
export class SheetService {

  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private uri: string,
    private songService: SongService,
  ) { }

  /*
  * getSongSheetDetail: 获取歌单信息
  *   @params
  *      id [number] 歌单id
  *   @return
  *       SongSheet类型的Observable
  * by JetXu on 2019/12/05 14:51
  */
  getSongSheetDetail(id: number): Observable<SongSheet> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.get(`${this.uri}playlist/detail`, { params })
      .pipe(map((res: { playlist: SongSheet }) => res.playlist));
  }


  /*
  * playSheet: 播放歌曲/歌单
  *   @params
  *      id [number] 歌曲的id
  *   @return
  * by JetXu on 2019/12/05 16:22
  */
  playSheet(id: number): Observable<Song[]> {
    return this.getSongSheetDetail(id)
      .pipe(
        pluck('tracks'), // 只获取tracks属性
        switchMap(tracks => this.songService.getSongList(tracks)) // 将每个tracks作为参数传进getSongList获取歌曲列表
      );
  }
}
