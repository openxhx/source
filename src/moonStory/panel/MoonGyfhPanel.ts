namespace moonStory {
    export class MoonGyfhPanel extends ui.moonStory.panel.MoonGyfhPanelUI {
        private _control: MoonStoryControl;
        private _onePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;
        private tagInfo: any[] = [{ name: "tag_ymwj", open: true }];

        private _engryInfo: pb.sc_year_of_flower_love_stream_get_energy_cnt;
        constructor(sign: number) {
            super();
            this._control = clientCore.CManager.getControl(sign) as MoonStoryControl;
            this._onePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
            this.addEventListeners();
            this.img_ymwj1.visible = clientCore.LocalInfo.sex == 1;
            this.img_ymwj2.visible = clientCore.LocalInfo.sex == 2;
            this.listTag.renderHandler = new Laya.Handler(this, this.tagRender);
            // this.listTag.selectEnable = true;
            // this.listTag.selectHandler = new Laya.Handler(this, this.tagMouse);
            this.listTag.repeatY = this.tagInfo.length;
            this.listTag.array = this.tagInfo;
            res.load("res/animate/moonStory/tree.png");
        }

        public onShow() {
            this.sendData();
            this.setUI();
        }

        private async setUI() {
            this._engryInfo = await this._control.getEnergyInfo();
            this.labEngerCount.text = this._engryInfo.energyNum.toString();
        }

        private tagRender(item: ui.moonStory.render.MoonViewTagUI) {
            item.imgSelect.visible = item.dataSource.open;
            if (item.dataSource.name == "tag_ymwj") {
                item.imgRed.visible = false;
                item.imgName.skin = `moonStory/${item.dataSource.name}.png`;
            }
        }

        private tagMouse(index: number) {
            for (let i: number = 0; i < this.tagInfo.length; i++) {
                this.tagInfo[i].open = false;
            }
            this.tagInfo[index].open = true;
            this.listTag.refresh();
            this.sendData();
        }

        public hide() {
            this.visible = false;
        }

        /**统计项 */
        private sendData() {
            clientCore.Logger.sendLog('2020年9月25日活动', '【付费】华彩月章', '打开歌影芳华面板');
        }

        /**试穿套装 */
        private trySuit(suitId: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', suitId);
        }

        //#region 抽奖
        private _loading: boolean = false;
        private _lastTime: number = 0;
        private callClick(value: number) {
            if (this._loading) return; //等待中
            if (!clientCore.GuideMainManager.instance.isGuideAction) {
                if (this._engryInfo.energyNum < 50 * value) {
                    alert.showFWords("盈月能量不足~");
                    return;
                }
            }
            if ((Date.now() - this._lastTime) > 500) {
                this._lastTime = Date.now();
                this._loading = true;
                this.mouseEnabled = false;
                clientCore.UIManager.refrehMoneyEvent(null);
                let ani = clientCore.BoneMgr.ins.play("res/animate/moonStory/tree.sk", "animation", false, this.boxTree);
                ani.pos(460, 750);
                this.imgTree.visible = false;
                ani.once(Laya.Event.COMPLETE, this, () => {
                    ani.dispose();
                    this.mouseEnabled = true;
                    this.imgTree.visible = true;
                    clientCore.UIManager.releaseEvent();
                    net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 2, times: value })).then(async (data: pb.sc_common_activity_draw) => {
                        if (value == 1) {
                            this.getOne(data.item[0]);
                        }
                        else {
                            this.getAll(data.item);
                        }
                        this.setUI();
                        this.refreshTab();
                        await util.RedPoint.reqRedPointRefresh(16904);
                        await util.RedPoint.reqRedPointRefresh(16906);
                        EventManager.event("MOONSTORY_REFRESH_TAB");
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
            clientCore.ModuleManager.open('probability.ProbabilityModule', 10)
        }

        /**更新tab状态 */
        private refreshTab() {
            this.listTag.refresh();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTryYmwj, Laya.Event.CLICK, this, this.trySuit, [2110054]);
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
            this._tenPanel = this._onePanel = this._control = null;
        }
    }
}