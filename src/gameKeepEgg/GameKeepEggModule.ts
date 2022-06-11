namespace gameKeepEgg {
    /**
     * 竖鸡蛋小游戏
     * gameKeepEgg.GameKeepEggModule
     */
    export class GameKeepEggModule extends ui.gameKeepEgg.GameKeepEggModuleUI {
        private _gameRuning: boolean;
        private _time: number;
        private mouseDown: boolean;
        private flag: number;
        private score: number;
        private _info: { stageId: number, type: number };

        private aniEgg1: clientCore.Bone;
        private aniEgg2: clientCore.Bone;
        init(d: any) {
            this.drawCallOptimize = true;
            this._info = { stageId: 60133, type: 2 };
            this.aniEgg2 = clientCore.BoneMgr.ins.play("res/animate/springMoon/egg2.sk", 0, true, this.boxAni);
            this.aniEgg2.pos(130, 170);
            this.aniEgg1 = clientCore.BoneMgr.ins.play("res/animate/springMoon/egg1.sk", "happy", true, this.egg);
            this.aniEgg1.pos(103, 244);
            this.imgTip.skin = "gameKeepEgg/tip_3.png";
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年4月2日活动', '【游戏】竖鸡蛋', '进入游戏');
            this.gameStart();
        }

        private gameStart() {
            this._time = 30;
            this.labTime.text = this._time.toString();
            net.send(new pb.cs_mini_game_begin({ stageId: this._info.stageId, type: this._info.type }));
            this.playCountDown();
        }

        private async playCountDown() {
            for (let i = 3; i >= 1; i--) {
                await this.playOneCountDown(i);
            }
            this.img_countDown.visible = false;
            this._gameRuning = true;
        }

        private playOneCountDown(num: number) {
            this.img_countDown.skin = `gameKeepEgg/count_${num}.png`;
            this.img_countDown.scale(1, 1);
            if (num == 1) {
                core.SoundManager.instance.playSound(this.getMusicUrl("countDown_2"));
            }
            else {
                core.SoundManager.instance.playSound(this.getMusicUrl("countDown_1"));
            }
            return new Promise((ok) => {
                egret.Tween.get(this.img_countDown).to({ scaleX: 1.2, scaleY: 1.2 }, 200).to({ scaleX: 0, scaleY: 0 }, 700).call(() => {
                    ok();
                }, this);
            })
        }

        private getMusicUrl(str: string): string {
            return `res/sound/familyActivity/color/${str}.ogg`;
        }

        /**每秒刷新 */
        private onTimer() {
            if (this._gameRuning) {
                this._time -= 1;
                this.labTime.text = this._time.toString();
                if (this._time == 0) {
                    if (this.egg.rotation >= 85 || this.egg.rotation <= -85) {
                        this.score = 1;
                    } else if (this.egg.rotation > 15 || this.egg.rotation < -15) {
                        this.score = 2;
                    } else {
                        this.score = 3;
                    }
                    this.gameOver();
                }
            }
        }

        /**每帧刷新 */
        private onFrame() {
            if (this._gameRuning) {
                let flag: number;
                if (this.mouseDown) {
                    flag = this.flag;
                    this.egg.rotation += flag * 3;
                } else {
                    flag = this.egg.rotation < 0 ? -1 : 1;
                    this.egg.rotation += flag * 1;
                }
                this.egg.pivotX = this.egg.rotation == 0 ? 102.5 : this.egg.rotation < 0 ? 95 : 110;
                let baseX = this.egg.rotation == 0 ? 668 : this.egg.rotation < 0 ? 661 : 675;
                this.egg.x = baseX + 1.04 * this.egg.rotation;
                this.imgFlag.x = (this.egg.rotation + 90) / 180 * 500;
                if (this.egg.rotation >= 85 || this.egg.rotation <= -85) {
                    this.imgTip.skin = "gameKeepEgg/tip_1.png";
                    this.score = 1;
                    this.gameOver();
                    if (this.aniEgg1.nameOrIndex != "worried") this.aniEgg1.play("worried", true);
                } else if (this.egg.rotation > 15 || this.egg.rotation < -15) {
                    this.imgTip.skin = "gameKeepEgg/tip_2.png";
                    if (this.aniEgg1.nameOrIndex != "hurt") this.aniEgg1.play("hurt", true);
                } else {
                    this.imgTip.skin = "gameKeepEgg/tip_3.png";
                    if (this.aniEgg1.nameOrIndex != "happy") this.aniEgg1.play("happy", true);
                }
            }
        }

        /**游戏结束 */
        private async gameOver() {
            this._gameRuning = false;
            // alert.showFWords(`游戏结束，得分${this.score}`);
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
        }

        private onPause() {
            this._gameRuning = false;
            alert.showSmall('退出后不能获得任何奖励，确认退出吗？', { callBack: { caller: this, funArr: [this.sureClose, this.continue] } });
        }

        private continue() {
            this._gameRuning = true;
        }

        private onMouseDown(e: Laya.Event) {
            this.mouseDown = true;
            this.flag = (e.currentTarget.mouseX < e.currentTarget.width / 2) ? 1 : -1;
        }

        private onMouseUp() {
            this.mouseDown = false;
        }

        private sureClose() {
            clientCore.ToolTip.gotoMod(254);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onPause);
            BC.addEvent(this, this, Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            BC.addEvent(this, this, Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.timer.loop(40, this, this.onFrame);
            Laya.timer.loop(1000, this, this.onTimer);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onFrame);
            Laya.timer.clear(this, this.onTimer);
        }

        destroy() {
            super.destroy();
        }
    }
}