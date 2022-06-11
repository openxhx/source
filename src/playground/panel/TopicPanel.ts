namespace playground {
    /**
     * 命运抉择
     */
    export class TopicPanel extends ui.playground.panel.TopicPanelUI {
        private _control: PlaygroundControl;
        private _selectIndex: number;
        private _cls: xls.gardenChoose;
        private _event: pb.Ievent[];
        private _curEnergy: number;
        private _context: string;
        private _wait: boolean;
        constructor() {
            super();
            this.htmlResult.style.width = 520;
            this.htmlResult.style.height = 64;
            this.htmlResult.style.fontSize = 30;
            this.htmlResult.style.font = '汉仪中圆简';
            this.htmlResult.style.wordWrap = true;
        }

        show(sign: number, id: number): void {
            this._wait = false;
            this._control = clientCore.CManager.getControl(sign) as PlaygroundControl;
            this._cls = xls.get(xls.gardenChoose).get(id);
            if (!this._cls) {
                alert.showFWords(`似乎并不存在ID${id}的抉择~`);
                return;
            }
            this.boxTopic.visible = true;
            this.boxResult.visible = false;
            this.descTxt.text = this._cls.description;
            let array: string[] = this._cls.choose.split("/");
            for (let i: number = 1; i < 3; i++) { this['choice_' + i].changeText(array[i - 1]); }
            this.onClick(1); //先默认选择第一个
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            for (let i: number = 1; i < 3; i++) {
                BC.addEvent(this, this['imgChoice_' + i], Laya.Event.CLICK, this, this.onClick, [i]);
            }
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this._event && EventManager.event(PlaygroundConst.START_FATE_EVENT, [this._event, this._context, this._curEnergy]);
            this._selectIndex = -1;
            this._event = this._cls = this._control = null;
            super.destroy();
        }

        private onClick(index: number): void {
            this._selectIndex = index;
            this.imgSel.pos(1, 1);
            this['imgChoice_' + index].addChild(this.imgSel);
            for (let i: number = 1; i < 3; i++) {
                this['imgChoice_' + i].skin = `playground/di_dati${i == index ? 1 : 2}.png`;
                this['choice_' + i].color = i == index ? '#FFFFFF' : '#734b25';
            }
        }

        private onSure(): void {
            //如果已经出结果了 那么关闭面板
            if (this.boxResult.visible) {
                this.hide();
                return;
            }
            if (this._wait) return;
            this._wait = true;
            let type: number = this._selectIndex;
            this._control.destinyChoice(this._cls.id, type, new Laya.Handler(this, async (msg: pb.sc_flower_land_destiny_choice) => {
                this.htmlResult.innerHTML = util.StringUtils.getColorText3(this._cls.result.split('/')[type - 1], '#734b25', '#f25c58');
                this.boxResult.visible = true;
                this.boxTopic.visible = false;
                this._event = msg.eventList;
                this._context = this._cls.uiDescription.split('/')[type - 1];
                this._curEnergy = msg.curEnergy;
            }))
        }
    }
}