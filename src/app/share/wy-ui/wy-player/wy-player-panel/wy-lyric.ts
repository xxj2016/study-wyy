import { Lyric } from '../../../../services/data-types/common.types'
import { Subject, from, zip, Subscription, timer } from 'rxjs';
import { skip } from 'rxjs/internal/operators';

const timeExp = /\[(\d{2}):(\d{2}).(\d{2,3})\]/;
export interface BaseLyricLine {
    txt: string;
    txtCn: string;
}

interface LyricLine extends BaseLyricLine {
    time: number;
}

interface Handler extends BaseLyricLine {
    lineNum: number;
}

export class WyLyric {
    private lrc: Lyric;
    lines: LyricLine[] = [];

    private playing = false;
    private curNum: number;
    private startStamp: number;
    private pauseStamp: number;


    handler = new Subject<Handler>();
    private timer$: Subscription;


    constructor(lrc: Lyric) {
        this.lrc = lrc;
        console.log(this.lrc);
        this.init();
    }

    private init() {
        if (this.lrc.tlyric) {
            console.log('generTLyric');
            this.generTLyric();
        } else {
            console.log('generLyric');
            this.generLyric();
        }
    }

    // 生成单语歌词
    private generLyric() {
        const lines = this.lrc.lyric.split('\n');
        console.log(lines);
        lines.forEach(line => this.makeline(line));
    }

    // 生成双语歌词
    private generTLyric() {
        const lines = this.lrc.lyric.split('\n');
        const tlines = this.lrc.tlyric.split('\n').filter(item => timeExp.exec(item) != null);
        console.log('lines:', lines);
        console.log('tlines:', tlines);

        const moreLine = lines.length - tlines.length;

        let tempArr = [];
        if (moreLine > 0) {
            tempArr = [lines, tlines];
        } else {
            tempArr = [tlines, lines];
        }

        const first = timeExp.exec(tempArr[1][0])[0];
        console.log('first:', first);

        const skipIndex = tempArr[0].findIndex(item => {
            const exec = timeExp.exec(item);
            if (exec) {
                return exec[0] === first;
            }
        });
        const _skip = skipIndex === -1 ? 0 : skipIndex;
        const skipItems = tempArr[0].slice(0, _skip);
        if (skipItems.length) {
            skipItems.forEach(line => this.makeline(line));
        }

        let zipLines$;
        if (moreLine > 0) {
            zipLines$ = zip(from(lines).pipe(skip(_skip)), from(tlines));
        } else {
            zipLines$ = zip(from(lines), from(lines).pipe(skip(_skip)));
        }

        zipLines$.subscribe(([line, tline]) => this.makeline(line, tline));
    }

    // 解析歌词
    private makeline(line: string, tline = '') {
        const result = timeExp.exec(line);
        if (result) {
            const txt = line.replace(timeExp, '').trim();
            // const txtCn = '';
            const txtCn = tline.replace(timeExp, '').trim();
            if (txt) {
                const thirdResult = result[3] || '00';
                const len = thirdResult.length;
                const _thirdResult = len > 2 ? parseInt(thirdResult) : parseInt(thirdResult) * 10;
                const time = Number(result[1]) * 60 * 1000 + Number(result[2]) * 1000 + _thirdResult;
                this.lines.push({ txt, txtCn, time });
            }
        }

    }

    // 播放歌词
    play(startTime = 0, skip = false) {
        if (!this.lines.length) return;
        if (!this.playing) {
            this.playing = true;
        }

        this.curNum = this.findCurNum(startTime);
        console.log('this.curNum: ', this.curNum);
        this.startStamp = Date.now() - startTime;
        if (!skip) {
            this.callHandler(this.curNum - 1);
        }

        if (this.curNum < this.lines.length) {
            // clearTimeout(this.timer$);
            // this.timer$.closed;
            this.clearTimer();

            this.playReset();
        }
    }

    // 播放歌词
    private playReset() {
        let line = this.lines[this.curNum];
        const delay = line.time - (Date.now() - this.startStamp);
        this.timer$ = timer(delay).subscribe(() => {
            this.callHandler(this.curNum++);
            if (this.curNum < this.lines.length && this.playing) {
                this.playReset();
            }
        });
    }

    // 将当前歌词索引发射出去
    private callHandler(i: number) {
        if (i > 0) {
            console.log(i);
            this.handler.next({
                txt: this.lines[i].txt,
                txtCn: this.lines[i].txtCn,
                lineNum: i,
            })
        }

    }

    // 查找当前歌词的索引
    private findCurNum(time: number): number {
        const index = this.lines.findIndex(item => time <= item.time);
        return index === -1 ? this.lines.length - 1 : index;
    }


    // 暂停/开始播放歌词
    togglePlay(playing: boolean) {
        const now = Date.now();
        this.playing = playing;
        if (playing) {
            const startTimme = (this.pauseStamp || now) - (this.startStamp || now);
            this.play(startTimme, true);
        } else {
            this.stop();
            this.pauseStamp = now;
        }

    }

    private clearTimer() {
        this.timer$ && this.timer$.unsubscribe();
    }

    // 停止播放歌词
    stop() {
        if (this.playing) {
            this.playing = false;
        }
        // clearTimeout(this.timer);
        this.clearTimer();
    }

    seek(time: number) {
        this.play(time);
    }
}