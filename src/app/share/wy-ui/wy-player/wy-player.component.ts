import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppStoreModule } from '../../../store/index';
import { getSongList, getPlayList, getCurrentIndex, getPlayMode, getCurrentSong } from '../../../store/selectors/player.selector';
import { Song } from '../../../services/data-types/common.types';
import { PlayMode } from './player-type';
import { SetCurrentIndex } from 'src/app/store/actions/player.actions';

@Component({
  selector: 'app-wy-player',
  templateUrl: './wy-player.component.html',
  styleUrls: ['./wy-player.component.less']
})
export class WyPlayerComponent implements OnInit {
  duration: number;
  currentTime: number;
  sliderValuePercent = 0;
  bufferOffsetPercent = 0;

  songList: Song[];
  playList: Song[];
  currentIndex: number;
  currentSong: Song;

  // 播放状态
  playing = false;

  // 是否可以播放
  songReady = false;

  @ViewChild('audio', { static: true }) private audio: ElementRef;
  private audioEl: HTMLAudioElement;


  constructor(
    private store$: Store<AppStoreModule>
  ) {
    const appStore$ = this.store$.pipe(select('player'));
    const stateArr = [{
      type: getSongList,
      cb: list => this.watchList(list, 'songList')
    }, {
      type: getPlayList,
      cb: list => this.watchList(list, 'playList')
    }, {
      type: getCurrentIndex,
      cb: index => this.watchCurrentIndex(index)
    }, {
      type: getPlayMode,
      cb: mode => this.watchPlayMode(mode)
    }, {
      type: getCurrentSong,
      cb: song => this.watchCurrentSong(song)
    }];

    stateArr.forEach(item => {
      appStore$.pipe(select(item.type)).subscribe(item.cb);
    })

  }

  ngOnInit() {
    this.audioEl = this.audio.nativeElement;
  }

  onPercentChange(percent) {
    console.log(percent);
    this.audioEl.currentTime = this.duration * (percent / 100);
  }



  private watchList(list: Song[], type: string) {
    this[type] = list;
  }

  private watchCurrentIndex(index: number) {
    this.currentIndex = index;
  }

  private watchPlayMode(mode: PlayMode) {
    console.log('mode :', mode);
  }

  private watchCurrentSong(song: Song) {
    if (song) {
      this.currentSong = song;
      console.log('song :', song);
      this.duration = song.dt / 1000;
    }
  }


  onCanplay() {
    this.songReady = true; // 可以播放
    this.play();
  }

  private play() {
    this.audioEl.play();
    this.playing = true; // 正在播放
  }

  get playUrl() {
    return this.currentSong ? this.currentSong.al.picUrl : '//s4.music.126.net/style/web2/img/default/default_album.jpg';
  }

  // 获取当前播放时间
  onTimeUpdate(e: Event) {
    this.currentTime = (<HTMLAudioElement>e.target).currentTime;
    this.sliderValuePercent = (this.currentTime / this.duration) * 100; // 更新滑块的位置

    /* buffered 属性返回 TimeRanges 对象。

      TimeRanges 对象表示音频的缓冲区间。

      缓冲范围指的是已缓冲音视频的时间范围。如果用户在音视频中跳跃播放，会得到多个缓冲范围

      TimeRanges: 表示音视频的已缓冲部分，TimeRanges 对象属性：:
                  length - 获得音视频中已缓冲范围的数量
                  start(index) - 获得某个已缓冲范围的开始位置
                  end(index) - 获得某个已缓冲范围的结束位置
                  注意：首个缓冲范围的下表是 0。

      buffered.end(0) 缓冲区域结束的位置 是一个时间
      
    */
    const buffered = this.audioEl.buffered;
    // 歌曲还没准备好，获取缓冲部分是获取不到的
    // 需判断
    if (buffered.length && this.bufferOffsetPercent < 100) {
      this.bufferOffsetPercent = (buffered.end(0) / this.duration) * 100;
    }
  }

  // 切换播放/暂停
  onToggle() {
    if (!this.currentSong) {
      if (this.playList.length) {
        this.updateIndex(0);
      }
    } else {
      if (this.songReady) {
        this.playing = !this.playing;
        this.playing ? this.audioEl.play() : this.audioEl.pause();
      }
    }
  }

  // 上一首/下一首
  switchSong(index: number, type: string) {
    if (!this.songReady) return;
    if (this.playList.length === 1) { // 播放列表只有一首歌
      this.loop();
    } else {
      let newIndex;
      if (type === 'onNext') { // 下一首
        console.log('onNext');
        newIndex = index >= this.playList.length ? 0 : index;
      } else if (type === 'onPrev') { // 上一首
        console.log('onPrev');
        newIndex = index < 0 ? this.playList.length - 1 : index;
      }
      this.updateIndex(newIndex);
    }
  }

  // 更新当前播放的歌曲索引，以及变为 不可播放状态
  private updateIndex(index) {
    this.store$.dispatch(SetCurrentIndex({ currentIndex: index }));
    this.songReady = false;
  }

  private loop() {
    this.audioEl.currentTime = 0;
    this.play();
  }
}
