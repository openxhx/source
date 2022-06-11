namespace dungeonsSearch {
    /**
     * 
     * dungeonsSearch.DungeonsSearchModule
     */
    export class DungeonsSearchModule extends ui.dungeonsSearch.DungeonsSearchModuleUI {
        private _model: DungeonsSearchModel;
        private _control: DungeonsSearchControl;

        private _gamePanel: DungeonsGamePanel;
        private _buyPanel: DungeonsBuyPanel;
        private _rewardPanel: DungeonsSearchRewardPanel;

        private _reward: xls.commonAward[];
        private _target: xls.commonAward;
        private _swap1: Swaper;
        private _swap2: Swaper;
        private _swap3: Swaper;
        private lengths: number[];
        private heights: number[] = [300, 440, 550, 660];
        private maxNumber: number;
        private maxLength: number;
        private curStep: number;

        private _t: time.GTime;
        private _buyAni: clientCore.Bone;
        private _fireAni: clientCore.Bone;
        constructor() {
            super();
            this._swap1 = new Swaper(this.box1);
            this._swap2 = new Swaper(this.box2);
            this._swap3 = new Swaper(this.box3);
        }

        init(data: any) {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new DungeonsSearchModel(), new DungeonsSearchControl());
            this._model = clientCore.CManager.getModel(this.sign) as DungeonsSearchModel;
            this._control = clientCore.CManager.getControl(this.sign) as DungeonsSearchControl;
            clientCore.UIManager.setMoneyIds([this._model.torchId, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.commonBuy));
            this.addPreLoad(this._model.getBuyMedal());
            this.addPreLoad(this.getEventInfo());
            this.addPreLoad(res.load("res/animate/dungeons/icon.png"));
            this.addPreLoad(res.load("res/animate/dungeons/icon2.png"));
            this._gamePanel = new DungeonsGamePanel(this.sign);
            this._buyPanel = new DungeonsBuyPanel(this.sign);
            this._rewardPanel = new DungeonsSearchRewardPanel();
        }

        async getEventInfo() {
            let msg = await this._control.getInfo();
            this._model.curStep = msg.steps;
            this._model.gameCnt = msg.gameCnt;
            this._model.buyCnt = msg.buyCnt;
            this._model.gainTime = msg.lastGainTime;
        }

        async onPreloadOver() {
            this._buyAni = clientCore.BoneMgr.ins.play("res/animate/dungeons/icon.sk", "animation", true, this.aniBuy);
            this._buyAni.pos(91, 180);
            this._fireAni = clientCore.BoneMgr.ins.play("res/animate/dungeons/icon2.sk", "animation", true, this.aniFire);
            this._fireAni.pos(79, 100);
            clientCore.Logger.sendLog('2020年7月24日活动', '【主活动】地下搜集之旅', '打开活动面板');
            this.setFireInfo();
            this.setProgressInfo();
            this.setHeadPos();
            this.checkBox();
            if (this._model._storyInfo == 0) {
                clientCore.MedalManager.setMedal([{ id: MedalConst.DUNGEONS_SEARCH_OPEN, value: 1 }]);
                this.onRecall(80153);
            }
        }

        /**设置进度信息 */
        private setProgressInfo() {
            this.lengths = [];
            let config = xls.get(xls.commonAward).getValues();
            this._reward = _.filter(config, (o) => { return o.type == 50 });
            this.maxNumber = this._reward[this._reward.length - 1].num.v2;
            this.maxLength = 0;
            for (let i: number = 0; i < 4; i++) {
                if (i == 0) {
                    this.lengths[i] = this._swap1._points1[0].x + this.box1.x - 180;
                } else if (i == 1) {
                    this.lengths[i] = -this._swap2._points1[0].x - this.box2.x + this._swap1._points2[2].x + this.box1.x;
                } else if (i == 2) {
                    this.lengths[i] = this._swap3._points1[0].x + this.box3.x - this._swap2._points2[2].x - this.box2.x;
                } else {
                    this.lengths[i] = -320 + this._swap3._points2[2].x + this.box3.x;
                }
                this.maxLength += this.lengths[i];
            }
            for (let j: number = 0; j < this._reward.length - 1; j++) {
                let num = this._reward[j].num.v2;
                let length = num / this.maxNumber * this.maxLength;
                let temp = 0;
                for (let m: number = 0; m < 4; m++) {
                    if (length < this.lengths[m] + temp) {
                        if (m == 0) {
                            this["reward" + (j + 1)].pos(180 + length + 102, this.heights[m]);
                        } else {
                            let flag = m % 2 == 1 ? 1 : -1;
                            this["reward" + (j + 1)].pos(this["_swap" + m]._points2[2].x + this["box" + m].x - flag * length + flag * temp - flag * 102, this.heights[m]);
                        }
                        break;
                    }
                    temp += this.lengths[m];
                }
            }
        }

        /**设置头像位置 */
        private setHeadPos() {
            let cur = this._model.curStep;
            cur = _.clamp(cur, 0, this.maxNumber);
            let length = cur / this.maxNumber * this.maxLength;
            let temp = 0;
            let targetX = 0;
            let targetY = 0;
            for (let m: number = 0; m < 4; m++) {
                if (length <= this.lengths[m] + temp) {
                    if (m == 0) {
                        targetX = 180 + length;
                    } else {
                        let flag = m % 2 == 1 ? 1 : -1;
                        targetX = this["_swap" + m]._points2[2].x + this["box" + m].x - flag * length + flag * temp;
                    }
                    targetY = this.heights[m];
                    break;
                }
                temp += this.lengths[m];
            }
            this.imgHead.pos(targetX, targetY);
            this.curStep = cur;
        }

        /**设置火堆状态 */
        private setFireInfo() {
            let disTime = clientCore.ServerManager.curServerTime - this._model.gainTime;
            let max = clientCore.FlowerPetInfo.petType < 1 ? 8 : 12;
            this.boxGet.visible = disTime >= 600;
            this.imgWait.visible = disTime < 600;
            this.boxWait.visible = disTime < max * 3600;
            this.labSaveCount.changeText("x" + _.clamp(Math.floor(disTime / 600), 0, max * 6));
            if (disTime < max * 3600 && !this._t) {
                this.onTime();
                this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
                this._t.start();
            }
        }

        /**秒级刷新 */
        private onTime() {
            let disTime = clientCore.ServerManager.curServerTime - this._model.gainTime;
            let max = clientCore.FlowerPetInfo.petType < 1 ? 8 : 12;
            this.boxGet.visible = disTime >= 600;
            this.imgWait.visible = disTime < 600;
            this.labSaveCount.changeText("x" + Math.floor(disTime / 600));
            if (disTime < max * 3600) {
                let waitTime = 600 - (clientCore.ServerManager.curServerTime - this._model.gainTime) % 600;
                this.labWaitTime.changeText(`${util.StringUtils.getDateStr2(waitTime, '{min}:{sec}')}`);
            } else {
                this._t.dispose();
                this._t = null;
                this.boxWait.visible = false;
            }
        }

        /**头像移动 */
        private async moveHead() {
            if (this.imgHead.x == 320 && this.imgHead.y == 660) {
                return;
            }
            if (this.curStep == this._model.curStep) return;
            if (this.curStep >= this.maxNumber) return;
            let cur = this._model.curStep;
            cur = _.clamp(cur, 0, this.maxNumber);
            if (cur >= this._target.num.v2) {
                cur = this._target.num.v2;
            }
            this.curStep = cur;
            let length = cur / this.maxNumber * this.maxLength;
            let temp = 0;
            let targetX = 0;
            let targetY = 0;
            for (let m: number = 0; m < 4; m++) {
                if (length <= this.lengths[m] + temp) {
                    if (m == 0) {
                        targetX = 180 + length;
                    } else {
                        let flag = m % 2 == 1 ? 1 : -1;
                        targetX = this["_swap" + m]._points2[2].x + this["box" + m].x - flag * length + flag * temp;
                    }
                    targetY = this.heights[m];
                    break;
                }
                temp += this.lengths[m];
            }
            let targetLevel = this.heights.indexOf(targetY);
            let curLevel = this.heights.indexOf(this.imgHead.y);
            this.mouseEnabled = false;
            clientCore.UIManager.refrehMoneyEvent(null);
            if (targetLevel > curLevel) {
                for (; curLevel < targetLevel; curLevel++) {
                    Laya.Tween.to(this.imgHead, { x: this["_swap" + (curLevel + 1)]._points1[0].x + this["box" + (curLevel + 1)].x }, 500, null, new Laya.Handler(this, async () => {
                        await this["_swap" + (curLevel + 1)].startAndWait(this.imgHead, 300);
                        this.imgHead.y = this.heights[curLevel];
                    }))
                    await util.TimeUtil.awaitTime(1100);
                }
                Laya.Tween.to(this.imgHead, { x: targetX }, 500, null, new Laya.Handler(this, () => {
                    this.checkBox();
                    this.mouseEnabled = true;
                    clientCore.UIManager.releaseEvent();
                }))
            } else {
                Laya.Tween.to(this.imgHead, { x: targetX }, 500, null, new Laya.Handler(this, () => {
                    this.checkBox();
                    this.mouseEnabled = true;
                    clientCore.UIManager.releaseEvent();
                }))
            }
        }

        /**检查宝箱状态 */
        private checkBox() {
            if (this._target && this.curStep == this._target.num.v2) {
                let reward = clientCore.LocalInfo.sex == 1 ? this._target.femaleAward : this._target.maleAward;
                alert.showReward(clientCore.GoodsInfo.createArray(reward), "", {
                    callBack: {
                        caller: this, funArr: [() => {
                            if (this.curStep < this._model.curStep) {
                                this.moveHead();
                            }
                            if (this.curStep == this.maxNumber) {
                                this.onRecall(80154);
                            }
                        }]
                    }
                });
            }
            this._target = null;
            let showTip: boolean = false;
            for (let i: number = 0; i < this._reward.length; i++) {
                if (this._reward[i].num.v2 <= this.curStep) {
                    this["reward" + (i + 1)].imgTip.visible = false;
                    this["reward" + (i + 1)].imgBox.skin = "dungeonsSearch/宝箱已打开.png";
                } else {
                    if (!showTip) this._target = this._reward[i];
                    this["reward" + (i + 1)].imgTip.visible = !showTip;
                    let dis = this._reward[i].num.v2 - this._model.curStep;
                    if (dis < 0) dis = 0;
                    this["reward" + (i + 1)].labTip.text = `还差${dis}步`;
                    this["reward" + (i + 1)].imgBox.skin = "dungeonsSearch/宝箱不能获得.png";
                    showTip = true;
                }
            }
        }

        /**播放剧情 */
        private onRecall(id: number) {
            clientCore.AnimateMovieManager.showAnimateMovie(id, null, null);
        }

        /**直接购买道具 */
        private toBuyItem() {
            this._buyPanel.showInfo();
            clientCore.DialogMgr.ins.open(this._buyPanel);
        }

        /**帮助说明 */
        private showHelp() {
            alert.showRuleByID(1042);
        }

        /**领取火把 */
        private async getTorch() {
            clientCore.Logger.sendLog('2020年7月24日活动', '【主活动】地下搜集之旅', '点击领取火堆挂机奖励');
            let msg = await this._control.getTorch();
            alert.showReward(msg.items);
            this._model.gainTime = msg.lastGainTime;
            this.setFireInfo();
        }

        /**前进 */
        private async go() {
            if (clientCore.ItemsInfo.getItemNum(this._model.torchId) <= 0) return;
            let msg = await this._control.consumeTorch();
            alert.showFWords(`前进${msg.steps - this._model.curStep}步`);
            this._model.curStep = msg.steps;
            this.moveHead();
        }

        /**打开小游戏面板 */
        private openGamePanel() {
            clientCore.Logger.sendLog('2020年7月24日活动', '【主活动】地下搜集之旅', '点击小游戏入口');
            this._gamePanel.showInfo();
            clientCore.DialogMgr.ins.open(this._gamePanel);
        }

        /**试穿套装 */
        private previewSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this._model.suitId);
        }

        /**奖励详情 */
        private showReward(index: number) {
            let config = this._reward[index - 1];
            let reward = clientCore.LocalInfo.sex == 1 ? config.femaleAward : config.maleAward;
            this._rewardPanel.showInfo(reward);
            clientCore.DialogMgr.ins.open(this._rewardPanel);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showHelp);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.toBuyItem);
            BC.addEvent(this, this.btnStory, Laya.Event.CLICK, this, this.onRecall, [80153]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getTorch);
            BC.addEvent(this, this.imgHead, Laya.Event.CLICK, this, this.go);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.openGamePanel);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.previewSuit);
            for (let i: number = 1; i <= 6; i++) {
                BC.addEvent(this, this["reward" + i], Laya.Event.CLICK, this, this.showReward, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this._t?.dispose();
            this._gamePanel?.destroy();
            this._rewardPanel?.destroy();
            this._buyPanel?.destroy();
            this._buyAni?.dispose();
            this._fireAni?.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._buyAni = this._fireAni = this._gamePanel = this._rewardPanel = this._buyPanel = this._t = this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
        }
    }

    class Swaper {
        private _complete: Function;
        private _dis: Laya.Sprite;
        private _startTime: number;
        private _totalTime: number;
        public _points1: Laya.Point[];
        public _points2: Laya.Point[];
        private _diffSp: Laya.Sprite;
        private _step: number;

        constructor(curveSp: Laya.Sprite) {
            this._diffSp = curveSp;
            this._diffSp.visible = false;
            this._points1 = [];
            this._points2 = [];
            let line1 = curveSp.graphics.cmds[0].points.slice();
            let line2 = curveSp.graphics.cmds[1].points.slice();
            for (let i = 0; i < line1.length; i += 2) {
                this._points1.push(new Laya.Point(line1[i], line1[i + 1]));
            }
            for (let i = 0; i < line2.length; i += 2) {
                this._points2.push(new Laya.Point(line2[i], line2[i + 1]));
            }
        }

        startAndWait(dis: Laya.Sprite, totalTime: number) {
            this._dis = dis;
            this._startTime = Date.now();
            this._totalTime = totalTime;
            this._step = 1;
            Laya.timer.frameLoop(1, this, this.onFrame);
            return new Promise((ok) => {
                this._complete = ok;
            })
        }

        private onFrame() {
            let t = _.clamp((Laya.timer.currTimer - this._startTime) / this._totalTime, 0, 1);
            if (this._step == 1) {
                this.setDisply(t, this._dis, this._points1);
            } else {
                this.setDisply(t, this._dis, this._points2);
            }
            if (t >= 1) {
                if (this._step == 1) {
                    Laya.timer.clear(this, this.onFrame);
                    this._step++;
                    this._startTime = Date.now();
                    Laya.timer.frameLoop(1, this, this.onFrame);
                } else {
                    this._complete?.call(this);
                    Laya.timer.clear(this, this.onFrame);
                }
            }
        }

        private setDisply(t: number, dis: Laya.Sprite, pointArr: Laya.Point[]) {
            var p1 = pointArr[0];
            var p2 = pointArr[1];
            var p3 = pointArr[2];
            var lineX: number = Math.pow((1 - t), 2) * p1.x + 2 * t * (1 - t) * p2.x + Math.pow(t, 2) * p3.x;
            var lineY: number = Math.pow((1 - t), 2) * p1.y + 2 * t * (1 - t) * p2.y + Math.pow(t, 2) * p3.y;
            dis.pos(lineX + this._diffSp.x, lineY + this._diffSp.y);
        }

        destory() {
            Laya.timer.clear(this, this.onFrame);
            this._points1 = this._points2 = [];
            this._dis = null;
        }
    }
}