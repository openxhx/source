namespace catchFish {
    /**
     * 捕鱼小游戏
     * catchFish.CatchFishModule
     */
    export class CatchFishModule extends ui.catchFish.CatchFishModuleUI {
        private _info: { stageId: number, type: number };

        /**基础速度 */
        private _baseSpeed: number;
        /**鱼惊吓时间，毫秒*/
        private _onShock: number;
        /**产生惊吓的点 */
        private shokPoint: Laya.Point;
        /**得分 */
        private _score: number;
        /**渔网耐久 */
        private _durability: number;
        /**渔网当前状态 */
        private _netState: number;
        /**关卡分数界限 */
        private readonly levelCfg: number[] = [10, 20, 40, 60, 90];
        /**渔网耐久界限 */
        private readonly netCfg: number[] = [100, 80, 40, 0];
        /**当前关卡 */
        private curLevel: number;
        /**鱼出现概率 */
        private probabilityCfg: number[];
        /**渔网位置 */
        private netPos: number;

        private _rocker: Rocker; //摇杆
        private _net: FishNet;

        private _waiting: boolean;

        private fishAniMap: clientCore.Bone[];
        private fishMap: Fish[];
        private gotFish: clientCore.Bone[];
        private netFish: Fish[];
        private netAniFish: clientCore.Bone[];
        init(d: any) {
            this._info = { stageId: 60137, type: 2 };
            this._baseSpeed = 6;
            this._score = 0;
            this.labPoint.text = "0";
            this.curLevel = 1;
            this.labLevel.text = "关卡1";
            this.labTarget.text = "" + this.levelCfg[this.curLevel - 1];
            //渔网
            this._durability = 100;
            this.boxArea.addChildAt(this.imgWang, 5);
            this.netPos = 5;
            this._net = new FishNet();
            this._net.init(this.imgWang);
            this._net.pos(this.boxArea.width / 2, this.boxArea.height / 2);
            this.boxArea.addChildAt(this.imgWang, 5);
            //摇杆
            this._rocker = new Rocker();
            this._rocker.configure(this._net, this._baseSpeed);
            //
            this.netFish = [];
            this.netAniFish = [];
            this.gotFish = [];
            this.fishAniMap = [];
            this.fishMap = [];
            net.send(new pb.cs_mini_game_begin({ stageId: this._info.stageId, type: this._info.type }));
            this.startGame();
            Laya.MouseManager.multiTouchEnabled = true;
            // Laya.TouchManager.I.enable = true;
            this._speed = new util.Vector2D();
        }

        private setProbability() {
            this.probabilityCfg = [];
            this.probabilityCfg.push(70 - 10 * this.curLevel);
            this.probabilityCfg.push(20 + 5 * this.curLevel);
            this.probabilityCfg.push(8 + 4 * this.curLevel);
            this.probabilityCfg.push(2 + this.curLevel);
        }

        private creatFish() {
            for (let i: number = 0; i < 8; i++) {
                this.addFish(null, 0, 0);
            }
        }

        private startGame() {
            this.setProbability();
            this.creatFish();
        }

        private addFish(type: number, x: number, y: number) {
            if (!type) {
                let random = Math.floor(Math.random() * 100);
                let line: number = this.probabilityCfg[0];
                for (let i: number = 1; i <= 4; i++) {
                    if (random < line) {
                        type = i;
                        break;
                    } else {
                        line += this.probabilityCfg[i];
                    }
                }
            }
            this.fishMap.push(new Fish(type));
            let ani = clientCore.BoneMgr.ins.play(`unpack/catchFish/${type}fish1.sk`, 0, true, this.boxFish);
            ani.scaleX = -1;
            this.fishAniMap.push(ani);
            if (x > 0 || y > 0) {
                ani.pos(x, y);
            } else {
                ani.pos(Math.random() * 1170, Math.random() * 400);
            }
        }

        private clearFish() {
            if (this.gotFish && this.gotFish.length > 0) {
                for (let i: number = 0; i < this.gotFish.length; i++) {
                    this.gotFish[i].dispose();
                }
            }
            this.gotFish = [];
            if (this.fishAniMap.length > 0) {
                for (let i: number = 0; i < this.fishAniMap.length; i++) {
                    Laya.Tween.clearAll(this.fishAniMap[i]);
                    this.fishAniMap[i].dispose();
                }
            }
            this.fishAniMap = [];
            this.fishMap = [];
        }

        private async gameOver() {
            if(this._waiting)return;
            this._waiting = true;
            net.sendAndWait(new pb.cs_mini_game_over({ stageId: this._info.stageId, type: this._info.type, score: this.curLevel - 1 })).then((data: pb.sc_mini_game_over) => {
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
            alert.showSmall('退出游戏不会获得任何奖励,也不扣除游戏次数,确认退出吗?', { callBack: { caller: this, funArr: [this.sureClose] } });
        }

        private sureClose() {
            clientCore.ToolTip.gotoMod(267);
        }

        /**每帧刷新 */
        private onFrame() {
            if (this._onShock > 0) this._onShock -= 40;
            // if (this.netPos == 0) {
            //     this.imgWang.x = _.clamp(this.imgWang.x + this._speed.x * 12, 0, 1190);
            //     this.imgWang.y = _.clamp(this.imgWang.y + this._speed.y * 12, 0, 420);
            // } else {
            //     this.imgWang.x = _.clamp(this.imgWang.x + this._speed.x * 12, 0, 1190);
            //     this.imgWang.y = _.clamp(this.imgWang.y + this._speed.y * 12, 0, 660);
            // }
        }

        private fishMove() {
            if (this._onShock > 0) this._baseSpeed = 288;
            else this._baseSpeed = 144;
            for (let i: number = 0; i < this.fishAniMap.length; i++) {
                let fish = this.fishAniMap[i];
                let isMove = Math.random() < 0.5;
                let force: util.Vector2D = new util.Vector2D(Math.random() * 2 - 1, Math.random() * 2 - 1);
                if (this._onShock > 0) {
                    isMove = true;
                    force = new util.Vector2D(fish.x - this.shokPoint.x, fish.y - this.shokPoint.y);
                }
                if (isMove) {
                    fish.rotation = force.angle * 180 / Math.PI;
                    let speed = force.normalize().multiply(this._baseSpeed * this.fishMap[i].speed);
                    let x = _.clamp(fish.x + speed.x, 20, 1170);
                    let y = _.clamp(fish.y + speed.y, 20, 400);
                    Laya.Tween.clearAll(fish);
                    Laya.Tween.to(fish, { x: x, y: y }, 1000, null);
                }
            }
        }

        /**放下渔网 */
        private downNet() {
            if (this._durability <= 0) {
                alert.showFWords("渔网已破");
                return;
            }
            if (this.imgWang.x >= 0 && this.imgWang.x <= 1190 && this.imgWang.y >= 0 && this.imgWang.y <= 420) {//池塘
                if (this.netFish.length > 0) {
                    this.freeFish();
                    return;
                }
                this.boxArea.addChildAt(this.imgWang, 0);
                this.netPos = 0;
                this.setShock();
                this.btnStart.fontSkin = "catchFish/lao_qu.png";
            } else if (this.imgWang.x >= 450 && this.imgWang.x <= 740 && this.imgWang.y >= 430 && this.imgWang.y <= 660) {//鱼盆
                if (this.netFish.length > 0) {
                    this.setShock();
                    this.getFish();
                }
            }
        }

        /**捞起渔网 */
        private upNet() {
            if (this.netPos == 0) {
                //效果显示
                this.shokPoint = new Laya.Point(this.imgWang.x, this.imgWang.y);
                this._onShock = 200;
                this.boxArea.addChildAt(this.imgWang, 6);
                this.netPos = 5;
                let ani = clientCore.BoneMgr.ins.play("unpack/catchFish/shuihua.sk", 0, false, this.boxFish);
                ani.pos(this.imgWang.x, this.imgWang.y);
                ani.once(Laya.Event.COMPLETE, this, () => {
                    ani.dispose();
                })
                this.btnStart.fontSkin = "catchFish/fang_xia.png";
                //耐久减2
                this._durability -= 2;
                //检查是否捞到鱼
                this.checkFish();
            }
        }

        private checkFish() {
            let netPoint = new Laya.Point(this.imgWang.x, this.imgWang.y);
            for (let i: number = 0; i < this.fishAniMap.length;) {
                if (netPoint.distance(this.fishAniMap[i].x, this.fishAniMap[i].y) < 90) {
                    let type = this.fishMap[i].type;
                    let fishUp = clientCore.BoneMgr.ins.play(`unpack/catchFish/${type}fish2.sk`, 0, true, this.imgWang);
                    fishUp.pos(this.fishAniMap[i].x - netPoint.x + 90, this.fishAniMap[i].y - netPoint.y + 90);
                    this.netFish.push(this.fishMap.splice(i, 1)[0]);
                    this.netAniFish.push(fishUp);
                    this.fishAniMap.splice(i, 1)[0].dispose();
                } else {
                    i++;
                }
            }
            if (this.netFish.length == 0) this.updateNet();
            this.checkNet();
        }

        /**检查渔网耐久 */
        private checkNet() {
            for (let i: number = 0; i < this.netFish.length; i++) {
                this._durability -= this.netFish[i].weight;
            }
            if (this._durability <= 0) {
                this.freeFish();
            }
        }

        private updateNet() {
            if (this._durability > 80) {
                this.imgWang.skin = "catchFish/yu_wang1.png";
            } else if (this._durability > 40) {
                this.imgWang.skin = "catchFish/yu_wang2.png";
            } else if (this._durability > 0) {
                this.imgWang.skin = "catchFish/yu_wang3.png";
            } else {
                this.imgWang.skin = "catchFish/yu_wang4.png";
                this.gameOver();
            }
        }

        /**释放鱼 */
        private freeFish() {
            if (this.netFish.length > 0) {
                this.setShock();
            }
            for (let i: number = 0; i < this.netFish.length; i++) {
                this.addFish(this.netFish[i].type, this.imgWang.x, this.imgWang.y);
                this.netAniFish[i].dispose();
            }
            this.netFish = [];
            this.netAniFish = [];
            this.updateNet();
        }

        /**收获鱼 */
        private getFish() {
            let info = [0, 0, 0, 0];
            for (let i: number = 0; i < this.netFish.length; i++) {
                let ani = clientCore.BoneMgr.ins.play(`unpack/catchFish/${this.netFish[i].type}fish1.sk`, 0, true, this.boxPen);
                this.gotFish.push(ani);
                ani.pos(Math.random() * 130, Math.random() * 120);
                this.netAniFish[i].dispose();
                this.addFish(0, 0, 0);
                this._score += this.netFish[i].point;
                info[this.netFish[i].type - 1]++;
            }
            net.send(new pb.cs_summer_memory_get_fish({ num: info }));
            this.labPoint.text = "" + this._score;
            if (this._score >= this.levelCfg[this.curLevel - 1]) {
                alert.showFWords("恭喜过关！");
                this.curLevel++;
                if (this.curLevel > 5) {
                    this.gameOver();
                    return;
                }
                this._durability = 100;
                this.labLevel.text = "关卡" + this.curLevel;
                this.labTarget.text = "" + this.levelCfg[this.curLevel - 1];
                this.clearFish();
                this.startGame();
            }
            this.netFish = [];
            this.netAniFish = [];
            this.updateNet();
        }

        private setShock() {
            this.shokPoint = new Laya.Point(this.imgWang.x, this.imgWang.y);
            this._onShock = 200;
            let ani = clientCore.BoneMgr.ins.play("unpack/catchFish/shuihua.sk", 0, false, this.boxFish);
            ani.pos(this.imgWang.x, this.imgWang.y);
            ani.once(Laya.Event.COMPLETE, this, () => {
                ani.dispose();
            })
            this.fishMove();
        }

        private _speed: util.Vector2D;
        private _diff: util.Vector2D;
        private onKeyDown(e: Laya.Event) {
            if (!this._diff) this._diff = new util.Vector2D();
            if (e.keyCode == Laya.Keyboard.W || e.keyCode == Laya.Keyboard.UP)
                this._diff.y = -1;
            if (e.keyCode == Laya.Keyboard.A || e.keyCode == Laya.Keyboard.LEFT)
                this._diff.x = -1;
            if (e.keyCode == Laya.Keyboard.S || e.keyCode == Laya.Keyboard.DOWN)
                this._diff.y = 1;
            if (e.keyCode == Laya.Keyboard.D || e.keyCode == Laya.Keyboard.RIGHT)
                this._diff.x = 1;
            this._speed = this._diff.multiply(2);
        }

        private onKeyUp(e: Laya.Event) {
            if (e.keyCode == Laya.Keyboard.W || e.keyCode == Laya.Keyboard.UP)
                this._diff.y = 0;
            if (e.keyCode == Laya.Keyboard.A || e.keyCode == Laya.Keyboard.LEFT)
                this._diff.x = 0;
            if (e.keyCode == Laya.Keyboard.S || e.keyCode == Laya.Keyboard.DOWN)
                this._diff.y = 0;
            if (e.keyCode == Laya.Keyboard.D || e.keyCode == Laya.Keyboard.RIGHT)
                this._diff.x = 0;
            this._speed = this._diff.multiply(2);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnExit, Laya.Event.CLICK, this, this.onPause);
            BC.addEvent(this, Laya.stage, Laya.Event.KEY_DOWN, this, this.onKeyDown);
            BC.addEvent(this, Laya.stage, Laya.Event.KEY_UP, this, this.onKeyUp);
            BC.addEvent(this, this.btnStart, Laya.Event.MOUSE_DOWN, this, this.downNet);
            BC.addEvent(this, this.btnStart, Laya.Event.MOUSE_UP, this, this.upNet);
            BC.addEvent(this, this.btnStart, Laya.Event.MOUSE_OUT, this, this.upNet);
            Laya.timer.loop(40, this, this.onFrame);
            Laya.timer.loop(1000, this, this.fishMove);

            // Laya.TouchManager.I.onMouseDown();
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onFrame);
            Laya.timer.clear(this, this.fishMove);
        }

        destroy() {
            this.clearFish();
            for (let i: number = 0; i < this.netAniFish.length; i++) {
                this.netAniFish[i].dispose();
            }
            this.netFish = [];
            this.netAniFish = [];
            this._rocker.dispose();
            this._rocker = null;
            super.destroy();
        }
    }

    class Fish {
        /**类型 */
        type: number;
        /**速度 */
        speed: number;
        /**重量 */
        weight: number;
        /**分值 */
        point: number;

        constructor(type: number) {
            this.type = type;
            this.setData(type);
        }

        setData(type: number) {

            switch (type) {
                case 1://小鱼
                    this.speed = 1;
                    this.weight = 4;
                    this.point = 1;
                    break;
                case 2://中鱼
                    this.speed = 1;
                    this.weight = 6;
                    this.point = 2;
                    break;
                case 3://大鱼
                    this.speed = 1;
                    this.weight = 8;
                    this.point = 3;
                    break;
                case 4://彩色鱼
                    this.speed = 2;
                    this.weight = 5;
                    this.point = 3;
                    break;
            }
        }
    }
}