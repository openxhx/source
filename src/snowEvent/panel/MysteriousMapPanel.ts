
namespace snowEvent {
    import lineUI = ui.snowEvent.item.MapLineItemUI;
    /**
     * 神秘地图事件
     */
    export class MysteriousMapPanel extends ui.snowEvent.MysteriousMapPanelUI {
        /**完成交互回调*/
        sweepHanlder: Laya.Handler;
        /**领取奖励回调 */
        rewardHanlder: Laya.Handler;

        private _targetArr: Laya.Image[];
        private _lineArr: lineUI[];
        private _currTargetIdx: number;
        private _moving: boolean;
        private _gameOver: boolean = false;
        private _currLine: lineUI;

        init(d: any) {
            this._targetArr = [];
            this._lineArr = [];
            for (let i = 0; i < this.boxContain.numChildren; i++) {
                let target = this.boxContain.getChildAt(i) as Laya.Image;
                this._targetArr.push(target);
            }
            //画空白线
            for (let i = 0; i < this._targetArr.length - 1; i++) {
                let a = this._targetArr[i];
                let b = this._targetArr[i + 1];
                let line = new lineUI();
                line.rotation = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
                line.imgBg.width = line.width = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y))
                line.pos(a.x, a.y);
                this.boxContain.addChildAt(line, 0);
                this._lineArr.push(line);
                this.updateLineProgress(0, line);
            }
            this.boxContain.addChild(this.imgPlayer);
            this.reset();
        }

        private onMouseDown() {
            if (this._gameOver)
                return;
            this._moving = true;
        }

        private onMouseMove() {
            if (this._gameOver)
                return;
            if (!this._moving)
                return;
            this.imgPlayer.x = this.boxContain.mouseX;
            this.imgPlayer.y = this.boxContain.mouseY;
            let startP = new Laya.Point(this._currLine.x, this._currLine.y);
            let targetP = new Laya.Point(this._targetArr[this._currTargetIdx].x, this._targetArr[this._currTargetIdx].y);
            let crossP = this.getCrossPoint(startP.x, startP.y, targetP.x, targetP.y);//鼠标到当前线段的垂足坐标
            let disToLine = crossP.distance(this.boxContain.mouseX, this.boxContain.mouseY)
            if (disToLine > 40) {
                this.reset();
                return;
            }
            let isBetween = _.inRange(crossP.x, startP.x, targetP.x) && _.inRange(crossP.y, startP.y, targetP.y)
            if (isBetween) {
                let progress = startP.distance(crossP.x, crossP.y) / this._currLine.width;
                if (progress >= 0.98)
                    this.jumpToNextLine();
                else
                    this.updateLineProgress(progress, this._currLine)
            }
        }

        private jumpToNextLine() {
            if (this._currTargetIdx == this._targetArr.length - 1) {
                this._gameOver = true;
                this.sweepHanlder.run();
            }
            else {
                //完成一个点 添加UI
                let img = new Laya.Image('snowEvent/xuan_zhong.png');
                let target = this._targetArr[this._currTargetIdx];
                img.anchorX = img.anchorY = 0.5;
                img.pos(target.width / 2, target.height / 2);
                egret.Tween.get(img)
                    .to({ scaleX: 3, scaleY: 3, alpha: 0.2 }, 400)
                    .set({ scaleX: 1, scaleY: 1, alpha: 1 })
                target.addChild(img);
                //idx+1
                this._currTargetIdx += 1;
                //更新前一条线
                this.updateLineProgress(1, this._currLine);
                this._currLine = this._lineArr[this._currTargetIdx - 1];
            }
        }

        private updateLineProgress(progress: number, line: lineUI) {
            progress = _.clamp(progress, 0, 1);
            let width = line.width * progress;
            //九宫太小就直接隐藏
            line.boxColor.visible = width >= 9;
            if (line.boxColor.visible) {
                line.boxColor.width = width + 15;
            }
        }

        private getCrossPoint(x1: number, y1: number, x2: number, y2: number) {
            let p = new Laya.Point();
            let x0 = this.boxContain.mouseX;
            let y0 = this.boxContain.mouseY;
            let k1 = (y2 - y1) / (x2 - x1);
            p.x = (k1 * k1 * x1 + k1 * (y0 - y1) + x0) / (k1 * k1 + 1);
            p.y = k1 * (p.x - x1) + y1
            return p;
        }

        private reset() {
            if (this._gameOver)
                return;
            this._moving = false;
            this._currTargetIdx = 1;
            this._currLine = this._lineArr[0];
            this.imgPlayer.pos(this._currLine.x, this._currLine.y);
            for (const line of this._lineArr) {
                this.updateLineProgress(0, line)
            }
            for (const circle of this._targetArr) {
                circle.removeChildren();
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.imgPlayer, Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            BC.addEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            BC.addEvent(this, this, Laya.Event.MOUSE_UP, this, this.reset);
        }
    }
}