namespace springFaerie {
    /**
     * 古灵仙的春日
     * 2022.2.24
     * springFaerie.SpringFaerieModule
     */
    export class SpringFaerieModule extends ui.springFaerie.SpringFaerieModuleUI {

        private model: SpringFaerieModel;
        private control: SpringFaerieControl;
        /**制作面板 */
        private makePanel: TipPanel;
        /**奖励面板 */
        private rewardPanel: RewardPanel;
        /**分享面板 */
        private sharePanel: SpringFaerieSharePanel;
        private npc1: clientCore.Bone;
        private npc2: clientCore.Bone;
        private npc3: clientCore.Bone;
        private sun: clientCore.Bone;

        init() {
            this.sign = clientCore.CManager.regSign(new SpringFaerieModel(), new SpringFaerieControl());
            this.model = clientCore.CManager.getModel(this.sign) as SpringFaerieModel;
            this.control = clientCore.CManager.getControl(this.sign) as SpringFaerieControl;
            this.addPreLoad(this.control.getEventInfo());
            this.addPreLoad(xls.load(xls.magicsnowglobe));
            this.addPreLoad(xls.load(xls.collocationActivity));
            this.addPreLoad(res.load(`res/animate/springFaerie/aidewen.png`));
            this.addPreLoad(res.load(`res/animate/springFaerie/andelu.png`));
            this.addPreLoad(res.load(`res/animate/springFaerie/daiweiwei.png`));
            this.addPreLoad(res.load(`res/animate/springFaerie/sunshine.png`));
            clientCore.UIManager.setMoneyIds([9900310 , 730011]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2022年 3月18日活动', '【主活动】', '打开主活动面板');
        }

        onPreloadOver() {
            this.scoreChange();
            this.setAni();
        }

        private setAni(){
            this.npc2 = clientCore.BoneMgr.ins.play('res/animate/springFaerie/aidewen.sk', 0, true, this);
            this.npc1 = clientCore.BoneMgr.ins.play('res/animate/springFaerie/andelu.sk', 0, true, this);
            this.npc3 = clientCore.BoneMgr.ins.play('res/animate/springFaerie/daiweiwei.sk', 0, true, this);
            this.sun = clientCore.BoneMgr.ins.play('res/animate/springFaerie/sunshine.sk', 0, true, this);
            this.npc1.scaleX = this.npc2.scaleX  =-1;
            this.npc1.pos(258 , 550);
            this.npc2.pos(760 , 670);
            this.npc3.pos(1040 , 600);
            this.sun.pos(0 , 0);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1237);
        }

        /**打开奖励面板 */
        private async openRewardPanel() {
            if (!this.rewardPanel) {
                await res.load(`atlas/springFaerie/RewardPanel.atlas`, Laya.Loader.ATLAS);
                this.rewardPanel = new RewardPanel();
                // this.rewardPanel.show(this.model.scoreNum);
            }
            this.rewardPanel.show(this.model.scoreNum);
        }

        private async openSharePanel() {
            this.makePanel.hide();
            if (!this.sharePanel) {
                await res.load(`atlas/springFaerie/SpringFaerieSharePanel.atlas`, Laya.Loader.ATLAS);
                this.sharePanel = new SpringFaerieSharePanel(this.sign);
                // this.sharePanel.show();
            }
            this.sharePanel.show();
        }

        private async changePanel(i: number) {
            if (i == 0) {
                clientCore.Logger.sendLog('2022年 3月11日活动', '【主活动】古灵仙的春日', '点击收集可可');
                this.destroy();
                clientCore.ModuleManager.open("adventureMission.AdventureMissionModule");
            } else if (i == 1) {
                clientCore.Logger.sendLog('2022年 3月11日活动', '【主活动】古灵仙的春日', '点击求购');
                if (!this.makePanel) {
                    await res.load(`atlas/springFaerie/TipPanel.atlas`, Laya.Loader.ATLAS);
                    this.makePanel = new TipPanel();
                    this.makePanel.show();
                } else {
                    this.makePanel.show();
                }
            } else {
                clientCore.Logger.sendLog('2022年 3月11日活动', '【主活动】古灵仙的春日', '点击奖励');
                this.openRewardPanel();
            }
        }

        onShare() {
            this.model.shareTag == 1;
        }

        scoreChange() {
            this.coinNum.text = this.model.scoreNum + "";
        }

        addEventListeners() {
            BC.addEvent(this, this.homeBtn, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.tipBtn, Laya.Event.CLICK, this, this.showRule);
            for (let i: number = 0; i < 3; i++) {
                BC.addEvent(this, this["goBtn" + i], Laya.Event.CLICK, this, this.changePanel, [i]);
            }
            EventManager.on("CLOSE_SPRING", this, this.destroy);
            EventManager.on("SHOW_SHARE", this, this.openSharePanel);
            EventManager.on("SPRING_SHARE", this, this.onShare);
            EventManager.on("SCORE_CHANGE", this, this.scoreChange);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("CLOSE_SPRING", this, this.destroy);
            EventManager.off("SHOW_SHARE", this, this.openSharePanel);
            EventManager.off("SPRING_SHARE", this, this.onShare);
            EventManager.off("SCORE_CHANGE", this, this.scoreChange);
        }

        destroy() {
            clientCore.CManager.unRegSign(this.sign);
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.UIManager.releaseCoinBox();
            this.makePanel?.destroy();
            this.rewardPanel?.destroy();
            this.sharePanel?.clear();
            this.sharePanel?.destroy();
            this.npc1?.dispose();
            this.npc2?.dispose();
            this.npc3?.dispose();
            this.sun?.dispose();
            super.destroy();
        }
    }
}