namespace catchFruitsGame {
    class DropItem extends ui.catchFruitsGame.DropItemUI {
        speed: number;
        private _isFruit: boolean;
        private _score: number;

        set isFruit(b: boolean) {
            this._isFruit = b;
            this.img.skin = b ? 'catchFruitsGame/guo_zi.png' : 'catchFruitsGame/shu_zhi.png';
            if (b) {
                this._score = 10;
            } else {
                this._score = -5;
            }
        }

        get isFruit() {
            return this._isFruit;
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

    export class CatchFruitsGameModule extends ui.catchFruitsGame.CatchFruitsGameModuleUI {
        private _itemPool: DropItem[];
        private _gameRuning: boolean;
        private _playSpd: number;
        private _itemArr: DropItem[];
        private _score: number;
        private _time: number;

        private BASE_PLAYER_SPD: number;
        private _bone: clientCore.Bone;

        private fruitNum = 20;
        private twigNum = 15;

        private _info: { stageId: number, type: number };
        init(d: any) {
            this._info = { stageId: 60121, type: 2 };
            this.addPreLoad(xls.load(xls.characterVoice));
            this._itemArr = [];
            this._itemPool = [];
            this.drawCallOptimize = true;
            this.BASE_PLAYER_SPD = xls.get(xls.globaltest).get(1).roleSpeed;
            this._bone = clientCore.BoneMgr.ins.play(`res/animate/moonCake/${clientCore.LocalInfo.sex == 1 ? "playerF" : "playerM"}.sk`, 'idle', true, this.imgPlayer);
            this._bone.pos(0, 100);
        }

        onPreloadOver() {
            this.gameStart();
        }

        set score(s: number) {
            this._score = _.max([s, 0]);
            this.labPoint.text = `${this._score}`;
        }

        get score() {
            return this._score;
        }

        private gameStart() {
            this._playSpd = 0;
            this.score = 0;
            this._time = 60;
            this.labTime.text = this._time.toString();
            net.send(new pb.cs_mini_game_begin({ stageId: this._info.stageId, type: this._info.type }));
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
            this.imgCountDown.skin = `catchFruitsGame/count_${num}.png`;
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
            if (this._nowAni == "hurt") return;
            this._playSpd = spd * this.BASE_PLAYER_SPD;
            let ani = spd == 0 ? 'idle' : 'move';
            if (ani != this._nowAni) {
                this._bone.play(ani, true);
                this._nowAni = ani;
            }
            if (spd != 0)
                this.imgPlayer.scaleX = spd < 0 ? 1 : -1;
        }

        private onHurt() {
            this._playSpd = 0;
            this._nowAni = "hurt";
            this._bone.skeleton.offAll();
            this._bone.play("hurt", false, Laya.Handler.create(this, this.recover));
        }

        private recover() {
            this._bone.play("idle", true);
            this._nowAni = "idle";
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
                        this.score += item.score;
                        if (item.isFruit) {
                            core.SoundManager.instance.playSound('res/sound/gain3.ogg');
                        } else {
                            this.onHurt();
                        }
                    }
                    else if (item.y >= (750 + ITEM_SIZE_HALF)) {
                        this.removeDropItem(i);
                    }
                }
                this.imgPlayer.x = _.clamp(this.imgPlayer.x + this._playSpd, MIN_X, MAX_X);
            }
        }

        // private _resultPanel: CatchFruitsResultPanel;
        private async gameOver() {
            this._gameRuning = false;
            net.sendAndWait(new pb.cs_mini_game_over({ stageId: this._info.stageId, type: this._info.type, score: this.score })).then((data: pb.sc_mini_game_over) => {
                if (data.rewardInfo.length == 0) {
                    alert.showFWords('游戏结束，本次游戏未获得奖励~');
                    this.sureClose();
                    return;
                }
                alert.showReward(clientCore.GoodsInfo.createArray(data.rewardInfo), '', {
                    vipAddPercent: 0, callBack: {
                        caller: this, funArr: [() => {
                            this.sureClose();
                        }]
                    }
                });
            });
            // await net.sendAndWait(new pb.cs_destiny_attack_mini_game_over({ energy: this.score }));
            // if (!this._resultPanel) {
            //     await res.load('atlas/miniGameResult.atlas');
            //     this._resultPanel = new CatchFruitsResultPanel();
            // }
            // this._resultPanel.show(this.score);
        }

        private createDropItem() {
            if (this._gameRuning) {
                let type = this.getRandomInfo();
                if (!type) return;
                let item: DropItem
                if (this._itemPool.length > 0) {
                    item = this._itemPool.pop();
                }
                else {
                    item = new DropItem();
                }

                item.isFruit = type == 1;
                item.speed = Math.floor(Math.random() * 5) + 6;
                item.x = _.random(MIN_X, MAX_X);
                item.y = -ITEM_SIZE_HALF;
                this.addChild(item);
                this._itemArr.push(item);
            }
        }

        private getRandomInfo() {
            if (Math.random() < 0.57 && this.fruitNum > 0) {
                this.fruitNum--;
                return 1;
            } else if (this.twigNum > 0) {
                this.twigNum--;
                return 2;
            } else {
                return 0;
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
            clientCore.ToolTip.gotoMod(172);
        }

        private continue() {
            this._gameRuning = true;
        }

        private onTimer() {
            if (this._gameRuning) {
                this._time -= 1;
                this.labTime.text = this._time.toString();
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

            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onPause);
            Laya.timer.frameLoop(1, this, this.onFrame);
            Laya.timer.loop(1600, this, this.createDropItem);
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