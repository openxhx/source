namespace luckyBamboo {
    export class LuckyBambooLevelPanel extends ui.luckyBamboo.panel.LuckyBambooLevelPanelUI {
        private _model: LuckyBambooModel;
        private _control: LuckyBambooControl;
        private _waiting: boolean;
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as LuckyBambooModel;
            this._control = clientCore.CManager.getControl(sign) as LuckyBambooControl;
            this.init();
        }

        init() {
            this.sideClose = true;
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.selectHandler = new Laya.Handler(this, this.listSelect);
            let max = this._model.growInfo.get(this._model.maxLevel).cost;
            for (let i: number = 1; i <= this._model.maxLevel; i++) {
                let cost = this._model.growInfo.get(i).cost;
                this["imgLine" + i].bottom = cost / max * 389 - 2;
            }
        }

        show() {
            clientCore.Logger.sendLog('2020年12月4日活动', '【主活动】幸运竹', '打开幸运竹成长进度面板');
            this.updataUI();
            clientCore.DialogMgr.ins.open(this, false);
        }

        private updataUI() {
            this.labLv.value = "" + (this._model.curLevel + 1);
            this.labCoinCount.text = "" + clientCore.ItemsInfo.getItemNum(this._model.coinId);
            let max = this._model.growInfo.get(this._model.maxLevel).cost;
            this.imgMask.height = this._model.allExp / max * 390;
            this.boxLv.y = this["imgLine" + (this._model.curLevel + 1)].y + this.boxKedu.y;
            this.boxReward.y = this.boxLv.y - 20;
            let nextReward = this._model.growInfo.get(this._model.curLevel + 1).reward;
            this.list.repeatY = Math.ceil(nextReward.length / 2);
            this.list.array = nextReward;
        }

        private listSelect(index: number) {
            if (index == -1) return;
            let reward: xls.pair = this.list.array[index];
            if (reward) {
                clientCore.ToolTip.showTips(this.list.cells[index], { id: reward.v1 });
            };
            this.list.selectedIndex = -1;
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: false });
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

        /**试穿套装 */
        private previewSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2110200);
        }

        /**奖励总览 */
        private async preReward() {
            let rewardInfo: clientCore.RewardDetailInfo = new clientCore.RewardDetailInfo();
            for (let i: number = 0; i < this._model.growInfo.length; i++) {
                let reward = this._model.growInfo.get(i).reward;
                for (let j: number = 0; j < reward.length; j++) {
                    if (xls.get(xls.itemCloth).has(reward[j].v1)) rewardInfo.rewardArr[3].push(reward[j].v1);
                    else rewardInfo.rewardArr[4].push(reward[j].v1);
                }
            }
            clientCore.Logger.sendLog('2020年12月4日活动', '【主活动】幸运竹', '打开全部奖励一览面板');
            clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", rewardInfo);
        }

        /**浇水 */
        private async waterBamboo() {
            if (this._waiting) return;
            this._waiting = true;
            let msg = await this._control.waterSelf(2);
            if (msg) {
                let arr: pb.IItem[] = [];
                for (const info of msg.items) {
                    if (info.id == this._model.growId) {
                        this._model.allExp += info.cnt;
                        alert.showFWords(`获得${info.cnt}点幸运竹经验`);
                    }
                    else arr.push(info);
                }
                if (arr.length > 0) alert.showReward(arr);
                this._model.getBambooInfo();
                this.updataUI();
                EventManager.event("UPDATA_BAMBOO_INFO");
                if (this._model.curLevel == this._model.maxLevel) this.close();
                else {
                    let ani = clientCore.BoneMgr.ins.play("res/animate/luckyBamboo/jindutiao.sk", "da", false, this.boxKedu);
                    ani.pos(14, 389 - this.imgMask.height);
                    ani.once(Laya.Event.COMPLETE, this, () => {
                        ani.dispose();
                    })
                }
            }
            this._waiting = false;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.previewSuit);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.openRulePanel);
            BC.addEvent(this, this.btnPreAll, Laya.Event.CLICK, this, this.preReward);
            BC.addEvent(this, this.btnZhuru, Laya.Event.CLICK, this, this.waterBamboo);
        }

        close() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}