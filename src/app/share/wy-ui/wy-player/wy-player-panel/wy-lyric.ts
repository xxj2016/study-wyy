import { Lyric } from '../../../../services/data-types/common.types'

const timeExp = /\[(\d{2}):(\d{2}).(\d{2,3})\]/;
export interface BaseLyricLine {
    txt: string;
    txtCn: string;
}

interface LyricLine extends BaseLyricLine {
    time: number;
}

export class WyLyric {
    private lrc: Lyric;
    lines: LyricLine[] = [];

    constructor(lrc: Lyric) {
        this.lrc = lrc;
        console.log('888');
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
        console.log('1111111111');
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
}