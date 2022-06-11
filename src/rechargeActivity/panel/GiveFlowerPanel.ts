/// <reference path="../flower/FlowerRankPanel.ts" />
/// <reference path="../flower/FlowerPersonRewardPanel.ts" />
/// <reference path="../flower/FlowerRecordPanel.ts" />
namespace rechargeActivity {

    const CLS_ARR = [
        FlowerRankPanel,
        FlowerRankPanel,
        FlowerPersonRewardPanel,
        FlowerRecordPanel
    ];

    export class GiveFlowerPanel extends BasePanel {
        private _ui: ui.rechargeActivity.panel.GiveFlowerPanelUI;
        private _panelArr: core.BaseModule[];
        private _tab: number = -1;
        constructor() {
            super();
            this.needLoading = true;
            this.drawCallOptimize = true;
        }

        async waitLoading() {
            await res.load('atlas/rechargeActivity/giveFlower.atlas');
            await res.load('atlas/rechargeActivity/rewardPrev.atlas');
            await xls.load(xls.rankInfo);
            await xls.load(xls.giveFlowerReward);
        }

        refreshTime() {
            let date = util.TimeUtil.formatTimeStrToSec('2020-6-11 22:00:00') - clientCore.ServerManager.curServerTime;
            this._ui.txtTime.text = date <= 0 ? '排行榜活动已结束' : `距离排行榜截止：${util.StringUtils.getDateStr(date, ':')}`;
        }


        init(data: any, info: any) {
            super.init(data, info);
            this._mainUI = this._ui = new ui.rechargeActivity.panel.GiveFlowerPanelUI();
            this._panelArr = [];
            this.addChild(this._mainUI);
            this.showTab(0);
            this.addEventListenters();
            clientCore.Logger.sendLog('2020年6月5日活动', '【活动】爱心守护', '打开活动面板');
        }

        private showTab(tab: number) {
            if (this._tab != tab) {
                this._tab = tab;
                let panel = this._panelArr[tab];
                if (!panel) {
                    panel = new CLS_ARR[tab];
                    this._panelArr[tab] = panel;
                    panel.init(tab);
                }
                this._ui.spCon.removeChildren();
                this._ui.spCon.addChild(panel);
                for (let i = 0; i < CLS_ARR.length; i++) {
                    this._ui['tab_' + i].index = i == tab ? 1 : 0;
                }
            }
        }

        private onRule() {
            alert.showRuleByID(1014);
        }

        private _prevPanel: FlowerRewardPrevPanel;
        private onPrev() {
            this._prevPanel = this._prevPanel || new FlowerRewardPrevPanel();
            this._prevPanel.show(_.clamp(this._tab, 0, 1));
        }

        addEventListenters() {
            for (let i = 0; i < CLS_ARR.length; i++) {
                BC.addEvent(this, this._ui['tab_' + i], Laya.Event.CLICK, this, this.showTab, [i]);
            }
            BC.addEvent(this, this._ui.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this._ui.btnPrev, Laya.Event.CLICK, this, this.onPrev);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }


        destroy() {
            super.destroy();
            for (const panel of this._panelArr) {
                panel?.destroy();
            }
        }
    }
}