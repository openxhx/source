namespace midAutumnGift {
    import HeadMgr = clientCore.UserHeadManager;
    /**
     * 中秋三仙女赠送
     * midAutumnGift.MidAutumnGiftModule
     * 2021.9.17
     */
    export class MidAutumnGiftModule extends ui.midAutumnGift.MidAutumnGiftModuleUI {
        private _model: MidAutumnGiftModel;
        private _control: MidAutumnGiftControl;

        private blossomPanel: PetBlossomPanel;
        private rewardDetail: RewardDetailPanel;
        private findPanel: FindFairyPanel;

        private panelAni: clientCore.Bone;
        init() {
            this._model = MidAutumnGiftModel.instance;
            this._control = MidAutumnGiftControl.instance;
            this.addPreLoad(this._control.GetEventInfo());
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年9月17日活动', '【主活动】中秋三仙女', '打开主活动面板');
            this.panelAni = clientCore.BoneMgr.ins.play('res/animate/midAutumnGift/home.sk', 0, true, this);
            this.panelAni.pos(667, 375);
            this.checkPet();
            this.setCakeInfo();
            this.setFairyInfo();
        }

        /**
         * 初始化月饼
         */
        private setCakeInfo() {
            for (let i: number = 1; i <= 6; i++) {
                let item: ui.midAutumnGift.item.MoonCakeItemUI = this['cake' + i];
                let id = 9900226 + i;
                let has = clientCore.ItemsInfo.getItemNum(id);
                item.labCnt.text = has + '/50';
                item.imgGray.skin = `midAutumnGift/${i}gray.png`;
                item.imgCake.skin = `midAutumnGift/${i}.png`;
                let ratio: number = has / 50;
                if (ratio > 1) ratio = 1;
                let angle = ratio * 360 - 90;
                item.imgMask.graphics.clear(true);
                if (angle == -90) {
                    item.imgMask.graphics.drawLine(0, 0, 0, -1, "#ffffff");
                } else {
                    item.imgMask.graphics.drawPie(0, 0, 60, -90, angle, "#ffffff");
                }
                if (util.getBit(this._model.isGetReward, i) == 1) {
                    this.updataCake(i);
                }
            }
        }

        private updataCake(idx: number) {
            let item: ui.midAutumnGift.item.MoonCakeItemUI = this['cake' + idx];
            item.imgGray.visible = false;
            item.imgMask.graphics.clear(true);
            item.imgMask.graphics.drawPie(0, 0, 60, -90, 270, "#ffffff");
            let has = clientCore.ItemsInfo.getItemNum(9900226 + idx);
            item.labCnt.text = has + '';
        }

        /**
         * 初始化仙女状态
         */
        private setFairyInfo() {
            let curTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            let openTime = util.TimeUtil.formatTimeStrToSec('2021-9-19 00:00:00');
            for (let i: number = 0; i < 3; i++) {
                if (i == 1)//20号改到24号
                    this['btnFind' + (i + 1)].visible = curTime == openTime + 5 * 86400;
                else
                    this['btnFind' + (i + 1)].visible = curTime == openTime + i * 86400;
            }
        }

        /**
         * 检查花宝状态
         */
        private checkPet() {
            let hasSmall = clientCore.ItemsInfo.checkHaveItem(4500004);
            let hasBig = clientCore.ItemsInfo.checkHaveItem(4500005);
            if (!hasSmall || util.getBit(this._model.isGetReward, 7) == 0) {
                this.btnPet.skin = 'midAutumnGift/ling_qu.png';
            } else if (!hasBig) {
                this.btnPet.skin = 'midAutumnGift/zhan_fang.png';
            } else {
                this.btnPet.visible = false;
            }
        }

        /**
         * 点击花宝按钮
         */
        private onPetButton() {
            let hasSmall = clientCore.ItemsInfo.checkHaveItem(4500004);
            let hasBig = clientCore.ItemsInfo.checkHaveItem(4500005);
            let hasIcon = clientCore.UserHeadManager.instance.getOneInfoById(2500053)?.have;
            if (!hasSmall || !hasIcon) {
                if (util.get1num(this._model.isGetReward) < 6) {//还没集齐月饼
                    alert.showSmall('请先完成收集月饼并领取对应奖励~');
                    return;
                }
                this.getReward(7);
            }
            else if (!hasBig) {
                this.openPetBlossom();
            } else {
                this.btnPet.visible = false;
            }
        }

        /**
         * 打开绽放花宝面板
         */
        private openPetBlossom() {
            if (!this.blossomPanel) this.blossomPanel = new PetBlossomPanel();
            BC.addOnceEvent(this, this.blossomPanel, Laya.Event.CLOSE, this, () => {
                this.btnPet.visible = !clientCore.ItemsInfo.checkHaveItem(4500005);
            })
            clientCore.DialogMgr.ins.open(this.blossomPanel);
        }

        /**
         * 打开奖励预览面板
         */
        private openRewardPanel() {
            clientCore.Logger.sendLog('2021年9月17日活动', '【主活动】中秋三仙女', '点击奖励一览按钮');
            if (!this.rewardDetail) this.rewardDetail = new RewardDetailPanel();
            clientCore.DialogMgr.ins.open(this.rewardDetail);
        }

        /**
         * 打开寻找仙女面板
         */
        private openFindFairy(idx: number) {
            let name = idx == 1 ? '露莎' : idx == 2 ? '露娜' : '露露';
            clientCore.Logger.sendLog('2021年9月17日活动', '【主活动】中秋三仙女', `点击${name}的寻找按钮`);
            if (!this.findPanel) this.findPanel = new FindFairyPanel();
            this.findPanel.Show(idx);
        }

        /**
         * 点击月饼
         */
        private onCakeClick(idx: number) {
            let isGet = util.getBit(this._model.isGetReward, idx) == 1;
            let id = 9900226 + idx;
            let has = clientCore.ItemsInfo.getItemNum(id);
            if (has < 50 || isGet) {
                if (this._model.gameTimes >= 20) {
                    alert.showFWords('游戏次数不足，明天再来~');
                    return;
                }
                alert.showSmall(`是否前去收集月饼碎片?\n剩余(${20 - this._model.gameTimes}/20)`, {
                    callBack: {
                        caller: this, funArr: [() => {
                            this.destroy();
                            clientCore.Logger.sendLog('2021年9月17日活动', '【主活动】中秋三仙女', '点击月饼进入跳一跳游戏');
                            clientCore.ModuleManager.open('simpleJumpGame.JumpGameModule');
                        }]
                    }
                });
            } else {
                clientCore.Logger.sendLog('2021年9月17日活动', '【主活动】中秋三仙女', '点击月饼领取奖励');
                this.getReward(idx);
            }
        }

        /**
         * 领取奖励
         */
        private async getReward(idx: number) {
            let isGet = util.getBit(this._model.isGetReward, idx) == 1;
            if (isGet) {
                alert.showFWords('该奖励已领取');
            } else {
                let btn = idx < 7 ? this['cake' + idx] : this.btnPet;
                btn.mouseEnabled = false;
                let msg = await this._control.GetReward(idx);
                btn.mouseEnabled = true;
                if (!msg) return;
                alert.showReward(msg.item);
                if (idx == 7) this.checkPet();
                else this.updataCake(idx);
                this._model.isGetReward = util.setBit(this._model.isGetReward, idx, 1);
                HeadMgr.instance.refreshAllHeadInfo();
            }
        }

        private showRule() {
            alert.showRuleByID(1208);
        }

        private goSend() {
            this.destroy();
            clientCore.ModuleManager.open("friends.FriendMainModule");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.openRewardPanel);
            BC.addEvent(this, this.btnPet, Laya.Event.CLICK, this, this.onPetButton);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnSend, Laya.Event.CLICK, this, this.goSend);
            for (let i = 1; i <= 6; i++) {
                BC.addEvent(this, this['cake' + i], Laya.Event.CLICK, this, this.onCakeClick, [i]);
            }
            for (let i = 1; i <= 3; i++) {
                BC.addEvent(this, this['btnFind' + i], Laya.Event.CLICK, this, this.openFindFairy, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            for (let i: number = 1; i <= 6; i++) {
                let item: ui.midAutumnGift.item.MoonCakeItemUI = this['cake' + i];
                item.imgMask.graphics.clear(true);
            }
            this.panelAni?.dispose();
            this.findPanel?.destroy();
            this.blossomPanel?.destroy();
            this.rewardDetail?.destroy();
            this.panelAni = this.findPanel = this.blossomPanel = this.rewardDetail = null;
            super.destroy();
        }
    }
}