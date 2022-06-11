namespace springOrchard{


    class Config{
        /** 多少轮次*/
        round: number = 5;
        /** 正确次数*/
        correct: number = 0;
        /** 已答题次数*/
        times: number = 0;
        /** 当前答题的正确答案*/
        answer: number;
        /** 是否结束*/
        isOver: boolean = false;
    }

    /**
     * 问答
     */
    export class QuestionPanel extends ui.springOrchard.panel.QuestionPanelUI{

        private _config: Config;
        private _model: SpringOrchardModel;
        private _control: SpringOrchardControl;

        constructor(){
            super();
            this.list.renderHandler = new Laya.Handler(this,this.listRender,null,false);
            this.list.selectHandler = new Laya.Handler(this,this.listSelect,null,false);
            this.rewardList.renderHandler = new Laya.Handler(this,this.rewardRender,null,false);
            this.rewardList.mouseHandler = new Laya.Handler(this,this.rewardMouse,null,false);
            this.rewardList.array = [9900147];
        }

        show(sign: number): void{
            this._model = clientCore.CManager.getModel(sign) as SpringOrchardModel;
            this._control = clientCore.CManager.getControl(sign) as SpringOrchardControl;
            this.gameStart();
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            this._model = this._control = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.onClose);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        destroy(): void{
            Laya.timer.clearAll(this);
            this._config = null;
            super.destroy();
        }

        private gameStart(): void{
            this._config = new Config();
            this.qa();
            this.updateResult();
        }

        private qa(): void{
            let array: number[] = _.sampleSize(_.map(new Array(17),(element,index)=>{ return 900001 + index; }),4);
            this._config.answer = _.sample(array);
            this.imgIco.skin = `res/activity/orchard/${this._config.answer}.png`;
            this.list.array = array;
            this.list.selectedIndex = -1;
            this.list.selectEnable = true;
        }

        private listRender(item: ui.springOrchard.item.AnswerItemUI,index: number): void{
            let id: number = this.list.array[index];
            let isSel: boolean = index == this.list.selectedIndex;
            item.valueTxt.changeText(`${['A','B','C','D'][index]}.${clientCore.ItemsInfo.getItemName(id)}`);
            item.imgSel.visible = isSel;
            if(this.list.selectedIndex != -1){ //已选择
                let correct: boolean = id == this._config.answer;
                item.imgBg.skin = `springOrchard/${correct ? 'zhengquedaan' : (isSel ? 'cuowudaan' : 'jichukuang')}.png`;
            }else{
                item.imgBg.skin = 'springOrchard/jichukuang.png';
            }
        }

        private listSelect(index: number): void{
            if(index == -1)return;
            this.list.selectEnable = false;
            this._config.times++;
            this._config.answer == this.list.array[index] && this._config.correct++;
            this.updateResult();
            if(this._config.times >= this._config.round){
                this._config.isOver = true;
                Laya.timer.once(1000,this,this.gameOver);
            }else{
                Laya.timer.once(1000,this,this.qa);
            }
        }

        private updateResult(): void{
            this.residueTxt.changeText(`剩余问题：${this._config.round - this._config.times}/${this._config.round}`);
            this.correctTxt.changeText(`正确率：${this._config.times ? Math.floor(this._config.correct / this._config.times * 100) : 0}%`);
        }

        private gameOver(): void{
            this._control?.gameResult(this._config.correct,new Laya.Handler(this,()=>{
                this._model.times = 1;
                this.hide();
            }));
        }

        private onClose(): void{
            if(this._config.isOver == false){
                alert.showSmall('当前离开后将重新开始，是否确认离开？',{
                    callBack: {
                        caller: this,
                        funArr: [this.hide]
                    }
                })
            }else{
                this.hide();
            }
        }

        private rewardRender(item: ui.commonUI.item.RewardItemUI,index: number): void{
            clientCore.GlobalConfig.setRewardUI(item,{id: this.rewardList.array[index],cnt: 1,showName: false});
        }

        private rewardMouse(e: Laya.Event,index: number): void{
            if(e.type != Laya.Event.CLICK)return;
            clientCore.ToolTip.showTips(e.target,{id: this.rewardList.array[index]});
        }
    }
}