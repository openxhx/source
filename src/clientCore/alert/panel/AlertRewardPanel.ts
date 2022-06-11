
namespace alert {
    export class AlertRewardPanel extends ui.alert.RewardAlertUI {
        private funArr: any[];
        private caller: any[];
        private _blurBg: Laya.Sprite;
        private _blackBg: Laya.Sprite;
        constructor() {
            super();
            this.addEventListeners();
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.list.vScrollBarSkin = null;
            this.pivot(this.width / 2, this.height / 2);
        }

        playShowScaleAni() {
            // this.centerX = this.centerY = 0;
            this.x = Laya.stage.width / 2;
            this.y = Laya.stage.height / 2;
            this.imgBg.width = clientCore.LayerManager.stageWith;
            this._blurBg = clientCore.LayerManager.createScreenShot();
            clientCore.LayerManager.alertLayer.addChild(this._blurBg);
            this._blackBg = util.DisplayUtil.createMask(clientCore.LayerManager.stageWith, clientCore.LayerManager.stageHeight);
            this._blackBg.mouseEnabled = false;
            clientCore.LayerManager.alertLayer.addChild(this._blackBg);
            clientCore.LayerManager.mainLayer.visible = false;
            this.ani1.once(Laya.Event.COMPLETE, this, () => {
                this._blurBg.once(Laya.Event.CLICK, this, this.onSure);
            })
            this.ani1.play(0, false);
            if (clientCore.GlobalConfig.guideAutoPlay && clientCore.GuideMainManager.instance.isGuideAction) {
                Laya.timer.once(600, this, () => {
                    let event = new Laya.Event();
                    this._blurBg.event(Laya.Event.CLICK, event.setTo(Laya.Event.CLICK, this._blurBg, this._blurBg));
                });
            }
        }

        playShowH5(): void {
            this.playShowScaleAni();
            BC.addEvent(this, EventManager, globalEvent.STAGE_RESIZE, this, this._reiszeView);
        }
        private _reiszeView(): void {
            this.x = Laya.stage.width / 2;
            this.y = Laya.stage.height / 2;
            this.imgBg.width = clientCore.LayerManager.stageWith;
            let w: number = Laya.stage.width;
            let h: number = Laya.stage.height;
            this._blurBg.size(w, h);
            this._blackBg.graphics.clear();
            this._blackBg.graphics.drawRect(0, 0, w, h, '#000000');
        }

        setData(reward: clientCore.IGoodsInfo[], title: string, callBack: CallBack, opt: AlertOption) {
            this.funArr = callBack ? callBack.funArr : [];
            this.caller = callBack ? callBack.caller : null;
            this.list.dataSource = reward;
            this.list.repeatX = reward.length > 5 ? 5 : reward.length;
            this.list.repeatY = Math.min(3, Math.ceil(reward.length / 5));
            this.imgBg.height = [280, 440, 590][this.list.repeatY - 1];
            if (opt.vipAddPercent) {
                this.imgUp.visible = true;
                this.imgUp.gray = clientCore.FlowerPetInfo.petType == 0;
                this.txtPer.text = `+${opt.vipAddPercent}%`;
            }
            else {
                this.imgUp.visible = false;
            }
        }

        private onListRender(cell: ui.commonUI.item.RewardItemUI, idx: number) {
            let info = cell.dataSource as clientCore.IGoodsInfo;
            let id = info.itemID;
            if (id >= 3500007 && id <= 3500009) {
                id -= 1100003;
            }
            cell.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            let namestr = clientCore.ItemsInfo.getItemName(id);;
            if (namestr.length <= 7) cell.txtName.fontSize = 21;
            else cell.txtName.fontSize = Math.floor(152 / namestr.length);
            cell.txtName.text = namestr;
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(id);
            cell.num.value = info.itemNum.toString();
            cell.txtName.visible = true;
            let isRole = Math.floor(id / 100000) == 14;
            cell.num.visible = !isRole;
            let s = isRole ? 0.6 : 0.8;
            cell.ico.scale(s, s, true);
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && e.target.name == 'imgBg') {
                let id = this.list.getItem(idx).itemID;
                if (id >= 3500007 && id <= 3500009) {
                    id -= 1100003;
                }
                clientCore.ToolTip.showTips(this.list.getCell(idx), { id: id });
            }
        }

        private onSure() {
            this.destroy();
            if (this.funArr && this.funArr[0])
                this.funArr[0].call(this.caller);
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickAlertRewardPanelSureBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        addEventListeners() {
            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
            BC.addEvent(this, EventManager, globalEvent.CLOSING_ALL_MODULE, this, this.destroy);
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "AlertRewardPanel") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
            }
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            clientCore.LayerManager.mainLayer.visible = true;
            this._blurBg?.destroy(true);
            this._blackBg?.destroy(true);
            super.destroy();
        }
    }
}