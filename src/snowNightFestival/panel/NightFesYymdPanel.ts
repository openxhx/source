namespace snowNightFestival {
    export class NightFesYymdPanel extends ui.snowNightFestival.panel.NightFesYymdPanelUI {
        private _onePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;

        private engryCnt: number;
        constructor() {
            super();
            this._onePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
            this.addEventListeners();
            this.imgFemalePart.visible = this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMalePart.visible = this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            res.load("res/animate/snowNightFestival/tree.png");
        }

        public onShow() {
            this.sendData();
            this.setUI();
        }

        private setUI() {
            this.engryCnt = clientCore.ItemsInfo.getItemNum(9900115);
            this.labEngerCount.text = "" + this.engryCnt;
        }

        public hide() {
            this.visible = false;
        }

        /**统计项 */
        private sendData() {
            // clientCore.Logger.sendLog('2020年9月25日活动', '【付费】华彩月章', '打开歌影芳华面板');
        }

        /**试穿套装 */
        private trySuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2110196);
        }

        //#region 抽奖
        private _loading: boolean = false;
        private _lastTime: number = 0;
        private callClick(value: number) {
            if (this._loading) return; //等待中
            if (!clientCore.GuideMainManager.instance.isGuideAction) {
                if (this.engryCnt < 100 * value) {
                    alert.showFWords("白雪能量不足~");
                    return;
                }
            }
            if ((Date.now() - this._lastTime) > 500) {
                this._lastTime = Date.now();
                this._loading = true;
                this.mouseEnabled = false;
                clientCore.UIManager.refrehMoneyEvent(null);
                this.boxTree.visible = false;
                let aniName = clientCore.LocalInfo.sex == 1 ? "animationF" : "animationM";
                let ani = clientCore.BoneMgr.ins.play("res/animate/snowNightFestival/tree.sk", aniName, false, this.boxAni);
                ani.pos(327, 555);
                ani.once(Laya.Event.COMPLETE, this, () => {
                    ani.dispose();
                    this.boxTree.visible = true;
                    this.mouseEnabled = true;
                    clientCore.UIManager.releaseEvent();
                    net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 2, times: value })).then(async (data: pb.sc_common_activity_draw) => {
                        if (value == 1) {
                            this.getOne(data.item[0]);
                        }
                        else {
                            this.getAll(data.item);
                        }
                        this.setUI();
                        await util.RedPoint.reqRedPointRefresh(21301);
                        await util.RedPoint.reqRedPointRefresh(21302);
                        EventManager.event("NIGHTFES_REFRESH_TAB");
                    }).catch(() => {
                        this._loading = false;
                    })
                })
            }
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

        private getAll(treeInfos: pb.IdrawReward[]) {
            clientCore.DialogMgr.ins.open(this._tenPanel, false);
            this._tenPanel.showReward(treeInfos, this, this.waitOnePanelClose);
            this._loading = false;
        }

        private async waitOnePanelClose(rwdInfo: pb.GodTree) {
            return new Promise((ok) => {
                this._onePanel.on(Laya.Event.CLOSE, this, ok);
                this.getOne(rwdInfo);
            })
        }
        //#endregion

        /**奖励总览 */
        private async preReward() {
            clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", 2);
        }

        /**概率公示 */
        private onProbClick() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 10);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnProbability, Laya.Event.CLICK, this, this.onProbClick);
            BC.addEvent(this, this.btnDrawOne, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.btnDrawTen, Laya.Event.CLICK, this, this.callClick, [10]);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.preReward);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            this._tenPanel?.destroy();
            this._onePanel?.destroy();
            this._tenPanel = this._onePanel = null;
        }
    }
}