namespace snowEvent {
    /**
     * 小松鼠事件
     */
    export class SquirrelPanel extends ui.snowEvent.SquirrelPanelUI implements ISnowEventPanel {
        private _giveNum: number = 0;
        sweepHanlder: Laya.Handler;

        public init(d: pb.Isnow_panel): void {
            if (d.res == 0) {
                this.showGame();
            }
        }

        /**游戏状态 */
        private showGame(): void {
            for (let i = 0; i < 5; i++) {
                let img: Laya.Image = new Laya.Image("snowEvent/songguo.png");
                img.x = _.random(0, this.boxItem.width / 50) * 50 + _.random(-50, 50);
                img.y = _.random(0, this.boxItem.height / 50) * 50 + _.random(-50, 50);
                img.anchorX = img.anchorY = 0.5;
                img.rotation = _.random(-90, 0);
                img.once(Laya.Event.CLICK, this, () => {
                    Laya.Tween.to(img, { x: -172, y: 280, rotation: 0 }, 500, Laya.Ease.backIn, Laya.Handler.create(this, () => {
                        this._giveNum++;
                        img.removeSelf();
                        if (this._giveNum >= 5) {
                            this.sweepHanlder?.run();
                        }
                    }))
                });
                this.boxItem.addChild(img);
            }
        }
    }
}