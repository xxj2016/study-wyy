import { Lyric } from '../../../../services/data-types/common.types'
import { Subject } from 'rxjs';

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
    private timer: any;


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

    private generLyric() {
        const lines = this.lrc.lyric.split('\n');
        console.log(lines);
        lines.forEach(line => this.makeline(line));
    }

    private generTLyric() {

    }

    private makeline(line: string) {
        const result = timeExp.exec(line);
        if (result) {
            const txt = line.replace(timeExp, '').trim();
            const txtCn = '';
            if (txt) {
                const thirdResult = result[3] || '00';
                const len = thirdResult.length;
                const _thirdResult = len > 2 ? parseInt(thirdResult) : parseInt(thirdResult) * 10;
                const time = Number(result[1]) * 60 * 1000 + Number(result[2]) * 1000 + _thirdResult;
                this.lines.push({ txt, txtCn, time });
            }
        }

    }

    play(startTime = 0) {
        if (!this.lines.length) return;
        if (!this.playing) {
            this.playing = true;
        }

        this.curNum = this.findCurNum(startTime);
        console.log('(this.curNum: ', this.curNum);
        this.startStamp = Date.now() - startTime;

        if (this.curNum < this.lines.length) {
            clearTimeout(this.timer);
            this.playReset();
        }
    }

    private playReset() {
        let line = this.lines[this.curNum];
        const delay = line.time - (Date.now() - this.startStamp);
        this.timer = setTimeout(() => {
            this.callHandler(this.curNum++);
            if (this.curNum < this.lines.length && this.playing) {
                this.playReset();
            }
        }, delay);
    }

    private callHandler(i: number) {
        this.handler.next({
            txt: this.lines[i].txt,
            txtCn: this.lines[i].txtCn,
            lineNum: i,
        })

    }

    private findCurNum(time: number): number {
        const index = this.lines.findIndex(item => time <= item.time);
        return index === -1 ? this.lines.length - 1 : index;
    }



    togglePlay(playing: boolean) {
        const now = Date.now();
        this.playing = playing;
        if (playing) {
            const startTimme = (this.pauseStamp || now) - (this.startStamp || now);
            this.play(startTimme);
        } else {
            this.stop();
            this.pauseStamp = now;
        }

    }

    private stop() {
        if (this.playing) {
            this.playing = false;
        }
        clearTimeout(this.timer);
    }
}