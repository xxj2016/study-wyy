import { Resolve } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { Injectable } from '@angular/core';
import { Banner, Singer, HotTag, SongSheet } from 'src/app/services/data-types/common.types';
import { HomeService } from 'src/app/services/home.service';
import { SingerService } from 'src/app/services/singer.service';
import { take, delay } from 'rxjs/internal/operators';

type HomeDataType = [Banner[], HotTag[], SongSheet[], Singer[]]; // 顺序要跟resolve的Observale的类型顺序一致
@Injectable()

export class HomeResolveService implements Resolve<HomeDataType> {
  constructor(
    private homeService: HomeService,
    private singleService: SingerService,
  ) { }
  resolve(): Observable<HomeDataType> {
    return forkJoin([ // forkJoin相当于promise的promiseAll
      this.homeService.getBanner(),
      this.homeService.getHotTags(),
      this.homeService.getPersonalizedSheetList(),
      this.singleService.getArtistList()
    ])
      .pipe(delay(800)) // 为了验证resolve是否生效
      .pipe(take(1));
  }
}
