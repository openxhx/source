namespace christmasFloat{
    /**
     * 花车巡游
     * christmasFloat.ChristmasFloatModule
     * 策划案： \\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\1225\圣诞花车巡游（复用）_connie.docx
     */
    export class ChristmasFloatModule extends ui.christmasFloat.ChristmasFloatModuleUI{
        private _reward: RewardPanel;
        private _t: time.GTime;
        private _status: number = -1;
        constructor(){ super(); }
        init(): void{
            this.onTime();
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON,1000,this,this.onTime);
            this._t.start();
            clientCore.Logger.sendLog('2022年3月25日活动', '【活动】周年花车巡游', '打开花车巡游面板');
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
            clientCore.Logger.sendLog('2022年3月25日活动', '【活动】周年花车巡游', '查看奖励预览');
            this._reward  = this._reward || new RewardPanel();
            this._reward.show();
        }
        private onTime(): void{
            let crt: number = clientCore.ServerManager.curServerTime;
            let date: string = util.TimeUtil.formatDate(crt);
            let st: number = util.TimeUtil.formatTimeStrToSec(date + ' 20:30:00');
            let ct: number = util.TimeUtil.formatTimeStrToSec(date + ' 21:00:00');
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
                this.tipsTxt.changeText('周年花车正在为大家送出礼物~');
            }else{
                this.timeTxt.visible = true;
                this.tipsTxt.changeText('距离周年花车出现：');
            }
        }
    }
}