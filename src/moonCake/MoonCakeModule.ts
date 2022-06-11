namespace moonCake {
    export class MoonCakeModule extends ui.moonCake.MoonCakeModuleUI {
        /**全服消耗的数量 */
        private globalNum: number;
        /**全服奖励是否领取 */
        private rewardFlag: number;
        /**小游戏已玩次数 */
        private gameCount: number;
        /**当前热度 */
        private hotValue: number;
        /**套装 */
        private suits: number[] = [2110156, 2110157];
        //子面板
        /**全服奖励 */
        private globalReward: GlobalRewardPanel;
        /**获取果子 */
        private getFruits: GetFruitsPanel;
        /**制作月饼 */
        private makeCake: CakeMakePanel;
        //抽奖结果
        private _onePanel: OneRewardPanel;
        private _resultPanel: DrawResultPanel;
        constructor() {
            super();
        }

        init(data: any) {
            clientCore.UIManager.setMoneyIds([9900077, 9900078, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.img_hxxl_1.visible = this.img_tmcy_1.visible = clientCore.LocalInfo.sex == 1;
            this.img_hxxl_2.visible = this.img_tmcy_2.visible = clientCore.LocalInfo.sex == 2;
            this.addPreLoad(xls.load(xls.godTree));
            this._onePanel = new OneRewardPanel();
            this._resultPanel = new DrawResultPanel();
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2020年9月30日活动', '【活跃活动】香甜伴月来', '打开游戏面板');
            this.getEventInfo();
        }

        private getEventInfo() {
            net.sendAndWait(new pb.cs_sweet_with_moon_panel()).then((msg: pb.sc_sweet_with_moon_panel) => {
                this.globalNum = msg.costNum;
                this.rewardFlag = msg.rewardFlag;
                this.gameCount = msg.gameTimes;
                this.hotValue = msg.hot;
                this.setUI();
            })
        }

        private setUI() {
            let max = 500000;
            if (channel.ChannelControl.ins.isOfficial) max = 300000;
            this.globalNum = _.min([max, this.globalNum]);
            this.imgMask.height = Math.floor(this.globalNum / max * 471) + 1;
            this.labProgress.text = Math.floor(this.globalNum / max * 100) + "%";
        }

        /**打开获取果子的界面 */
        private openGetFruits() {
            if (!this.getFruits) this.getFruits = new GetFruitsPanel();
            this.getFruits.show(this.hotValue, this.gameCount);
        }

        /**打开帮助说明 */
        private openRule() {
            alert.showRuleByID(1077);
        }

        /**打开概率预览 */
        private openProb() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 12);
        }

        /**打开月饼制作界面 */
        private openCakeMake() {
            if (!this.makeCake) this.makeCake = new CakeMakePanel();
            this.makeCake.show();
        }

        //#region 抽奖
        private _loading: boolean = false;
        private callClick(num: number) {
            if (this._loading) return; //等待中
            let itemNum = clientCore.ItemsInfo.getItemNum(9900078);
            if (itemNum < num) {
                alert.alertQuickBuy(9900078, num - itemNum, true);
                return;
            }
            this._loading = true;
            this.getAll();
            net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 202, times: num })).then((data: pb.sc_common_activity_draw) => {
                this._resultPanel.showRewardList(data.item);
            }).catch(() => {
                this._loading = false;
            })
        }

        private async getOne(rwdInfo: pb.IdrawReward) {
            let itemInfo = parseReward(rwdInfo);
            if (xls.get(xls.itemCloth).has(itemInfo.reward.id) && !itemInfo.decomp) {
                await alert.showDrawClothReward(itemInfo.reward.id);
            }
            else {
                clientCore.DialogMgr.ins.open(this._onePanel, false);
                this._onePanel.showReward(rwdInfo);
            }
            this._loading = false;
        }

        private getAll() {
            clientCore.DialogMgr.ins.open(this._resultPanel, false);
            this._resultPanel.show(this, this.waitOnePanelClose);
            this._loading = false;
        }

        private async waitOnePanelClose(rwdInfo: pb.GodTree) {
            return new Promise((ok) => {
                this._onePanel.on(Laya.Event.CLOSE, this, ok);
                this.getOne(rwdInfo)
            })
        }
        //#endregion

        /**试穿套装 */
        private trySuit(idx: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suits[idx]);
        }

        /**打开全服奖励 */
        private openGlobalReward() {
            if (!this.globalReward) this.globalReward = new GlobalRewardPanel(this.rewardFlag);
            this.globalReward.show();
        }

        /**奖励总览 */
        private async preReward() {
            // clientCore.Logger.sendLog('2020年9月25日活动', '【付费】华彩月章', '点击奖励总览按钮');
            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", 202);
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([9900077, 9900078, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
                clientCore.UIManager.showCoinBox();
            })
        }

        /**全服奖励返回 */
        private onGlobalReward() {
            this.rewardFlag = 1;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.openGetFruits);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.openRule);
            BC.addEvent(this, this.btnProb, Laya.Event.CLICK, this, this.openProb);
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.openCakeMake);
            BC.addEvent(this, this.btnPrereward, Laya.Event.CLICK, this, this.preReward);
            BC.addEvent(this, this.btnDrawOne, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.btnDrawTen, Laya.Event.CLICK, this, this.callClick, [10]);
            BC.addEvent(this, this.btnTryHxxl, Laya.Event.CLICK, this, this.trySuit, [1]);
            BC.addEvent(this, this.btnTryTmcy, Laya.Event.CLICK, this, this.trySuit, [0]);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.openGlobalReward);
            EventManager.on("MOONCAKE_SHOW_GETFRUITS", this, this.openGetFruits);
            EventManager.on("MOONCAKE_GLOBAL_REWARD_BACK", this, this.onGlobalReward);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("MOONCAKE_SHOW_GETFRUITS", this, this.openGetFruits);
            EventManager.off("MOONCAKE_GLOBAL_REWARD_BACK", this, this.onGlobalReward);
        }

        destroy() {
            super.destroy();
            this._onePanel.destroy();
            this._resultPanel.destroy();
            this._onePanel = this._resultPanel = null;
            clientCore.UIManager.releaseCoinBox();
        }
    }
}