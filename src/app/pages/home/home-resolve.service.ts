import { Resolve } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { Injectable } from '@angular/core';
import { Banner, Singer, HotTag, SongSheet } from 'src/app/services/data-types/common.types';
import { HomeService } from 'src/app/services/home.service';
import { SingleService } from 'src/app/services/single.service';
import { take } from 'rxjs/internal/operators';

type HomeDataType = [Banner[], HotTag[], SongSheet[], Singer[]]; // 顺序要跟resolve的Observale的类型顺序一致
@Injectable()

export class HomeResolveService implements Resolve<HomeDataType> {
  constructor(
    private homeService: HomeService,
    private singleService: SingleService,
  ) { }
  resolve(): Observable<HomeDataType> {
    return forkJoin([
      this.homeService.getBanner(),
      this.homeService.getHotTags(),
      this.homeService.getPersonalizedSheetList(),
      this.singleService.getArtistList()
    ]).pipe(take(1));
  }
}
