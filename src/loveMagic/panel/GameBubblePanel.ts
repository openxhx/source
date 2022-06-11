namespace loveMagic{
    /**
     * 小游戏吹泡泡
     */
    export class GameBubblePanel extends ui.loveMagic.panel.BubbleGamePanelUI{

        private _model: LoveMagicModel;
        private _control: LoveMagicControl;
        private _t: time.GTime;
        private _time: number;
        private _size: number;
        private _gameing: boolean;
        private _max: number;
        private _bone: clientCore.Bone;
        private _clickTime: number;

        private readonly STAGE_ID: number = 60135;

        show(sign: number): void{
            clientCore.Logger.sendLog('2021年4月9日活动', '【游戏】吹气球', '打开游戏面板');
            this._bone = clientCore.BoneMgr.ins.play(pathConfig.getActivityAnimate('balloon'),0,true,this.spBone);
            this._bone.pos(-22,154);
            this._model = clientCore.CManager.getModel(sign) as LoveMagicModel;
            this._control = clientCore.CManager.getControl(sign) as LoveMagicControl;
            this.updateView();
            clientCore.DialogMgr.ins.open(this);
        }

        hide(): void{
            this._bone?.dispose();
            this._bone = null;
            this._t?.dispose();
            this._t = null;
            this._model = this._control = null;
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnStart,Laya.Event.CLICK,this,this.gameStart);
            BC.addEvent(this,this,Laya.Event.CLICK,this,this.onClick);
        }

        removeEventListeners(): void{
            BC.removeEvent(this);
        }

        private updateView(): void{
            this.vStack.selectedIndex = 0;
            this.updateTimes();
        }

        private updateTimes(): void{
            this.timesTxt.changeText(`今日剩余:${this._model.MAX_GAME_COUNT-this._model.bubbleTimes}/${this._model.MAX_GAME_COUNT}`);
        }

        private gameStart(): void{
            if(this._gameing)return;
            if(this._model.bubbleTimes >= 3){
                alert.showFWords('今日游戏次数已达上限哦~');
                return;
            }
            this._control?.startGame(this.STAGE_ID,new Laya.Handler(this,()=>{
                clientCore.Logger.sendLog('2021年4月9日活动', '【游戏】吹气球', '进入游戏');
                this.vStack.selectedIndex = 1;
                this._max = _.random(300,400);
                this._size = 6;
                this._gameing = true;
                this._clickTime = 0;
                this.imgBubble.size(this._size,this._size);
                this.imgLine.size(this._max,this._max);
                this.timeTxt.changeText(`倒计时：${this._model.GAME_TIME}`);
                this.checkTips();
            }));
        }

        private showTime(): void{
            if(!this._t) this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON,1000,this,this.onTime);
            if(this._t.started)return;
            this._time = 0;
            this.timeTxt.changeText(`倒计时：${this._model.GAME_TIME}`);
            this._t.start();
        }

        private onTime(): void{
            this.checkTips();
            this.timeTxt.changeText(`倒计时：${this._model.GAME_TIME-++this._time}`);
            this._time >= this._model.GAME_TIME && this.gameOver(0);
        }

        private gameOver(type: 0 | 1): void{
            this._t.stop();
            this.vStack.selectedIndex = 0;
            this._control?.overGame(this.STAGE_ID,type,new Laya.Handler(this,()=>{
                this.hideTips();
                this._gameing = false;
                this._model.bubbleTimes++;
                this.updateTimes();
            }));
        }

        private onClick(): void{
            if(this.vStack.selectedIndex != 1)return;
            this._clickTime = Laya.Browser.now();
            this.showTime();
            this.hideTips();
            if(this._size < 100){
                this._size += 10;
            }else if(this._size < 300){
                this._size += 6;
            }else if(this._size < 500){
                this._size += 4;
            }else{
                this._size += 2;
            }
            this.imgBubble.size(this._size,this._size);
            this._size >= this._max && this.gameOver(1);
        }

        private checkTips(): void{
            if(Laya.Browser.now() - this._clickTime > 2000){
                this.imgHand.visible = this.txTips.visible = true;
                this.ani1.play(0,true);
                this.ani2.play(0,true);
            }
        }

        private hideTips(): void{
            if(!this.imgHand.visible)return;
            this.imgHand.visible = this.txTips.visible = false;
            this.ani1.stop();
            this.ani2.stop();
        }
    }
}