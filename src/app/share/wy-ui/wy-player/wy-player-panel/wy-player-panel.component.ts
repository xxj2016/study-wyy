import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter, ViewChildren, QueryList, Inject } from '@angular/core';
import { Song } from 'src/app/services/data-types/common.types';
import { WyScrollComponent } from '../wy-scroll/wy-scroll.component';
import { findIndex } from 'src/app/utils/array';
import { WINDOW } from 'src/app/services/services.module';
import { timer } from 'rxjs';
import { SongService } from 'src/app/services/song.service';

@Component({
  selector: 'app-wy-player-panel',
  templateUrl: './wy-player-panel.component.html',
  styleUrls: ['./wy-player-panel.component.less']
})
export class WyPlayerPanelComponent implements OnInit, OnChanges {

  @Input() songList: Song[];
  @Input() currentSong: Song;
  @Input() currentIndex: number;
  @Input() show: boolean;

  @Output() onClose = new EventEmitter<void>();
  @Output() onChangeSong = new EventEmitter<void>();

  @ViewChildren(WyScrollComponent) private wyScroll: QueryList<WyScrollComponent>;

  scrollY = 0;
  constructor(
    @Inject(WINDOW) private win: Window,
    private songService: SongService,
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['songList']) {
      // console.log(this.songList);
      this.currentIndex = 0;
    }
    if(changes['currentSong']) {
      console.log(this.currentSong);
      if (this.currentSong) {
        this.currentIndex = findIndex(this.songList, this.currentSong); // 打开面板时，拿当前歌曲列表的当前播放歌曲的索引
        this.updateLyric();
        if (this.show) {
          this.scrollToCurrent();
        }
      }
    }
    if (changes['show']) {
      if (!changes['show'].firstChange && this.show) {
        console.log('this.wyScroll: ', this.wyScroll);
        this.wyScroll.first.refreshScroll();
        // setTimeout(() => {
        //   if (this.currentSong) {
        //     this.scrollToCurrent(0);
        //   }
        // }, 80);

        // 用timer代替window的setTimeout
        // timer(80).subscribe(() => {
        //   if (this.currentSong) {
        //         this.scrollToCurrent(0);
        //       }
        // });

        
        this.win.setTimeout( () => {
          if (this.currentSong) {
                this.scrollToCurrent(0);
              }
        }, 80);
      }
    }
  }

  private updateLyric() {
    this.songService.getLyric(this.currentSong.id).subscribe(res => {
      console.log('res:', res);
    })
  }

  // 保证当前播放歌曲在滚动列表的可视区域
  scrollToCurrent(speed = 300) {
    const songListRefs = this.wyScroll.first.el.nativeElement.querySelectorAll('ul li');
    console.log(songListRefs);
    if (songListRefs.length) {
      const currentLi = <HTMLElement>songListRefs[this.currentIndex || 0];
      const offsetTop = currentLi.offsetTop;
      const offsetHeight = currentLi.offsetHeight;
      if (offsetTop - Math.abs(this.scrollY) > offsetHeight* 5 || (offsetTop < Math.abs(this.scrollY)) ) {
        this.wyScroll.first.scrollToElement(currentLi, speed, false, false);
      }
    }
  }
}
