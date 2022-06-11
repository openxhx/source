namespace earthValue{

    enum State{
        LIGHT,
        PASSWORD
    }

    /**
     * 培育任务
     */
    export class GamePanel extends ui.earthValue.panel.GamePanelUI{


        private _passwords: number[] = [];
        private _times: number[] = [4,5,5,6,6,7];
        private _state: State;
        private _source: number = 0;

        constructor(){
            super();
            this.initView();
            this.addEvents();
        }

        private initView(): void{
            this.inputList.renderHandler = new Laya.Handler(this,this.inputRender,null,false);
            this.inputList.mouseHandler = new Laya.Handler(this,this.inputMouse,null,false);
            this.lightList.renderHandler = new Laya.Handler(this,this.lightRender,null,false); 
            this.progressList.renderHandler = new Laya.Handler(this,this.progressRender,null,false); 
        }

        private addEvents(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.dispose);
        }

        private removeEvents(): void{
            BC.removeEvent(this);
        }

        onEnable(): void{
            this.inputList.array = this.lightList.array = _.map(new Array(9),()=>{ return 1; });
            this.progressList.array = _.map(new Array(6),()=>{ return 3; });
            net.sendAndWait(new pb.cs_mini_game_begin({stageId: 60132})).then(()=>{
                this.gameStart(this._times.shift());
            });
        }

        dispose(): void{
            Laya.timer.clear(this,this.onTimeOut);
            this.removeEvents();
            EventManager.event(Constant.UPDATE_VIEW,1);
        }


        private inputRender(item: Laya.Image,index: number): void{
            item.skin = `earthValue/rect_${this.inputList.array[index]}.png`;
        }

        private inputMouse(e: Laya.Event,index: number): void{
            if(e.type != Laya.Event.CLICK || this._passwords.length <= 0 || this._state != State.PASSWORD)return;
            Laya.timer.runTimer(this,this.onTimeOut);
            let err: boolean = index != this._passwords.shift();
            if(err){
                alert.showFWords('输入错误~');
                this.inputList.mouseEnabled = false;
            }
            this.inputList.changeItem(index, err ? 2 : 3);
            Laya.timer.once(500,this,this.onTimeOut,[index,err]);
            core.SoundManager.instance.playSound(pathConfig.getSoundUrl('stand'));
        }

        private onTimeOut(index: number,error: boolean): void{
            this.inputList.changeItem(index,1);
            if(error || this._passwords.length <= 0){
                !error && this._source++;
                let index: number = 5 - this._times.length;
                this.progressList.changeItem(index,error ? 2 : 1);
                this.reStart();
            }
        }

        private reStart(): void{
            if(this._times.length == 0){ //全部结束
                this.gameOver();
                return;
            }
            this.gameStart(this._times.shift());
        }

        private lightRender(item: Laya.Image,index: number): void{
            item.skin = `earthValue/ball_${this.lightList.array[index]}.png`;
        }

        private progressRender(item: Laya.Image,index: number): void{
            item.skin =`earthValue/triangle_${this.progressList.array[index]}.png`;
        }

        private async gameStart(times: number): Promise<void>{
            this._passwords.length = 0;
            this.inputList.mouseEnabled = false;
            await this.light(times);
            this._state = State.PASSWORD;
            this.inputList.mouseEnabled = true;
        }

        private gameOver(): void{
            net.sendAndWait(new pb.cs_mini_game_over({stageId: 60132,score: this._source})).then((msg: pb.sc_mini_game_over)=>{
                clientCore.EarthPerciousMgr.taskFlag = 1;
                alert.showReward(msg.rewardInfo);
                this.dispose();
            })
        }

        /**
         * 亮灯阶段
         * @param times 亮几次
         */
        private light(times: number): Promise<void>{
            this._state = State.LIGHT;
            return new Promise((suc: Function,fail: Function)=>{
                let lightOnce: Function = ()=>{
                    if(times-- <= 0){
                        suc();
                    }else{
                        let index: number = _.random(0,this.lightList.length - 1);
                        let item: any = this.lightList.getCell(index);
                        item.ani1.play(0,false);
                        item.ani1.once(Laya.Event.COMPLETE,this,lightOnce);
                        this._passwords.push(index);
                    }
                }
                //开始亮灯
                lightOnce();
            })
        }
    }
}