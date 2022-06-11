namespace hitStar2 {
    /**
     * 击中小星星游戏
     */
    export class HitStarGameModule extends ui.hitStar2.HitStarGameModuleUI {
        private _last: number;
        private _score: number;
        private _passT: time.GTime; //用于倒计时
        private _totalT: number; //持续时间
        private stageId: number;
        private type: number;
        private _isGameOver;

        constructor() { super(); }

        init(d: any): void {
            this.stageId = d.stageId;
            this.type = d.type;
        }

        popupOver(): void {
            this.gameStart();
        }

        private async gameStart() {
            await this.waitRule();
            await this.startGame();
            this._isGameOver = false;
            this._score = Config.INITIAL_SCORE;
            this._totalT = 60;
            this._last = Laya.Browser.now();
            this.scoreTxt.changeText(this._score + '');
            this.timeTxt.changeText(this._totalT + '');
            alert.showCountDown(new Laya.Handler(this, () => {
                Laya.timer.frameLoop(1, this, this.onFrame);
                this._passT = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onPassTime);
                this._passT.start();
            }))
        }

        private waitRule() {
            return new Promise((ok) => {
                let panel = alert.showRuleByID(1117);
                panel.once(Laya.Event.CLOSE, this, ok);
            })
        }

        private onFrame(): void {
            let currT: number = Laya.Browser.now();
            if (currT - this._last >= 1500) {
                this.createStars();
                this._last = currT;
            }

            let len: number = this.spBox.numChildren;
            if (len <= 0) return;
            for (let i: number = 0; i < len; i++) {
                let element: Star = this.spBox.getChildAt(i) as Star;
                element?.update(currT);
            }
        }

        private createStars(): void {
            let sx: number = 110 - clientCore.LayerManager.OFFSET;
            let xs: number[] = [];
            let len: number = Math.floor(Laya.stage.width / 220);
            for (let i: number = 0; i < len; i++) { xs.push(sx + i * 220); }
            for (let i: number = 0; i < 5; i++) { this.createStar(xs.splice(_.random(0, xs.length - 1), 1)[0]); }
        }

        private createStar(ex: number): void {
            let star: Star = Laya.Pool.getItemByClass('hitStar2.Star', Star);
            star.configure({ x: _.random(647, 687), y: _.random(160, 180), type: _.random(1, 3), ex: ex, speed: Config.SPEED });
            this.spBox.addChild(star);
        }

        private onHit(type: number): void {
            if (type != 2) {
                this.updateScore();
            }
        }

        private updateScore(): void {
            if (this._isGameOver) {
                return;
            }
            this._score -= 10;
            this.scoreTxt.changeText(this._score + '');
            if (this._score < 50) {
                this.gameOver();
            }
        }

        private onPassTime(): void {
            if (--this._totalT <= 0) {
                this.gameOver();
            }
            this.timeTxt.changeText(this._totalT + '');
        }

        private gameOver(): void {
            if (this._isGameOver) {
                return;
            }
            this._isGameOver = true;
            this._passT?.stop();
            this.overGame(
                Laya.Handler.create(this, (msg: pb.sc_mini_game_over) => {
                    let reward = msg.rewardInfo[0];
                    clientCore.MapItemsInfoManager.instance.addSeedToPackage(reward.itemId, reward.itemCnt);
                    alert.showReward(msg.rewardInfo, '', { callBack: { caller: this, funArr: [this.destroy] } });
                }));
        }

        /** 开始游戏*/
        private startGame(thenHandler?: Laya.Handler, catchHandler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_mini_game_begin({ stageId: this.stageId, type: this.type })).then((msg: pb.sc_mini_game_begin) => {
                thenHandler?.runWith(msg);
            }).catch(() => {
                catchHandler?.run();
            });
        }

        /** 结束游戏*/
        private overGame(thenHandler?: Laya.Handler, catchHandler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_mini_game_over({ stageId: this.stageId, type: this.type, score: this._score })).then((msg: pb.sc_mini_game_over) => {
                thenHandler?.runWith(msg);
            }).catch(() => {
                catchHandler?.run();
            });
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, EventManager, Config.HIT_STAR, this, this.onHit);
            BC.addEvent(this, EventManager, Config.YELLOW_STAR_OUT, this, this.updateScore);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            this.removeEventListeners();
            Laya.timer.clearAll(this);
            this._passT?.dispose();
            this._passT = null;
            let len: number = this.spBox.numChildren;
            if (len <= 0) return;
            for (let i: number = 0; i < len; i++) {
                let element: Star = this.spBox.getChildAt(0) as Star;
                element?.dispose();
            }
            super.destroy();
        }
    }
}