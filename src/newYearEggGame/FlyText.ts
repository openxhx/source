namespace newYearEggGame {

    export class FlyText extends Laya.Text {
        constructor() {
            super();

            this.width = 172;
            this.align = 'center';
            this.font = '汉仪中圆简';
            this.fontSize = 24;
            this.stroke = 2;
            this.strokeColor = '#ffffff';
            this.bold = true;
            this.pivotX = this.width / 2;
        }

        show(value: number, x: number, y: number): void {
            this.alpha = 1;
            this.color = value > 0 ? '#ee7d07' : '#000000';
            this.text = `元蛋 ${value > 0 ? '+' : '-'}${Math.abs(value)}`;
            this.pos(x, y);
        }
    }
}