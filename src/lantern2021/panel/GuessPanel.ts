namespace lantern2021{
    /**
     * 猜花灯
     */
    export class GuessPanel extends ui.lantern2021.panel.GuessPanelUI implements IPanel{
        private _model: Lantern2021Model;
        private _answer: RiddlePanel;
        private _sign: number;
        private _wait: boolean;
        constructor(){ super(); }
        show(sign: number): void{
            this._sign = sign;
            this._model = clientCore.CManager.getModel(sign) as Lantern2021Model;
            this.updateView();
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            this._wait = false;
            this._model = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            for(let i:number=1; i<6; i++){
                let view: ui.lantern2021.item.LanternItemUI = this[i];
                view.imgLantern.skin = `lantern2021/light_${i}.png`;
                view.imgQua.visible = this._model.checkBit(i);
                view.ani1.index = 0;
                BC.addEvent(this,view,Laya.Event.CLICK,this,this.onClick,[i]);
            }
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.onClose);
            BC.addEvent(this,EventManager,Lantern2021Constant.ANSWER_COMPLETE,this,this.onAnswerComplete);
        }
        removeEventListeners(): void{
            for(let i:number=1; i<6; i++){
                let view: ui.lantern2021.item.LanternItemUI = this[i];
                view?.ani1.off(Laya.Event.COMPLETE,this,this.onComplete);
            }
            BC.removeEvent(this);
        }
        private onAnswerComplete(pos: number): void{
            this._model.answerTimes++;
            this._model.setBit(pos,1);
            this[pos].imgQua.visible = false;
            this.updateView();
        }
        private updateView(): void{
            this.timesTxt.changeText(`${5 - this._model.answerTimes}`);
        }
        private onClick(pos: number): void{
            if(this._model.answerTimes >= 5 || this._model.checkBit(pos) == false || this._wait)return;
            this._wait = true;
            let view: ui.lantern2021.item.LanternItemUI = this[pos];
            view.ani1.play(0,false);
            view.ani1.once(Laya.Event.COMPLETE,this,this.onComplete,[pos]);
        }
        private onComplete(pos: number): void{
            this._answer = this._answer || new RiddlePanel();
            this._answer.show(this._sign,pos);
            this._wait = false;
            let view: ui.lantern2021.item.LanternItemUI = this[pos];
            view.ani1.index = 0;
        }
        private onClose(): void{
            if(this._wait)return;
            this.hide();
        }
    }
}