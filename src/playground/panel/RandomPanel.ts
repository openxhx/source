namespace playground {
    /**
     * 命运占卜
     */
    export class RandomPanel extends ui.playground.panel.RandomPanelUI {
        private _control: PlaygroundControl;
        private _event: pb.Ievent[];
        private _context: string;
        private _curEnergy: number;
        private _wait: boolean;
        constructor() { super(); }

        show(sign: number): void {
            this._wait = false;
            this._control = clientCore.CManager.getControl(sign) as PlaygroundControl;
            this.ani1.gotoAndStop(0);
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.onBack);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.onStartRandom);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this._event && EventManager.event(PlaygroundConst.START_FATE_EVENT, [this._event, this._context, this._curEnergy]);
            this._event = null;
            super.destroy();
        }
        private onBack(): void {
            this.boxResult.visible && this.hide();
        }
        /** 开始占卜*/
        private onStartRandom(): void {
            if (this._wait) return;
            this._wait = true;
            this._control.randomEvent(new Laya.Handler(this, (msg: pb.sc_flower_land_destiny_divination) => {
                let data: xls.gardenRandom = xls.get(xls.gardenRandom).get(msg.randomId);
                if (!data) {
                    console.error(`随机到的ID${msg.randomId}在配置表中并不存在~`);
                    return;
                }
                this._context = data.uiDescription;
                this._event = msg.eventList;
                this._curEnergy = msg.curEnergy;
                this.descTxt.text = data.description;
                this.imgResult.skin = `playgroundRom/${msg.property}.png`;
                this.ani1.once(Laya.Event.COMPLETE, this, async () => {
                })
                this.ani1.play(0, false);
            }))
        }
    }
}