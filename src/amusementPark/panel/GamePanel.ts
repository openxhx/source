namespace amusementPark {
    export class GamePanel extends ui.amusementPark.panel.GamePanelUI {
        private _sign: number;
        private _gameId: number;

        private _model: AmusementParkModel;
        private _control: AmusementParkControl;

        private openType: number;

        constructor(sign: number) {
            super();
            this._sign = sign;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.listClick);
        }

        init(data: any) {
            this._gameId = data.gameId;

            this._model = clientCore.CManager.getModel(this._sign) as AmusementParkModel;
            this._control = clientCore.CManager.getControl(this._sign) as AmusementParkControl;

            this.imgTitle.skin = "amusementPark/game_title" + this._gameId + ".png";
            this.imgBg.skin = "amusementPark/game_bg" + this._gameId + ".png";
            if (this._model.getGameOpen(this._gameId) < 0) {
                this._control.getGameOpen(this._gameId, Laya.Handler.create(this, (msg: pb.sc_mini_game_collect_panel) => {
                    this.updateView();
                }));
            } else {
                this.updateView();
            }
            this.list.scrollTo(0);
        }

        private updateView() {
            this.openType = this._model.getGameOpen(this._gameId);
            let arr = this._model.getGameArr(this._gameId);
            this.list.array = arr;
            this.list.repeatY = arr.length;
        }

        /**复用要修改 */
        private listRender(item: ui.amusementPark.item.GameLevelItemUI) {
            let data: xls.park = item.dataSource;
            item.labname.text = "关卡" + (data.id % 100);
            item.lock.visible = false;
            if ((data.id % 100 == 1 && this.openType == 0) || this.openType + 1 == data.id) {
                item.di.index = 1;
            } else if (this.openType + 1 < data.id) {
                item.di.index = 0;
                item.lock.visible = true;
            } else {
                item.di.index = 2;
            }
            //////////活动相关
            // item.itemIcon.skin = clientCore.ItemsInfo.getItemIconUrl(9900266);
            // item.icon.visible = this.showIcon();
            this.eventTip.visible = this.showIcon();
            ///////////
        }
        /**匹配小游戏id和活动 */
        private showIcon() {
            clientCore.Logger.sendLog('2021年11月26日活动', '【活动】感恩午后时光', '点击前往挑战甜甜圈');
            return this._gameId == 11 && !clientCore.SystemOpenManager.ins.checkActOver(230);
        }

        private listClick(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                this.onClick(this.list.getCell(idx).dataSource);
            }
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onDetail(): void {
            if (this._gameId == 11) {
                clientCore.ModuleManager.open("diningCarRule.DiningCarRuleModule", 0);
            } else {
                alert.showRuleByID(this._model.getRuleIdBy(this._gameId));
            }
        }

        private onClick(gameInfo: xls.park): void {
            if (gameInfo.id % 100 > 1 && this.openType + 1 < gameInfo.id) {
                alert.showFWords("当前关卡未开放");
                return;
            }
            let module = this._model.getGameUrl(gameInfo.moduleId);
            this.close();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open(module, { modelType: "amusementPark", openType: "amusementPark", stageId: gameInfo.id, gameId: gameInfo.gameId }, { openWhenClose: "amusementPark.AmusementParkModule", openData: this._gameId });
            this.onLogger(this._gameId, gameInfo.id % 100);
        }

        private onLogger(gameId: number, index: number): void {
            switch (gameId) {
                case 1:
                    clientCore.Logger.sendLog('2020年9月14日活动', '【主活动】花仙游乐园', '挑战花朵连连看第' + index + '关');
                    break;
                case 2:
                    clientCore.Logger.sendLog('2020年9月14日活动', '【主活动】花仙游乐园', '挑战水果连连看第' + index + '关');
                    break;
                case 3:
                    clientCore.Logger.sendLog('2020年9月14日活动', '【主活动】花仙游乐园', '挑战方块消消乐第' + index + '关');
                    break;
                case 4:
                    clientCore.Logger.sendLog('2020年9月14日活动', '【主活动】花仙游乐园', '挑战跳一跳第' + index + '关');
                    break;
                case 5:
                    clientCore.Logger.sendLog('2020年9月14日活动', '【主活动】花仙游乐园', '挑战砍树训练第' + index + '关');
                    break;
                case 6:
                    clientCore.Logger.sendLog('2020年9月14日活动', '【主活动】花仙游乐园', '挑战甜甜圈第' + index + '关');
                    break;
                case 7:
                    clientCore.Logger.sendLog('2020年9月14日活动', '【主活动】花仙游乐园', '挑战打地鼠第' + index + '关');
                    break;
                case 8:
                    clientCore.Logger.sendLog('2020年9月14日活动', '【主活动】花仙游乐园', '挑战打砖块第' + index + '关');
                    break;
                case 9:
                    clientCore.Logger.sendLog('2020年9月14日活动', '【主活动】花仙游乐园', '挑战怪物翻牌第' + index + '关');
                    break;
                case 10:
                    clientCore.Logger.sendLog('2020年9月14日活动', '【主活动】花仙游乐园', '挑战射箭训练第' + index + '关');
                    break;
                case 11:
                    clientCore.Logger.sendLog('2021年2月5日活动', '【主活动】花仙游乐园', '挑战花仙餐车第' + index + '关');
                    break;
                case 12:
                    clientCore.Logger.sendLog('2021年6月11日活动', '【主活动】花仙游乐园', '挑战奶牛工坊第' + index + '关');
                    break;
                case 13:
                    clientCore.Logger.sendLog('2021年6月11日活动', '【主活动】花仙游乐园', '挑战捞金鱼第' + index + '关');
                    break;
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = this._control = null;
            super.destroy();
        }
    }
}