import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter, ViewChildren, QueryList, Inject } from '@angular/core';
import { Song } from 'src/app/services/data-types/common.types';
import { WyScrollComponent } from '../wy-scroll/wy-scroll.component';
import { findIndex } from 'src/app/utils/array';
import { WINDOW } from 'src/app/services/services.module';
import { timer, from } from 'rxjs';
import { SongService } from 'src/app/services/song.service';
import { WyLyric, BaseLyricLine } from './wy-lyric';

@Component({
  selector: 'app-wy-player-panel',
  templateUrl: './wy-player-panel.component.html',
  styleUrls: ['./wy-player-panel.component.less']
})
export class WyPlayerPanelComponent implements OnInit, OnChanges {

  @Input() playing: boolean;
  @Input() songList: Song[];
  @Input() currentSong: Song;
  @Input() currentIndex: number;
  @Input() show: boolean;

  @Output() onClose = new EventEmitter<void>();
  @Output() onChangeSong = new EventEmitter<void>();

  @ViewChildren(WyScrollComponent) private wyScroll: QueryList<WyScrollComponent>;

  scrollY = 0;

  currentLyric: BaseLyricLine[];

  currentLineNum: number;
  startStamp: number

  private lyric: WyLyric;
  private lyricRefs: NodeList;

  constructor(
    @Inject(WINDOW) private win: Window,
    private songService: SongService,
  ) { }

  ngOnInit() {
  }

  // 监听父组件传进来的属性变化
  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.

    if (changes['playing']) {
      if (!changes['playing'].firstChange) {
        this.lyric && this.lyric.togglePlay(this.playing);
      }
    }

    if (changes['songList']) {
      // console.log(this.songList);
      this.currentIndex = 0;
    }
    if (changes['currentSong']) {
      console.log(this.currentSong);
      if (this.currentSong) {
        this.currentIndex = findIndex(this.songList, this.currentSong); // 打开面板时，拿当前歌曲列表的当前播放歌曲的索引
        this.updateLyric();
        if (this.show) {
          this.scrollToCurrent();
        }
      } else {
        this.resetLyric();
      }
    }
    if (changes['show']) {
      if (!changes['show'].firstChange && this.show) {
        console.log('this.wyScroll: ', this.wyScroll);
        this.wyScroll.first.refreshScroll();
        this.wyScroll.last.refreshScroll();

        timer(80).subscribe(() => {
          if (this.currentSong) {
            this.scrollToCurrent(0);
          }
        });

        // setTimeout(() => {
        //   if (this.currentSong) {
        //     this.scrollToCurrent(0);
        //   }
        // }, 80);

        // 用timer代替window的setTimeout
        // this.win.setTimeout(() => {
        //   if (this.currentSong) {
        //     this.scrollToCurrent(0);
        //   }
        // }, 80);
      }
    }
  }

  // 更新歌词
  private updateLyric() {
    this.resetLyric();
    this.songService.getLyric(this.currentSong.id).subscribe(res => {
      console.log('res:', res);
      this.lyric = new WyLyric(res);
      console.log(this.lyric);
      this.currentLyric = this.lyric.lines;
      console.log('currentLyric:', this.currentLyric);
      const startLine = res.tlyric ? 1 : 2;
      this.handleLyric(startLine);
      this.wyScroll.last.scrollTo(0, 0);
      if (this.playing) {
        this.lyric.play();
      }
    })
  }

  // 重置歌词逻辑
  private resetLyric() {
    if (this.lyric) {
      this.lyric.stop();
      this.lyric = null;
      this.currentLyric = [];
      this.currentLineNum = 0;
      this.lyricRefs = null;
    }
  }

  handleLyric(startLine: number = 2) {
    this.lyric.handler.subscribe(({ lineNum }) => {
      if (!this.lyricRefs) {
        console.log('lineNum:', lineNum);
        this.currentLineNum = lineNum;
        // 获取歌词li标签
        this.lyricRefs = this.wyScroll.last.el.nativeElement.querySelectorAll('ul li');
        console.log('lyricRefs:', this.lyricRefs);
      }

      // 监听歌词滚动逻辑
      if (this.lyricRefs.length) {
        this.currentLineNum = lineNum;
        if (lineNum > startLine) {
          const targetLine = this.lyricRefs[lineNum - startLine];

          if (targetLine) {
            this.wyScroll.last.scrollToElement(targetLine, 300, false, false);
          }
        } else {
          this.wyScroll.last.scrollTo(0, 0);
        }
      }
    })
  }

  // 保证当前播放歌曲在滚动列表的可视区域
  scrollToCurrent(speed = 300) {
    const songListRefs = this.wyScroll.first.el.nativeElement.querySelectorAll('ul li');
    // console.log(songListRefs);
    if (songListRefs.length) {
      const currentLi = <HTMLElement>songListRefs[this.currentIndex || 0];
      const offsetTop = currentLi.offsetTop;
      const offsetHeight = currentLi.offsetHeight;
      if (offsetTop - Math.abs(this.scrollY) > offsetHeight * 5 || (offsetTop < Math.abs(this.scrollY))) {
        this.wyScroll.first.scrollToElement(currentLi, speed, false, false);
      }
    }
  }
}
