import { Component, OnInit, ViewChild } from '@angular/core';
import { Banner, HotTag, SongSheet, Singer } from '../../services/data-types/common.types';
import { NzCarouselComponent } from 'ng-zorro-antd';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/internal/operators';
import { SheetService } from 'src/app/services/sheet.service';
import { Store, select } from '@ngrx/store';
import { AppStoreModule } from '../../store/index';
import { PlayState } from 'src/app/store/reducers/player.reducer';
import { getPlayer } from 'src/app/store/selectors/player.selector';
import { BatchActionsService } from 'src/app/store/batch-actions.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  carouselActiveIndex = 0;
  banners: Banner[];
  hotTags: HotTag[];
  songSheetList: SongSheet[];
  singers: Singer[];

  @ViewChild(NzCarouselComponent, { static: true }) private nzCarousel: NzCarouselComponent;

  constructor(
    private route: ActivatedRoute,
    private sheetServe: SheetService,
    private batchActionsService: BatchActionsService,
  ) {
    this.route.data.pipe(map(res => res.homeDatas)).subscribe(([banners, hotTags, songSheetList, singers]) => {
      this.banners = banners;
      this.hotTags = hotTags;
      this.songSheetList = songSheetList;
      this.singers = singers;
    });

  }

  ngOnInit() {
  }

  onBeforeChange({ to }) {
    this.carouselActiveIndex = to;
  }

  onChangeSlide(type: 'pre' | 'next') {
    this.nzCarousel[type]();
  }


  onPlaySheet(id: number) {
    console.log('id :', id);
    this.sheetServe.playSheet(id).subscribe(list => {
      this.batchActionsService.selectPlatList({ list, index: 0});
    });
  }

}
