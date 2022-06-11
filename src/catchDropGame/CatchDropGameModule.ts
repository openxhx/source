namespace catchDropGame {
    class DropItem extends ui.catchDrop.DropItemUI {
        speed: number;
        private _isBoom: boolean;
        private _score: number;

        set isBoom(b: boolean) {
            this._isBoom = b;
            this.img.skin = b ? 'catchDropGame/图层 5.png' : 'catchDropGame/icon 副本.png';
            this.txtNum.visible = !b;
            if (b) {
                this.score = 0;
            }
        }

        get isBoom() {
            return this._isBoom;
        }

        set score(n: number) {
            this._score = n;
            this.txtNum.text = 'x' + n;
        }

        get score() {
            return this._score;
        }
    }


    const ITEM_SIZE_HALF = 96 / 2;
    const PLAYER_WIDTH_HALF = 70;
    const PLAYER_HEIGHT_HALP = 90;

    const MIN_X = 190;
    const MAX_X = 1126;

    export class CatchDropGameModule extends ui.catchDrop.CatchDropGameModuleUI {
        private _itemPool: DropItem[];
        private _gameRuning: boolean;
        private _playSpd: number;
        private _itemArr: DropItem[];
        private _pausePanel: CatchDropPausePanel;
        private _score: number;
        private _time: number;

        private BASE_PLAYER_SPD: number;
        private MAX_SCORE: number;
        private _bone: clientCore.Bone;

        init(d: any) {
            this.addPreLoad(xls.load(xls.gameMoveElement));
            this.addPreLoad(xls.load(xls.characterVoice));
            this._itemArr = [];
            this._itemPool = [];
            this.drawCallOptimize = true;
            this.BASE_PLAYER_SPD = xls.get(xls.globaltest).get(1).roleSpeed;
            this.MAX_SCORE = xls.get(xls.globaltest).get(1).energyMaxLimit;
            this._bone = clientCore.BoneMgr.ins.play(`res/battle/role/${clientCore.LocalInfo.sex == 1 ? 1400001 : 1400002}.sk`, 'idle', true, this.imgPlayer);
            this._bone.pos(0, 100);
        }

        onPreloadOver() {
            this.gameStart();
        }

        set score(s: number) {
            this._score = _.clamp(s, 0, this.MAX_SCORE);
            this.txtScore.text = `${this._score}/${this.MAX_SCORE}`;
        }

        get score() {
            return this._score;
        }

        set life(l: number) {
            this.listLife.repeatX = l;
            if (l == 0)
                this.listLife.visible = false;
        }

        get life() {
            if (!this.listLife.visible)
                return 0;
            return this.listLife.repeatX;
        }

        private gameStart() {
            this._playSpd = 0;
            this.score = 0;
            this._time = 60;
            this.life = 3;
            this.txtCountDown.text = this._time.toString();
            net.send(new pb.cs_destiny_attack_mini_game_start());
            this.playCountDown();
        }

        private async playCountDown() {
            for (let i = 3; i >= 1; i--) {
                await this.playOneCountDown(i);
            }
            this.imgCountDown.visible = false;
            this._gameRuning = true;
        }

        private playOneCountDown(num: number) {
            this.imgCountDown.skin = `catchDropGame/count_${num}.png`;
            this.imgCountDown.scale(1, 1);
            if (num == 1) {
                core.SoundManager.instance.playSound(this.getMusicUrl("countDown_2"));
            }
            else {
                core.SoundManager.instance.playSound(this.getMusicUrl("countDown_1"));
            }
            return new Promise((ok) => {
                egret.Tween.get(this.imgCountDown).to({ scaleX: 1.2, scaleY: 1.2 }, 200).to({ scaleX: 0, scaleY: 0 }, 700).call(() => {
                    ok();
                }, this);
            })
        }

        private getMusicUrl(str: string): string {
            return `res/sound/familyActivity/color/${str}.ogg`;
        }

        private _nowAni: string = 'idle';
        private onMove(spd: number) {
            this._playSpd = spd * this.BASE_PLAYER_SPD;
            let ani = spd == 0 ? 'idle' : 'move';
            if (ani != this._nowAni) {
                this._bone.play(ani, true);
                this._nowAni = ani;
            }
            if (spd != 0)
                this.imgPlayer.scaleX = spd < 0 ? 1 : -1;
        }

        private onKeyDown(e: Laya.Event) {
            if (e.keyCode == Laya.Keyboard.LEFT || e.keyCode == Laya.Keyboard.A)
                this.onMove(-1);
            else if (e.keyCode == Laya.Keyboard.RIGHT || e.keyCode == Laya.Keyboard.D)
                this.onMove(1);
        }

        private onKeyUp() {
            this.onMove(0);
        }

        private onFrame() {
            if (this._gameRuning) {
                for (let i = this._itemArr.length - 1; i >= 0; i--) {
                    let item = this._itemArr[i];
                    item.y += item.speed;
                    if ((Math.abs(this.imgPlayer.x - item.x) < (ITEM_SIZE_HALF + PLAYER_WIDTH_HALF) && (Math.abs(this.imgPlayer.y - item.y) < (ITEM_SIZE_HALF + PLAYER_HEIGHT_HALP)))) {
                        this.removeDropItem(i);
                        if (item.isBoom) {
                            this.life -= 1;
                            if (this.life == 0) {
                                this.gameOver();
                            }
                        }
                        else {
                            this.score += item.score;
                            core.SoundManager.instance.playSound('res/sound/gain3.ogg');
                        }
                    }
                    else if (item.y >= (750 + ITEM_SIZE_HALF)) {
                        this.removeDropItem(i);
                    }
                }
                this.imgPlayer.x = _.clamp(this.imgPlayer.x + this._playSpd, MIN_X, MAX_X);
            }
        }

        private _resultPanel: CatchDropResultPanel;
        private async gameOver() {
            this._gameRuning = false;
            await net.sendAndWait(new pb.cs_destiny_attack_mini_game_over({ energy: this.score }));
            if (!this._resultPanel) {
                await res.load('atlas/miniGameResult.atlas');
                this._resultPanel = new CatchDropResultPanel();
            }
            this._resultPanel.show(this.score);
        }

        private createDropItem() {
            if (this._gameRuning) {
                let item: DropItem
                if (this._itemPool.length > 0) {
                    item = this._itemPool.pop();
                }
                else {
                    item = new DropItem();
                }
                let xlsInfo = this.getRandomXlsInfo();
                item.isBoom = xlsInfo.award.v2 == 0;
                item.score = xlsInfo.award.v2;
                item.speed = xlsInfo.speed;
                item.x = _.random(MIN_X, MAX_X);
                item.y = -ITEM_SIZE_HALF;
                this.addChild(item);
                this._itemArr.push(item);
            }
        }

        private _allXls: xls.gameMoveElement[];
        private getRandomXlsInfo() {
            this._allXls = this._allXls || xls.get(xls.gameMoveElement).getValues();
            let ran = _.random(0, 100, false);
            let sum = 0;
            for (const xlsInfo of this._allXls) {
                sum += xlsInfo.probability;
                if (ran <= sum) {
                    return xlsInfo;
                }
            }
        }

        private removeDropItem(idx: number) {
            let item = this._itemArr.splice(idx, 1)[0];
            if (item) {
                item.removeSelf();
                this._itemPool.push(item);
            }
        }

        private onPause() {
            this._gameRuning = false;
            alert.showSmall('退出后不能获得任何奖励，确认退出吗？', { callBack: { caller: this, funArr: [this.sureClose, this.continue] } })
            // this._pausePanel = this._pausePanel || new CatchDropPausePanel();
            // this._pausePanel.open();
            // this._pausePanel.once(Laya.Event.CLOSE, this, () => { this._gameRuning = true });
        }

        private sureClose() {
            this.destroy();
            clientCore.ToolTip.gotoMod(95);
        }

        private continue() {
            this._gameRuning = true;
        }

        private onTimer() {
            if (this._gameRuning) {
                this._time -= 1;
                this.txtCountDown.text = this._time.toString();
                if (this._time == 0) {
                    this.gameOver();
                }
            }
        }


        addEventListeners() {
            BC.addEvent(this, this.btnLeft, Laya.Event.MOUSE_DOWN, this, this.onMove, [-1]);
            BC.addEvent(this, this.btnRight, Laya.Event.MOUSE_DOWN, this, this.onMove, [1]);
            BC.addEvent(this, this.btnLeft, Laya.Event.MOUSE_OUT, this, this.onMove, [0]);
            BC.addEvent(this, this.btnLeft, Laya.Event.MOUSE_UP, this, this.onMove, [0]);
            BC.addEvent(this, this.btnRight, Laya.Event.MOUSE_OUT, this, this.onMove, [0]);
            BC.addEvent(this, this.btnRight, Laya.Event.MOUSE_UP, this, this.onMove, [0]);

            BC.addEvent(this, Laya.stage, Laya.Event.KEY_DOWN, this, this.onKeyDown);
            BC.addEvent(this, Laya.stage, Laya.Event.KEY_UP, this, this.onKeyUp);

            BC.addEvent(this, this.btnPause, Laya.Event.CLICK, this, this.onPause);
            Laya.timer.frameLoop(1, this, this.onFrame);
            Laya.timer.loop(1000, this, this.createDropItem);
            Laya.timer.loop(1000, this, this.onTimer);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTimer);
            Laya.timer.clear(this, this.createDropItem);
            Laya.timer.clear(this, this.onFrame);
        }

        destroy() {
            for (const iterator of this._itemArr) {
                iterator.destroy();
            }
            for (const iterator of this._itemPool) {
                iterator.destroy();
            }
            this._itemArr = this._itemPool = [];
            this._bone?.dispose();
            super.destroy();
        }
    }
}