namespace impossibleTasks {
    export class CollectRulePanel extends ui.impossibleTasks.panel.CollectRulePanelUI {
        private _sign: number;

        private _model: ImpossibleTasksModel;
        constructor(sign: number) {
            super();
            this._sign = sign;
            this.sideClose = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
        }

        init(data: any = null) {
            this._model = clientCore.CManager.getModel(this._sign) as ImpossibleTasksModel;
            let ruleJson = res.get(pathConfig.getJsonPath("rule"));
            let ruleArr = ruleJson["" + this._model.ruleById2];
            this.list.dataSource = ruleArr;
        }

        private listRender(item: ui.impossibleTasks.render.RuleRenderUI) {
            item.txt.text = item.dataSource;
        }

        private gameStart() {
            if (!this._model.isCanGame) {
                alert.showFWords('今日游戏次数已达上限~');
                return;
            }
            this.close();
            this.event("ON_GAMESTART");
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.gameStart);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = null;
            super.destroy();
        }
    }
}