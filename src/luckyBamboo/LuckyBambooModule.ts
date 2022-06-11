namespace luckyBamboo {
    export class LuckyBambooModule extends ui.luckyBamboo.LuckyBambooModuleUI {
        private waiting: boolean;
        private _rewardPanel: LuckyBambooRewardPanel;
        private isGet: boolean;
        constructor() {
            super();
        }

        init(data: any) {
        }
        onPreloadOver() {
            
            this.img_qianwang.visible = this.isGet;
            this.img_lingqu.visible = !this.isGet;
        }

        /**点击立牌 */
        private onClickNotice() {
            if (this.img_lingqu.visible) this.getBamboo();
            else if (this.img_qianwang.visible) this.checkBamboo();
        }

        /**领取幸运竹 */
        public getBamboo() {
            if (this.waiting) return;
            this.waiting = true;
            net.sendAndWait(new pb.cs_luck_bamboo_get_seed()).then((msg: pb.sc_luck_bamboo_get_seed) => {
                alert.showReward(msg.items);
                this.img_qianwang.visible = true;
                this.img_lingqu.visible = false;
                this.waiting = false;
            }).catch(() => {
                this.waiting = false;
            });
        }

        /**查看幸运竹 */
        private checkBamboo() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("luckyBamboo.LuckyBambooInfoModule", parseInt(clientCore.MapInfo.mapData));
        }

        /**奖励面板 */
        private openRewardPanel() {
            if (!this._rewardPanel) this._rewardPanel = new LuckyBambooRewardPanel();
            clientCore.DialogMgr.ins.open(this._rewardPanel);
        }

        /**规则面板 */
        private openRulePanel() {
            if (!alert.ruleJson) {
                alert.ruleJson = res.get(pathConfig.getJsonPath("rule"));
            }
            let ruleArr = alert.ruleJson["" + 1111];
            this.showRulePanel(_.map(ruleArr, s => util.StringUtils.getColorText3(s as string, '#66472c', '#f25c58')),
                _.map(ruleArr, s => (s as string).replace(/{/g, '').replace(/}/g, '').replace(/<br>/g, "\n")));
        }

        private showRulePanel(innerHtmlArr: string[], oriTxtArr: string[]) {
            let panel = new LuckyBambooRulePanel();
            panel.show(innerHtmlArr, oriTxtArr);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.openRulePanel);
            BC.addEvent(this, this.btnInfo, Laya.Event.CLICK, this, this.onClickNotice);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.openRewardPanel);
            EventManager.on("LUCKYBAMBOO_RULE_OPEN", this, this.openRulePanel);
            EventManager.on("LUCKYBAMBOO_REWARD_OPEN", this, this.openRewardPanel);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("LUCKYBAMBOO_RULE_OPEN", this, this.openRulePanel);
            EventManager.off("LUCKYBAMBOO_REWARD_OPEN", this, this.openRewardPanel);
        }

        destroy() {
            super.destroy();
            this._rewardPanel?.destroy();
            this._rewardPanel = null;
        }
    }
}