import { Component, OnInit } from '@angular/core';
import { SliderValue } from 'src/app/services/data-types/wy-slider-types';
import { Store, select } from '@ngrx/store';
import { AppStoreModule } from 'src/app/store';
import { getSongList, getPlayList, getCurrentIndex, getPlayMode, getCurrentAction, getCurrentSong } from "../../../store/selectors/player.selector";
import { Observable } from 'rxjs';
import { Song } from 'src/app/services/data-types/common.types';
import { PlayMode } from './player-type';

@Component({
  selector: 'app-wy-player',
  templateUrl: './wy-player.component.html',
  styleUrls: ['./wy-player.component.less']
})
export class WyPlayerComponent implements OnInit {
  sliderValue: SliderValue = 30;
  bufferOffset: SliderValue = 70;

  songList: Song[];
  playList: Song[];
  currentIndex: number;
  currentSong: Song;
  constructor(
    private store$: Store<AppStoreModule>,
  ) {

    const appStore$ = this.store$.pipe(select('player'));

    const stateArr = [
      {
        type: getSongList,
        cb: list => this.watchList(list, 'songList')
      },
      {
        type: getPlayList,
        cb: list => this.watchList(list, 'playList')
      },
      {
        type: getCurrentIndex,
        cb: index => this.watchCurrentIndex(index)
      },
      {
        type: getPlayMode,
        cb: mode => this.watchPlayMode(mode)
      },
      {
        type: getCurrentSong,
        cb: song => this.watchCurrentSong(song)
      },
      // {
      //   type: getCurrentAction,
      //   cb: action => this.watchCurrentAction(action)
      // }
    ];


    stateArr.forEach(item => {
      appStore$.pipe(select(item.type)).subscribe(item.cb);
    })
  }

  watchList(list, type) {
    console.log('list:', type, list);
  }

  private watchCurrentIndex(index: number) {
    this.currentIndex = index;
  }

  private watchPlayMode(mode: PlayMode) {
    // this.currentMode = mode;
    // if (this.songList) {
    //   let list = this.songList.slice();
    //   if (mode.type === 'random') {
    //     list = shuffle(this.songList);
    //   }
    //   this.updateCurrentIndex(list, this.currentSong);
    //   this.store$.dispatch(SetPlayList({ playList: list }));
    // }

  }

  private watchCurrentSong(song: Song) {
    // this.currentSong = song;
    // this.bufferPercent = 0;
    // if (song) {
    //   this.duration = song.dt / 1000;
    // }
  }

  ngOnInit() {
  }

}
