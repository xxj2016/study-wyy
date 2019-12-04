import { Component, OnInit, ViewChild } from '@angular/core';
import { HomeService } from 'src/app/services/home.service';
import { Banner, HotTag } from 'src/app/services/data-types/common.types';
import { NzCarouselComponent } from 'ng-zorro-antd';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  @ViewChild(NzCarouselComponent, { static: true }) nzCarousel: NzCarouselComponent;
  banners: Banner[];
  tags: HotTag[];
  carouselActiveIndex = 0;
  constructor(private homeService: HomeService) {

    this.getBanners();
    this.getHotTags();
    this.getPersonalizedSheetList();

  }

  private getBanners() {
    this.homeService.getBanner().subscribe(banners => {
      // console.table(banners);
      this.banners = banners;
    });
  }

  private getHotTags() {
    this.homeService.getHotTags().subscribe(tags => {
      console.table(tags);
      this.tags = tags;
    });
  }

  private getPersonalizedSheetList() {
    this.homeService.getPersonalizedSheetList().subscribe(result => {
      console.table(result);
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
    console.log('OnBeforeChange: ' + to);
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
    console.log(type);
    this.nzCarousel[type]();
  }

}
