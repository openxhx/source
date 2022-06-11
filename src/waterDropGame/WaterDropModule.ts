namespace waterDropGame {
    /**
     * 游乐园水滴小游戏
     * waterDropGame.WaterDropModule
     */
    export class WaterDropModule extends ui.waterDropGame.WaterDropGameModuleUI {
        private _speed: number;
        private _score: number;
        private _waterCnt: number;
        private _boomCnt: number;

        /**游戏唯一id */
        private gameId: number;
        /**游戏目标 */
        private target: number;

        private maxlimitCnt: number[] = [9, 7, 10, 10, 7];
        private minLimitCnt: number[] = [4, 4, 7, 7, 4];
        private curCnt: number[];

        private milkMap: util.HashMap<clientCore.Bone>;
        private milkTypeMap: util.HashMap<number>;

        private dropArr: Laya.Image[];
        init(data: any) {
            this.gameId = data.stageId;
            this.addPreLoad(xls.load(xls.park));

        }

        onPreloadOver() {
            this.target = xls.get(xls.park).get(this.gameId).passType;
            this.boxMove.visible = true;
            this._speed = 6;
            this._score = 0;
            this._waterCnt = 16 - (this.gameId % 10);
            this.labCnt.text = "剩余：" + this._waterCnt;
            this.labPoint.text = (this._score + 1) + "/" + this.target;
            this._boomCnt = 0;
            this.startGame();
        }

        /** 开始游戏*/
        private startGame() {
            net.sendAndWait(new pb.cs_mini_game_collect_start({ id: this.gameId })).then((msg: pb.sc_mini_game_collect_start) => {
                this.boxMove.visible = false;
                this.initWaterDrop();
            }).catch(() => {
                this.destroy();
            });
        }

        private initWaterDrop() {
            this.curCnt = [0, 0, 0, 0, 0];
            if (!this.milkMap) this.milkMap = new util.HashMap();
            if (!this.milkTypeMap) this.milkTypeMap = new util.HashMap();
            this.milkTypeMap.clear();
            this.milkMap.clear();
            for (let j: number = 0; j < 6; j++) {
                for (let i: number = 0; i < 6; i++) {
                    let type = this.getType();
                    this.curCnt[type]++;
                    this.milkTypeMap.add(j * 6 + i, type);
                    if (type == 0) continue;
                    let milk = clientCore.BoneMgr.ins.play(`unpack/waterDropGame/milk${type}.sk`, 0, true, this.boxView);
                    milk.pos(i * 117 + 58, j * 121 + 56);
                    if (type == 1) milk.scaleX = milk.scaleY = 0.5;
                    else if (type == 2) milk.scaleX = milk.scaleY = 0.7;
                    else if (type == 3) milk.scaleX = milk.scaleY = 0.9;
                    this.milkMap.add(j * 6 + i, milk);
                }
            }
        }

        private imgPool: Laya.Image[];
        private creatImg() {
            if (!this.imgPool) this.imgPool = [];
            if (this.imgPool.length > 0) return this.imgPool.shift();
            else return new Laya.Image();
        }

        /**初始化获取随机类型 */
        private getType(): number {
            let idx = Math.floor(Math.random() * 5);
            if (this.curCnt[idx] < this.minLimitCnt[idx]) return idx;
            for (let i = 0; i < 5; i++) {
                if (this.curCnt[i] < this.minLimitCnt[i]) return i;
            }
            if (this.curCnt[idx] < this.maxlimitCnt[idx]) return idx;
            for (let i = 0; i < 5; i++) {
                if (this.curCnt[i] < this.maxlimitCnt[i]) return i;
            }
        }

        /**点击添加水滴 */
        private onViewClick(e: Laya.Event) {
            if (e.type == Laya.Event.CLICK) {
                let posX = Math.floor(e.target.mouseX / 117);
                let posY = Math.floor(e.target.mouseY / 121);
                let idx = posY * 6 + posX;
                let type = this.milkTypeMap.get(idx);
                if (type == 0) return;
                if (this._waterCnt <= 0) {
                    alert.showSmall('剩余水滴不足,是否结束游戏?', { callBack: { caller: this, funArr: [this.gameOver] } });
                    return;
                }
                this._waterCnt--;
                this.labCnt.text = "剩余：" + this._waterCnt;
                this.trigerUp(idx);
                // let milk = clientCore.BoneMgr.ins.play(`unpack/waterDropGame/milk1.sk`, 0, true, this.boxView);
                // milk.pos(posX * 117 + 58, posY * 121 + 56);
                // this.milkMap.add(idx, milk);
                // this.milkTypeMap.add(idx, type + 1);
            }
        }

        /**触发升级 */
        private trigerUp(idx: number) {
            let milk = this.milkMap.remove(idx);
            milk.dispose();
            let type = this.milkTypeMap.get(idx);
            if (type == 4) {
                this.milkTypeMap.add(idx, 0);
                this.waterBoom(idx);
            } else {
                let up = clientCore.BoneMgr.ins.play(`unpack/waterDropGame/turn${type}${type + 1}.sk`, 0, false, this.boxView);
                let posX = idx % 6;
                let posY = (idx - posX) / 6;
                up.pos(posX * 117 + 58, posY * 121 + 56);
                if (type == 1) up.scaleX = up.scaleY = 0.7;
                else if (type == 2) up.scaleX = up.scaleY = 0.9;
                this.milkMap.add(idx, up);
                up.once(Laya.Event.COMPLETE, this, () => {
                    up = this.milkMap.remove(idx);
                    if (up) {
                        up.dispose();
                        let newMilk = clientCore.BoneMgr.ins.play(`unpack/waterDropGame/milk${type + 1}.sk`, 0, true, this.boxView);
                        newMilk.pos(posX * 117 + 58, posY * 121 + 56);
                        if (type == 1) newMilk.scaleX = newMilk.scaleY = 0.7;
                        else if (type == 2) newMilk.scaleX = newMilk.scaleY = 0.9;
                        this.milkMap.add(idx, newMilk);
                    }
                })
                this.milkTypeMap.add(idx, type + 1);
            }
        }

        /**触发水滴炸开 */
        private waterBoom(idx: number) {
            this._boomCnt++;
            if (this._boomCnt == 4) {
                this._waterCnt++;
                this.labCnt.text = "剩余：" + this._waterCnt;
                this._boomCnt = 0;
            }
            if (!this.dropArr) this.dropArr = [];
            if (!this.boxMove.visible) this.boxMove.visible = true;
            let posX = idx % 6;
            let posY = (idx - posX) / 6;
            let left = this.creatImg();
            left.scale(0.7, 0.7);
            left.anchorX = 0;
            left.anchorY = 0.5;
            left.skin = `waterDropGame/nai_di_a.png`;
            this.boxMove.addChild(left);
            left.pos(posX * 117 + 16, posY * 121 + 56);
            let right = this.creatImg();
            right.scale(0.7, 0.7);
            right.anchorX = 1;
            right.anchorY = 0.5;
            right.skin = `waterDropGame/nai_di_d.png`;
            this.boxMove.addChild(right);
            right.pos(posX * 117 + 100, posY * 121 + 56);
            let up = this.creatImg();
            up.scale(0.7, 0.7);
            up.anchorX = 0.5;
            up.anchorY = 0;
            up.skin = `waterDropGame/nai_di_w.png`;
            this.boxMove.addChild(up);
            up.pos(posX * 117 + 58, posY * 121 + 14);
            let down = this.creatImg();
            down.scale(0.7, 0.7);
            down.anchorX = 0.5;
            down.anchorY = 1;
            down.skin = `waterDropGame/nai_di_s.png`;
            this.boxMove.addChild(down);
            down.pos(posX * 117 + 58, posY * 121 + 100);
            //
            this.dropArr.push(left, up, down, right);
        }

        private async gameOver() {
            net.sendAndWait(new pb.cs_mini_game_collect_over({ id: this.gameId, score: this._score })).then((msg: pb.sc_mini_game_collect_over) => {
                if (msg.items.length == 0) {
                    alert.showFWords('游戏结束，本次未获得奖励~');
                    this.destroy();
                    return;
                }
                alert.showReward(msg.items, '', { callBack: { caller: this, funArr: [this.destroy] } });
            }).catch(() => {
                this.destroy();
            });
        }

        private onPause() {
            alert.showSmall('退出游戏将以当前关卡结算奖励,确认退出吗?', { callBack: { caller: this, funArr: [this.gameOver] } });
        }

        /**每帧刷新 */
        private onFrame() {
            if (this.dropArr && this.dropArr.length > 0) {
                for (let i: number = 0; i < this.dropArr.length;) {
                    if (this.dropArr[i].skin == `waterDropGame/nai_di_s.png`) {
                        this.dropArr[i].y += this._speed;
                    } else if (this.dropArr[i].skin == `waterDropGame/nai_di_a.png`) {
                        this.dropArr[i].x -= this._speed;
                    } else if (this.dropArr[i].skin == `waterDropGame/nai_di_w.png`) {
                        this.dropArr[i].y -= this._speed;
                    } else if (this.dropArr[i].skin == `waterDropGame/nai_di_d.png`) {
                        this.dropArr[i].x += this._speed;
                    }
                    if (this.dropArr[i].x <= 0 || this.dropArr[i].x >= 702 || this.dropArr[i].y <= 0 || this.dropArr[i].y >= 726) {
                        let drop = this.dropArr.splice(i, 1)[0];
                        drop.removeSelf();
                        this.imgPool.push(drop);
                        continue;
                    }
                    let posX = Math.floor(this.dropArr[i].x / 117);
                    let posY = Math.floor(this.dropArr[i].y / 121);
                    let idx = posY * 6 + posX;
                    let dis = new Laya.Point(posX * 117 + 58, posY * 121 + 56).distance(this.dropArr[i].x, this.dropArr[i].y);
                    if (this.milkTypeMap.get(idx) != 0 && dis <= this._speed) {
                        this.trigerUp(idx);
                        let drop = this.dropArr.splice(i, 1)[0];
                        drop.removeSelf();
                        this.imgPool.push(drop);
                    } else {
                        i++;
                    }
                }
                if (this.dropArr.length == 0) {
                    if (this.milkMap.length == 0) {
                        this._score++;
                        this.labPoint.text = (this._score + 1) + "/" + this.target;
                        this._waterCnt++;
                        this.labCnt.text = "剩余：" + this._waterCnt;
                        alert.showFWords("下一关！你获得1滴水");
                        this.initWaterDrop();
                    }
                    if (this._waterCnt == 0) {
                        this.gameOver();
                        return;
                    }
                    this.boxMove.visible = false;
                }
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onPause);
            BC.addEvent(this, this.boxView, Laya.Event.CLICK, this, this.onViewClick);
            Laya.timer.loop(10, this, this.onFrame);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onFrame);
        }

        destroy() {
            if (this.dropArr) {
                for (let i: number = 0; i < this.dropArr.length; i++) {
                    this.dropArr[i].destroy();
                }
            }
            this.dropArr = null;
            for (let i: number = 0; i < this.milkMap.getValues().length; i++) {
                this.milkMap.getValues()[i].dispose();
            }
            this.milkTypeMap.clear();
            this.milkMap.clear();
            if (this.imgPool)
                for (let i: number = 0; i < this.imgPool.length; i++) {
                    this.imgPool[i].destroy();
                }
            this.imgPool = null;
            super.destroy();
        }
    }
}