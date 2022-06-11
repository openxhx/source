namespace bearAds{
    /**
     * 熊先生强弹
     */
    export class BearAdsModule extends ui.bearAds.BeanAdsModuleUI{    
        private _t: time.GTime;
        private _state: number;
        private _msg: pb.sc_bear_puppet_house_get_info;

        constructor(){ super(); }
        

        init(): void{
            this.sideClose = true;
            this.addPreLoad(this.getInfo());
        }

        onPreloadOver(): void{
            this.txLimit.changeText(this._msg.curLimit+'');
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.showPrice(this.boxHas);
            this.showPrice(this.boxNo);
            this.updateAgree();
            this.updateView(this.checkTime());
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON,1000,this,this.onTime);
            this._t.start();
        }
        
        addEventListeners(): void{
            BC.addEvent(this,this,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnGo,Laya.Event.CLICK,this,this.goMod);
            BC.addEvent(this,this.btnShow,Laya.Event.CLICK,this,this.onSetup);
        }
        
        removeEventListeners(): void{
            BC.removeEvent(this);
        }

        destroy(): void{
            this._t?.dispose();
            this._t = this._msg = null;
            this.imgGou.visible && clientCore.MedalManager.setMedal([{id:MedalDailyConst.ONCE_OPEN_BEAR,value:1}]);
            super.destroy();
        }

        private getInfo(): Promise<void>{
            return net.sendAndWait(new pb.cs_bear_puppet_house_get_info()).then((msg:pb.sc_bear_puppet_house_get_info)=>{
                this._msg = msg;
            })
        }

        private onTime(): void{
            let state: number = this.checkTime();
            state != this._state && this.updateView(state);
            if(state == 0){
                let dct: number = clientCore.ServerManager.curServerTime;
                let dat: number = util.TimeUtil.formatTimeStrToSec('2020-9-19 20:00:00'); //预约时间
                this.timeTxt.changeText(util.StringUtils.getDateStr2(dat - dct, '{hour}:{min}:{sec}'));
            }
        }

        private updateView(state: number): void{
            this._state = state;
            this.boxAgree.visible = state == 0;
            this.imgFinish.visible = state != 0;

            this.boxNo.visible = this._msg.isAgree == 0 && state == 0;
            this.boxFinish.visible = this._msg.isAgree == 0 && state != 0;
        }

        private updateAgree(): void{
            this.boxHas.visible = this._msg.isAgree == 1;
            // this.boxNo.visible = this._msg.isAgree == 0;
        }


        /**
         * 检查活动的时间状态
         * @return -1 活动未开启 0-预约时间 1-开始时间 
         */
        private checkTime(): number {
            let dct: number = clientCore.ServerManager.curServerTime;
            let cls: xls.eventControl = xls.get(xls.eventControl).get(73);
            let arr: string[] = cls.eventTime.split("_");
            let dst: number = util.TimeUtil.formatTimeStrToSec(arr[0]);
            let det: number = util.TimeUtil.formatTimeStrToSec(arr[1]);
            let dat: number = util.TimeUtil.formatTimeStrToSec('2020-9-19 20:00:00'); //预约时间
            if (dct < dst || dct > det) return -1;
            if (dct <= dat) return 0;
            return 1;
        }

        private showPrice(box:Laya.Box): void{
            let isOffical: boolean = channel.ChannelControl.ins.isOfficial;
            let min: number = isOffical ? 350 : 500;
            let max: number = isOffical ? 1200 : 1500;

            let price: number = this._msg.agreeCnt <= min ? 450 : (this._msg.agreeCnt>max ? 390 : 420);
            (box.getChildByName('discount') as Laya.Label).changeText(price+'');
        }

        private goMod(): void{
            clientCore.ToolTip.gotoMod(163);
        }

        private onSetup(): void{
            this.imgGou.visible = !this.imgGou.visible;
        }
    }
}