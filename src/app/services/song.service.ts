import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG, ServicesModule } from './services.module';
import { Inject, Injectable } from '@angular/core';
import { SongUrl, Song } from './data-types/common.types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';


@Injectable({
  providedIn: ServicesModule
})
export class SongService {

  constructor(private http: HttpClient, @Inject(API_CONFIG) private uri: string) { }

  /*
  * getSongUrl: 获取歌曲信息
  *   @params
  *      ids [string] 单条或多条歌曲id字符串
  *   @return
  *       Song类型的Observable
  * by JetXu on 2019/12/05 15:10
  */
  getSongUrl(ids: string): Observable<SongUrl[]> {
    const params = new HttpParams().set('id', ids);
    return this.http.get(`${this.uri}song/url`, { params })
      .pipe(map((res: { data: SongUrl[] }) => res.data));
  }

  /*
  * playSheet: 获取歌曲列表
  *   @params
  *      songs [songs: Song | Song[]] 单条或多条歌曲信息
  *   @return
  * by JetXu on 2019/12/05 16:22
  */
  getSongList(songs: Song | Song[]): Observable<Song[]> {
    const songArr = Array.isArray(songs) ? songs.slice() : [songs];
    const ids = songArr.map(item => item.id).join(','); // 筛选出歌曲列表里面的id,并拼接成字符串
    console.log('songs', songs);
    console.log('ids', ids);

    return Observable.create(observer => { // Observable.create创建一个流
      this.getSongUrl(ids).subscribe(urls => { // 获取歌曲的播放地址信息
        observer.next(this.generateSongList(songArr, urls)); // 将歌曲数组，播放地址信息进行拼接所需要的结果数组(observer.next让外面去订阅我们这个流的地方可以拿到数据)
      });
    });
  }

  /*
  * generateSongList: 拼接歌曲信息和播放地址
  *   @params
  *      songs [Song[]] 歌曲信息列表
  *      urls [SongUrl[]] 播放地址列表
  *   @return
  *      result 带有歌曲信息和播放地址的新数组
  * by JetXu on 2019/12/05 16:31
  */
  private generateSongList(songs: Song[], urls: SongUrl[]): Song[] {
    const result = [];
    songs.forEach(song => {
      const url = urls.find(url => url.id === song.id).url;
      if (url) {
        result.push({ ...song, url });
      }
    });
    return result;
  }
}
