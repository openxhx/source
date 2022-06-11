namespace mimiqiFloat{
    /**
     * 米米奇巡游
     * mimiqiFloat.MimiqiFloatModule
     */
    export class MimiqiFloatModule extends ui.mimiqiFloat.MimiqiFloatModuleUI{
        private _reward: RewardPanel;
        private _t: time.GTime;
        private _status: number = -1;
        constructor(){ super(); }
        init(): void{
            this.onTime();
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON,1000,this,this.onTime);
            this._t.start();
            clientCore.Logger.sendLog('2021年4月2日活动','【定时活动】周年庆花车巡游','打开活动面板');
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnReward,Laya.Event.CLICK,this,this.onReward);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        destroy(): void{
            this._t?.dispose();
            this._reward = this._t = null;
            super.destroy();
        }
        private onReward(): void{
            this._reward  = this._reward || new RewardPanel();
            this._reward.show();
        }
        private onTime(): void{
            let crt: number = clientCore.ServerManager.curServerTime;
            let date: string = util.TimeUtil.formatDate(crt);
            let st: number = util.TimeUtil.formatTimeStrToSec(date + ' 19:30:00');
            let ct: number = util.TimeUtil.formatTimeStrToSec(date + ' 20:00:00');
            let dt: number = 0;
            if(crt < st){//活动还未开始
                dt = st - crt;
                this.changeStatus(0);
                this.timeTxt.changeText(util.StringUtils.getTime(dt,'{hour}:{min}:{sec}'));
            }else if(crt >= st && crt <= ct){//活动正在进行
                this.changeStatus(1);
            }else{//今日活动结束了
                dt = st + util.TimeUtil.DAYTIME - crt;
                this.changeStatus(0);
                this.timeTxt.changeText(util.StringUtils.getTime(dt,'{hour}:{min}:{sec}'));
            }
        }

        private changeStatus(status: number): void{
            if(status == this._status)return;
            this._status = status;
            if(status == 1){ //活动正在进行
                this.timeTxt.visible = false;
                this.tipsTxt.changeText('米米奇正在为大家送出礼物~');
            }else{
                this.timeTxt.visible = true;
                this.tipsTxt.changeText('距离米米奇出现:');
            }
        }
    }
}