
namespace lantern2021{
    /**
     * 灯谜
     */
    export class RiddlePanel extends ui.lantern2021.panel.RiddlePanelUI{
        private _model: Lantern2021Model;
        private _control: Lantern2021Control;
        private _correct: string;
        private _pos: number;
        constructor(){ 
            super();
            this.list.renderHandler = new Laya.Handler(this,this.listRender,null,false);
            this.list.selectHandler = new Laya.Handler(this,this.listSelect,null,false);
        }
        show(sign: number,pos: number): void{
            this.list.selectedIndex = -1;
            this._pos = pos;
            this.list.selectEnable = true;
            this._model = clientCore.CManager.getModel(sign) as Lantern2021Model;
            this._control = clientCore.CManager.getControl(sign) as Lantern2021Control;
            let cfg: xls.valentineAnswer = xls.get(xls.valentineAnswer).get(this._model.questions[pos - 1]);
            let array: string[] = cfg.options.split('/');
            this._correct = array[0];
            this.quaTxt.text = cfg.question;
            this.list.array = _.shuffle(array);
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            this._model = this._control = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,EventManager,Lantern2021Constant.ANSWER_COMPLETE,this,this.onAnswerComplete);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        private listRender(item: ui.lantern2021.item.AnswerItemUI,index: number): void{
            let answer: string = this.list.array[index];
            let select: boolean = index == this.list.selectedIndex;
            item.answerTxt.changeText(answer);
            item.imgSel.visible = select;
            if(this.list.selectEnable){
                item.imgBg.skin = 'lantern2021/btn_changgui.png';
            }else{
                item.imgBg.skin = `lantern2021/${answer == this._correct ? 'btn_dui' : (select ? 'btn_cuo' : 'btn_changgui')}.png`;
            }
        }
        private listSelect(index: number): void{
            if(index == -1)return;
            let ret: number = this.list.array[index] == this._correct ? 1 : 0;
            this.list.selectEnable = false;
            this._control.answer(this._model.questions[this._pos - 1],ret,this._pos);
        }
        private onAnswerComplete(): void{
            this.list.refresh();
        }
    }
}