namespace lostDream {
    export class RewardPanel extends ui.lostDream.panel.RewardPanelUI {
        private _model: LostDreamModel;
        private _control: LostDreamControl;
        private _cls: xls.commonStoryActivity;
        private _flag: number;
        private _index: number;
        constructor() {
            super();
            this.list.renderHandler = new Laya.Handler(this, this.itemRender, null, false);
            this.list.mouseHandler = new Laya.Handler(this, this.itemMouse, null, false);
        }
        show(sign: number, index: number): void {
            clientCore.DialogMgr.ins.open(this);
            this._model = clientCore.CManager.getModel(sign) as LostDreamModel;
            this._control = clientCore.CManager.getControl(sign) as LostDreamControl;
            this._cls = xls.get(xls.commonStoryActivity).get(index + 1);
            this.descTxt.text = this._cls.intro;
            this.nameTxt.changeText(this._cls.name);
            this.conTxt.changeText(`开启条件：获得${this._cls.openRequire}个`);
            this.ico.skin = clientCore.ItemsInfo.getItemIconUrl(9900032);

            let array: number[] = clientCore.LocalInfo.sex == 1 ? this._cls.femaleAward : this._cls.maleAward;
            let len: number = array.length;
            this.list.width = len * 152 + (len - 1) * this.list.scaleX;
            this.list.array = array;
            this.updateView(index);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnOpen, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this._model = this._control = null;
            super.destroy();
        }

        private updateView(index: number): void {
            this._flag = this._model.rewards[index];
            this._index = index;
            this.btnOpen.disabled = this._flag == 1;
            switch (this._flag) {
                case 1:
                case 2:
                    this.btnOpen.fontSkin = 'lostDream/s_y_Start story.png';
                    break;
                case 3:
                    this.btnOpen.fontSkin = 'lostDream/s_y_huigumengjing.png';
                    break;
                case 4:
                    this.btnOpen.fontSkin = 'lostDream/s_y_qingqu.png';
                    break;
            }
        }

        private onReward(): void {
            if (this._flag == 2 || this._flag == 3) { //开启梦境
                clientCore.AnimateMovieManager.showAnimateMovie(this._cls.movie + '', this, () => { });
                this._flag == 2 && this._control.openDream(this._index + 1, new Laya.Handler(this, () => {
                    this._model.rewards[this._index] = 4;
                    this.updateView(this._index);
                    EventManager.event(globalEvent.UPDATE_LOST_DREAM);
                }))
            } else if (this._flag == 4) { //可以领奖
                this._control.getReward(this._index + 1, new Laya.Handler(this, () => {
                    this._model.rewards[this._index] = 3;
                    this.updateView(this._index);
                    EventManager.event(globalEvent.UPDATE_LOST_DREAM);
                }))
            }
        }

        private itemRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let id: number = this.list.array[index];
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(id);
            item.num.value = '';
        }

        private itemMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let id: number = this.list.array[index];
            clientCore.ToolTip.showTips(e.target, { id: id });
        }
    }
}