import { Component, OnInit, ViewChild } from '@angular/core';
import { Banner, HotTag, SongSheet, Singer } from 'src/app/services/data-types/common.types';
import { NzCarouselComponent } from 'ng-zorro-antd';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/internal/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  @ViewChild(NzCarouselComponent, { static: true }) nzCarousel: NzCarouselComponent;
  banners: Banner[];
  tags: HotTag[];
  sheets: SongSheet[];
  artists: Singer[];
  carouselActiveIndex = 0;
  constructor(
    private route: ActivatedRoute,
  ) {

    // resolve是为了 预先获取组件数据 (home-resolve.service.ts)
    this.route.data.pipe(map(res => res.homeDatas)).subscribe(([banners, tags, sheets, artists]) => {
      this.banners = banners;
      this.tags = tags;
      this.sheets = sheets;
      this.artists = artists;
    });

  }

  ngOnInit() {
  }

  /*
  * onBeforeChange: 监听轮播图下标
  *   @params
  *      { to } [number] 目标索引值 (结构赋值)
  *   @return
  * by JetXu on 2019/12/04 10:27
  */
  onBeforeChange({ to }) {
    // console.log('OnBeforeChange: ' + to);
    this.carouselActiveIndex = to;
  }

  /*
  * onChangeSlide: 接受字组件传进来的参数
  *   @params
  *      type [string] 切换面板的类型 (子组件传进来的值)
  *   @return
  * by JetXu on 2019/12/04 10:27
  */
  onChangeSlide(type: string) {
    // console.log(type);
    this.nzCarousel[type]();
  }

}
