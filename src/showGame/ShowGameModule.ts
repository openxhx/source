namespace showGame {
    const MIN_X = 0;
    const MAX_X = 1100;
    const MIN_Y = 20;
    const MAX_Y = 345;
    export class ShowGameModule extends ui.showGame.ShowGameModuleUI {
        private _gameRuning: boolean;
        private _playSpdH: number;
        private _playSpdV: number;
        private _score: number;
        private _time: number;

        private _showing: number;
        private _falling: boolean;
        private BASE_PLAYER_SPD: number;
        private _bone: clientCore.Bone;

        private _light_cd: number[];
        private _info: { stageId: number, type: number };

        private _items: any[];

        init(d: any) {
            this._info = { stageId: 60122, type: 2 };
            this.drawCallOptimize = true;
            this.BASE_PLAYER_SPD = xls.get(xls.globaltest).get(1).roleSpeed / 3;
            this._bone = clientCore.BoneMgr.ins.play(`res/animate/huascars/${clientCore.LocalInfo.sex == 1 ? "girl_red" : "boy_red"}.sk`, 'walk', true, this.img_role);
            this._bone.pos(99, 247);
            this.box1.visible = this.boxTalk.visible = false;
        }

        onPreloadOver() {
            this._items = [this.banana_1, this.banana_2, this.banana_3, this.img_role, this.light_1, this.light_2, this.light_3];
            this._light_cd = [8, 8, 8];
            for (let i = 1; i <= 3; i++) {
                this.showLight(i, false);
                this.showBanana(i, false);
            }
            this.refreshLevel();
            this.gameStart();
        }

        private gameStart() {
            this._playSpdH = -this.BASE_PLAYER_SPD;
            this._playSpdV = 0;
            this._showing = 0;
            this.score = 0;
            this._time = 60;
            this.lab_time.text = this._time.toString();
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
            this.img_countDown.skin = `showGame/count_${num}.png`;
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

        set score(s: number) {
            this._score = _.max([s, 0]);
            this.lab_point.text = `${this._score}`;
            if (this._score <= 0) this.lab_reward.text = "0";
            else if (this._score <= 13) this.lab_reward.text = "2";
            else if (this._score <= 26) this.lab_reward.text = "4";
            else this.lab_reward.text = "6";
        }

        get score() {
            return this._score;
        }


        private onMove(spd: number) {
            this._playSpdV = spd * this.BASE_PLAYER_SPD;
        }

        private onKeyDown(e: Laya.Event) {
            if (e.keyCode == Laya.Keyboard.UP || e.keyCode == Laya.Keyboard.W)
                this.onMove(-1);
            else if (e.keyCode == Laya.Keyboard.DOWN || e.keyCode == Laya.Keyboard.S)
                this.onMove(1);
        }

        private onKeyUp() {
            this.onMove(0);
        }
        /**每帧刷新 */
        private onFrame() {
            if (this._gameRuning && !this._showing && !this._falling) {
                this.img_role.x = _.clamp(this.img_role.x + this._playSpdH, MIN_X, MAX_X);
                if (this.img_role.x == MAX_X || this.img_role.x == MIN_X) {
                    this._playSpdH = -this._playSpdH;
                    this.img_role.scaleX = -this.img_role.scaleX;
                }
                this.img_role.y = _.clamp(this.img_role.y + this._playSpdV, MIN_Y, MAX_Y);
                if (this._playSpdV != 0) this.refreshLevel();

                for (let i = 1; i <= 3; i++) {
                    if (Math.abs(this.img_role.x - this["light_" + i].x) < 30 && this.img_role.y < this["light_" + i].y && this["light_" + i].y - this.img_role.y > 25 && this["light_" + i].y - this.img_role.y < 65) {
                        this.onLight(i);
                        return;
                    }
                    if (Math.abs(this.img_role.x - this["banana_" + i].x) < 60 && this.img_role.y > this["banana_" + i].y && this.img_role.y - this["banana_" + i].y < 52) {
                        this.onBanana(i);
                        return;
                    }
                }
            }
        }

        /**触发香蕉皮 */
        private onBanana(idx: number) {
            this.score -= 3;
            this.showBanana(idx);
            this._falling = true;
            let ani = Math.ceil(Math.random() * 2);
            let ani1 = clientCore.BoneMgr.ins.play(`res/animate/huascars/light.sk`, 'animation', true, this);
            ani1.pos(667, 320);
            this.lab_talk1.text = "哇，仪态尽失了！";
            this.lab_talk2.text = "赶紧抢先爆料，明星走红毯摔个狗啃泥";
            this.lab_talk3.text = "哈哈哈，抓拍到摔倒丑态照片了！";
            this.boxTalk.visible = this.box1.visible = true;
            this._bone.play(`fall${ani}`, false, Laya.Handler.create(this, () => {
                this._bone.play(`walk`, true);
                this._falling = false;
                ani1.dispose();
                this.boxTalk.visible = this.box1.visible = false;
            }));
            // this.showFlash();
        }

        /**触发聚光灯 */
        private async onLight(idx: number) {
            this._showing = idx;
            this.score += 5;
            this.img_role.pos(this["light_" + idx].x, this["light_" + idx].y - 45);
            let ani = Math.ceil(Math.random() * 2);
            this._bone.play(`happy${ani}`, true);
            let ani1 = clientCore.BoneMgr.ins.play(`res/animate/huascars/light.sk`, 'animation', true, this);
            ani1.pos(667, 320);
            this.lab_talk1.text = "看这边，笑一个！！";
            this.lab_talk2.text = "百年一遇的大明星！！";
            this.lab_talk3.text = "很棒，再摆个动作~";
            this.boxTalk.visible = this.box1.visible = true;
            await util.TimeUtil.awaitTime(3000);
            this.boxTalk.visible = this.box1.visible = false;
            ani1.dispose();
            this._bone.play(`walk`, true);
            this._showing = 0;
            this.showLight(idx);
            // this.showFlash();
        }

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
        }

        private onPause() {
            this._gameRuning = false;
            alert.showSmall('退出后不能获得任何奖励，确认退出吗？', { callBack: { caller: this, funArr: [this.sureClose, this.continue] } });
        }

        private sureClose() {
            clientCore.ToolTip.gotoMod(175);
        }

        private continue() {
            this._gameRuning = true;
        }

        /**每秒刷新 */
        private onTimer() {
            if (this._gameRuning) {
                this._time -= 1;
                this.lab_time.text = this._time.toString();
                if (this._time == 0) {
                    this.gameOver();
                }
                for (let i = 0; i < 3; i++) {
                    if (this._showing != (i + 1) && this._light_cd[i] > 0) {
                        this._light_cd[i] -= 1;
                        if (this._light_cd[i] == 0) {
                            this.showLight(i + 1);
                        }
                    }
                }
            }
        }

        /**随机打光位置 */
        private showLight(idx: number, refresh: boolean = true) {
            this._light_cd[idx - 1] = 8;
            this["light_" + idx].x = Math.floor(Math.random() * 333) + 50 + (idx - 1) * 333;
            this["light_" + idx].y = Math.floor(Math.random() * 255) + 90;
            if (refresh) this.refreshLevel();
        }

        /**随机香蕉皮的位置 */
        private showBanana(idx: number, refresh: boolean = true) {
            this["banana_" + idx].x = Math.floor(Math.random() * 1100);
            this["banana_" + idx].y = Math.floor(Math.random() * 290);
            if (refresh) this.refreshLevel();
        }

        /**刷新层级关系 */
        private refreshLevel() {
            this._items.sort((a: any, b: any) => { return a.y - b.y });
            for (let i = 0; i < this._items.length; i++) {
                this._items[i].zOrder = i;
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onPause);
            BC.addEvent(this, this.btn_up, Laya.Event.MOUSE_DOWN, this, this.onMove, [-1]);
            BC.addEvent(this, this.btn_down, Laya.Event.MOUSE_DOWN, this, this.onMove, [1]);
            BC.addEvent(this, this.btn_up, Laya.Event.MOUSE_OUT, this, this.onMove, [0]);
            BC.addEvent(this, this.btn_up, Laya.Event.MOUSE_UP, this, this.onMove, [0]);
            BC.addEvent(this, this.btn_down, Laya.Event.MOUSE_OUT, this, this.onMove, [0]);
            BC.addEvent(this, this.btn_down, Laya.Event.MOUSE_UP, this, this.onMove, [0]);
            BC.addEvent(this, Laya.stage, Laya.Event.KEY_DOWN, this, this.onKeyDown);
            BC.addEvent(this, Laya.stage, Laya.Event.KEY_UP, this, this.onKeyUp);
            Laya.timer.frameLoop(1, this, this.onFrame);
            Laya.timer.loop(1000, this, this.onTimer);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onFrame);
            Laya.timer.clear(this, this.onTimer);
        }

        destroy() {
            this._items = null;
            this._bone?.dispose();
            super.destroy();
        }
    }
}