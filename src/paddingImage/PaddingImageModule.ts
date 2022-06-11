namespace paddingImage {
    /**
     * 蘑菇总动员
     * paddingImage.PaddingImageModule
     */
    export class PaddingImageModule extends ui.paddingImage.PaddingImageModuleUI {
        private rulePanel: PaddingRulePanel;
        private imgInfo: number[];
        private rewardInfo: number;
        private curImage: number;
        private curTarget: number;
        private targetCnt: number;
        private maxCnt: number;
        private itemId: number = 9900331;
        private suit: number = 2110651;
        private changePos: number;
        private changeTarget: number;
        init() {
            this.addPreLoad(xls.load(xls.activityShape));
            this.addPreLoad(this.getEventInfo());
            this.maxCnt = 15;
            this.lisCur.mouseHandler = new Laya.Handler(this, this.onSelect);
            this.lisCur.mouseEnabled = false;

            this.listReward.mouseEnabled = true;
            this.listReward.renderHandler = new Laya.Handler(this, this.rewardRender);
            this.listReward.mouseHandler = new Laya.Handler(this, this.rewardSelect);

            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = !this.imgSuit1.visible;
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2022年4月29日活动', '【主活动】蘑菇总动员', '打开蘑菇总动员面板');
            clientCore.UIManager.setMoneyIds([this.itemId]);
            clientCore.UIManager.showCoinBox();
            this.curImage = _.clamp(util.get1num(this.rewardInfo) + 1, 1, this.maxCnt);
            this.onImageChange();
        }

        private rewardSelect(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let reward: xls.pair = this.listReward.array[index];
                if (reward) {
                    clientCore.ToolTip.showTips(this.listReward.cells[index], { id: reward.v1 });
                }
            }
        }

        private rewardRender(item: ui.paddingImage.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            item.item.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
        }

        private onImageChange() {
            this.tip1.visible = false;
            this.tip2.visible = true;
            this.setTargetUI(this.curImage);
            this.setBoxUI();
            this.setPageBtn();
            this.setPlayBtn();
            this.setSuitInfo();
        }

        private setSuitInfo() {
            if (this.curImage <= 3) {
                this.imgName.skin = "paddingImage/ai_de_tuan_tuan_tao_zhuang.png";
                this.imgSuit1.skin = "unpack/paddingImage/5608.png";
                this.imgSuit2.skin = "unpack/paddingImage/5609.png";
                this.suit = 2110651;
            } else if (this.curImage <= 6){
                this.imgName.skin = "paddingImage/xiong_mao_tao_zhuang.png";
                this.imgSuit1.skin = "unpack/paddingImage/5684.png";
                this.imgSuit2.skin = "unpack/paddingImage/5685.png";
                this.suit = 2110652;
            } else if (this.curImage <= 9){
                this.imgName.skin = "paddingImage/suit3.png";
                this.imgSuit1.skin = "unpack/paddingImage/5626.png";
                this.imgSuit2.skin = "unpack/paddingImage/5627.png";
                this.suit = 2110659;
            }else if(this.curImage <= 12){
                this.imgName.skin = "paddingImage/suit4.png";
                this.imgSuit1.skin = "unpack/paddingImage/5780.png";
                this.imgSuit2.skin = "unpack/paddingImage/5781.png";
                this.suit = 2110660;
            }else{
                this.imgName.skin = "paddingImage/suit5.png";
                this.imgSuit1.skin = "unpack/paddingImage/5792.png";
                this.imgSuit2.skin = "unpack/paddingImage/5793.png";
                this.suit = 2110667;
            }
        }

        private setPageBtn() {
            if (this.curImage == this.maxCnt || util.getBit(this.rewardInfo, this.curImage) == 0) {
                this.btnNext.visible = false;
            } else {
                this.btnNext.visible = true;
            }
            this.btnLast.visible = this.curImage > 1;
        }

        private setTargetUI(type: number) {
            let config = xls.get(xls.activityShape).get(type);
            let have = config.shape;
            this.curTarget = 0;
            for (let i = 1; i <= 25; i++) {
                let item = this.listTarget.getCell(i - 1) as any as Laya.Image;
                if (have.includes(i)) {
                    this.curTarget = util.setBit(this.curTarget, i, 1);
                    item.skin = "paddingImage/box2.png";
                } else {
                    this.curTarget = util.setBit(this.curTarget, i, 0);
                    item.skin = "paddingImage/box1.png";
                }
            }
            this.targetCnt = have.length;
            this.labAll.text = "/" + have.length;
            this.labCur.text = "" + this.getProgress();
            this.labCur.color = this.getProgress() < this.targetCnt ? "#ff0000" : "#89e79d";
            let reward = clientCore.LocalInfo.sex == 1 ? config.reward_female : config.reward_male;
            this.listReward.repeatY = reward.length;
            this.listReward.array = reward;
        }

        private getProgress() {
            return util.get1num(this.imgInfo[this.curImage - 1] & this.curTarget);
        }

        private setPlayBtn() {
            this.imgGot.visible = util.getBit(this.rewardInfo, this.curImage) == 1;
            this.btnGet.disabled = this.imgGot.visible || this.getProgress() < this.targetCnt;
            this.aniGet.visible = !this.btnGet.disabled;
            this.boxChange.visible = false;
            this.btnChange.disabled = this.btnSet.disabled = this.getProgress() >= this.targetCnt;
        }

        private checkComplete() {
            this.labCur.text = "" + this.getProgress();
            if (this.getProgress() < this.targetCnt) return;
            this.labCur.color = "#89e79d";
            this.btnChange.disabled = this.btnSet.disabled = true;
            this.btnGet.disabled = false;
            this.aniGet.visible = true;
            this.aniGet.play(0, true);
            this.showFlashAni();
        }

        private showFlashAni() {
            for (let i = 1; i <= 25; i++) {
                let item = this.lisCur.getCell(i - 1) as any as ui.paddingImage.item.BoxItemUI;
                let posFlag = util.getBit(this.curTarget, i);
                if (posFlag == 1) {
                    item.aniComplete.visible = true;
                    item.aniComplete.once(Laya.Event.STOPPED, this, () => {
                        item.aniComplete.visible = false;
                    });
                    item.aniComplete.play(0, false);
                }
            }
        }

        private getEventInfo() {
            // this.imgInfo = [0, 0, 0];
            // this.rewardInfo = 0;
            // return Promise.resolve();
            return net.sendAndWait(new pb.cs_mushroom_mobilozation_info()).then((msg: pb.sc_mushroom_mobilozation_info) => {
                this.imgInfo = msg.pattern;
                this.rewardInfo = msg.reward;
            })
        }

        private actPadding() {
            if (!this.checkItemEnough(10)) return;
            this.setRandomPadding();
        }

        private setRandomPadding() {
            let curCnt = util.get1num(this.imgInfo[this.curImage - 1]);
            let random = Math.ceil(Math.random() * (25 - curCnt));
            let target = 0
            while (random > 0) {
                ++target;
                if (util.getBit(this.imgInfo[this.curImage - 1], target) == 0) {
                    --random;
                }
            }
            this.sendRandomResult(this.curImage, target);
        }

        private sendRandomResult(type: number, target: number) {
            net.sendAndWait(new pb.cs_mushroom_mobilozation_set({ type: type, index: target })).then((msg: pb.sc_mushroom_mobilozation_set) => {
                this.imgInfo[type - 1] = util.setBit(this.imgInfo[type - 1], target, 1);
                let item = this.lisCur.getCell(target - 1) as any as ui.paddingImage.item.BoxItemUI;
                let posFlag = util.getBit(this.curTarget, target);
                item.di.skin = posFlag == 1 ? "paddingImage/box2.png" : "paddingImage/box1.png";
                if (posFlag == 1) {
                    item.aniRight.visible = true;
                    item.aniRight.once(Laya.Event.STOPPED, this, () => {
                        item.aniRight.visible = false;
                    });
                    item.aniRight.play(0, false);
                }
                item.item.visible = true;
                this.checkComplete();
            })
            // this.imgInfo[type - 1] = util.setBit(this.imgInfo[type - 1], target, 1);
            // let item = this.lisCur.getCell(target - 1) as any as ui.paddingImage.item.BoxItemUI;
            // let posFlag = util.getBit(this.curTarget, target);
            // item.di.skin = posFlag == 1 ? "paddingImage/box2.png" : "paddingImage/box1.png";
            // item.item.visible = true;
            // this.checkComplete();
        }

        private setBoxUI() {
            let info = this.imgInfo[this.curImage - 1];
            for (let i: number = 0; i < 25; i++) {
                let item = this.lisCur.getCell(i) as any as ui.paddingImage.item.BoxItemUI;
                let posFlag = util.getBit(info, i + 1);
                if (posFlag == 1 && util.getBit(this.curTarget, i + 1) == 1) {
                    item.di.skin = "paddingImage/box2.png";
                } else {
                    item.di.skin = "paddingImage/box1.png";
                }
                item.item.visible = posFlag == 1;
            }
        }

        private checkItemEnough(cnt: number) {
            if (clientCore.ItemsInfo.getItemNum(this.itemId) < cnt) {
                alert.showFWords(clientCore.ItemsInfo.getItemName(this.itemId) + "不足~");
                return false;
            }
            return true;
        }

        private changeIamge(flag: number) {
            this.curImage = _.clamp(this.curImage + flag, 1, this.maxCnt);
            this.onImageChange();
        }

        private showRule() {
            clientCore.Logger.sendLog('2022年4月29日活动', '【主活动】蘑菇总动员', '打开活动说明面板');
            if (!this.rulePanel) this.rulePanel = new PaddingRulePanel();
            clientCore.DialogMgr.ins.open(this.rulePanel);
        }

        private showChange() {
            if (!this.checkItemEnough(5)) return;
            if(this.imgInfo[this.curImage - 1] == 0){
                alert.showFWords("当前没有可交换的格子~");
                return;
            }
            this.lisCur.mouseEnabled = true;
            this.boxChange.visible = true;
            this.btnChange.visible = false;
            this.btnSet.visible = false;
        }

        private hideChange() {
            this.lisCur.mouseEnabled = false;
            this.boxChange.visible = false;
            this.btnChange.visible = true;
            this.btnSet.visible = true;
            this.cancelChange();
        }

        private onSelect(e: Laya.Event, idx: number) {
            if (!this.boxChange.visible) return;
            if (e.type == Laya.Event.CLICK) {
                if (!this.changePos) {
                    if (util.getBit(this.imgInfo[this.curImage - 1], idx + 1) == 0) return;
                    this.changePos = idx + 1;
                }
                else if (!this.changeTarget) {
                    if (util.getBit(this.imgInfo[this.curImage - 1], idx + 1) == 1) return;
                    this.changeTarget = idx + 1;
                }
                else return;
                (this.lisCur.getCell(idx) as any as ui.paddingImage.item.BoxItemUI).select.visible = true;
            }
        }

        private sureChange() {
            if (!this.changePos || !this.changeTarget) {
                alert.showFWords("请先选择交换位置~");
                return;
            }
            this.boxChange.visible = false;
            net.sendAndWait(new pb.cs_mushroom_mobilozation_change({ type: this.curImage, del: this.changePos, add: this.changeTarget })).then((msg: pb.sc_mushroom_mobilozation_change) => {
                this.imgInfo[this.curImage - 1] = msg.pattern;
                (this.lisCur.getCell(this.changeTarget - 1) as any as ui.paddingImage.item.BoxItemUI).item.visible = true;
                (this.lisCur.getCell(this.changePos - 1) as any as ui.paddingImage.item.BoxItemUI).item.visible = false;
                (this.lisCur.getCell(this.changePos - 1) as any as ui.paddingImage.item.BoxItemUI).di.skin = "paddingImage/box1.png";
                if (util.getBit(this.curTarget, this.changeTarget) == 1) {
                    (this.lisCur.getCell(this.changeTarget - 1) as any as ui.paddingImage.item.BoxItemUI).di.skin = "paddingImage/box2.png";
                }
                this.checkComplete();
                this.hideChange();
            })
            // this.imgInfo[this.curImage - 1] = util.setBit(this.imgInfo[this.curImage - 1], this.changePos, 0);
            // this.imgInfo[this.curImage - 1] = util.setBit(this.imgInfo[this.curImage - 1], this.changeTarget, 1);
            // (this.lisCur.getCell(this.changeTarget - 1) as any as ui.paddingImage.item.BoxItemUI).item.visible = true;
            // (this.lisCur.getCell(this.changePos - 1) as any as ui.paddingImage.item.BoxItemUI).item.visible = false;
            // (this.lisCur.getCell(this.changePos - 1) as any as ui.paddingImage.item.BoxItemUI).di.skin = "paddingImage/box1.png";
            // if (util.getBit(this.curTarget, this.changeTarget) == 1) {
            //     (this.lisCur.getCell(this.changeTarget - 1) as any as ui.paddingImage.item.BoxItemUI).di.skin = "paddingImage/box2.png";
            // }
            // this.checkComplete();
            // this.cancelChange();
        }

        private cancelChange() {
            if (this.changePos > 0) {
                (this.lisCur.getCell(this.changePos - 1) as any as ui.paddingImage.item.BoxItemUI).select.visible = false;
                this.changePos = 0;
            }
            if (this.changeTarget > 0) {
                (this.lisCur.getCell(this.changeTarget - 1) as any as ui.paddingImage.item.BoxItemUI).select.visible = false;
                this.changeTarget = 0;
            }
        }

        private trySuit() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suit);
        }

        private getReward() {
            this.btnGet.disabled = true;
            net.sendAndWait(new pb.cs_mushroom_mobilozation_reward({ type: this.curImage })).then((msg: pb.sc_mushroom_mobilozation_reward) => {
                alert.showReward(msg.item);
                this.imgGot.visible = true;
                this.aniGet.visible = false;
                this.rewardInfo = util.setBit(this.rewardInfo, this.curImage, 1);
                if (this.curImage < this.maxCnt) {
                    this.tip1.visible = true;
                    this.tip2.visible = false;
                    this.btnNext.visible = true;
                    clientCore.Logger.sendLog('2022年4月29日活动', '【主活动】蘑菇总动员', '解锁下一个形状');
                }
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnLast, Laya.Event.CLICK, this, this.changeIamge, [-1]);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.changeIamge, [1]);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnSet, Laya.Event.CLICK, this, this.actPadding);
            BC.addEvent(this, this.btnChange, Laya.Event.CLICK, this, this.showChange);
            BC.addEvent(this, this.imgCancelChange, Laya.Event.CLICK, this, this.hideChange);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.sureChange);
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.cancelChange);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getReward);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.rulePanel?.destroy();
            this.rulePanel = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}