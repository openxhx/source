namespace dailyReward{
    /**
     * 每日礼盒
     * dailyReward.DailyRewardModule
     */
    export class DailyRewardModule extends ui.dailyReward.DailyRewardModuleUI{

        /** 已领奖的天数*/
        private _rewardDay: number;
        /** 当前天数*/
        private _currentDay: number;

        constructor(){ super(); }
        init(): void{
            this.addPreLoad(xls.load(xls.continueLogin));
            this.addPreLoad(net.sendAndWait(new pb.cs_get_daliy_gift_box_panel()).then((msg: pb.sc_get_daliy_gift_box_panel)=>{ 
                this._rewardDay = msg.getRewardDays;
                this._currentDay = msg.loginDays;
            }));
        }
        addEventListeners(): void{
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.onReward);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        onPreloadOver(): void{
            _.forEach(xls.get(xls.continueLogin).getValues(),(element: xls.continueLogin,index: number)=>{
                if(index == 4){
                    _.forEach(clientCore.LocalInfo.sex == 1 ? element.reward : element.rewardMale, (data: xls.pair,i: number)=>{
                        this.initItem(data,index + i + 1);
                    })
                }else{
                    this.initItem(clientCore.LocalInfo.sex == 1 ? element.reward[0] : element.rewardMale[0], index + 1);
                }
            })
            this.updateStatus();
        }

        private initItem(data: xls.pair, index: number): void{
            let img: Laya.Image = this[`ico_${index}`];
            img.skin = clientCore.ItemsInfo.getItemIconUrl(data.v1);
            this[`txNum_${index}`].text = `x${data.v2}`;
            BC.addEvent(this, img, Laya.Event.CLICK, this, ()=>{ clientCore.ToolTip.showTips(img, {id: data.v1}); });
        }

        /**
         * 更新领取状态
         * @param index 
         * @param has 
         */
        private updateStatus(): void{
            for(let i:number = 1; i<6; i++){
                this[`imgHas_${i}`].visible = i <= this._rewardDay;
            }
            this.btnReward.visible = this._rewardDay < 5;
            if(this.btnReward.visible){
                this.btnReward.fontSkin = this._rewardDay < this._currentDay ? 'dailyReward/s_y_Reward.png' : 'dailyReward/s_y_back tomorrow.png';
            }
        }

        private onReward(): void{
            if(this._rewardDay < this._currentDay){
                net.sendAndWait(new pb.cs_get_daliy_gift_box_reward()).then((msg: pb.sc_get_daliy_gift_box_reward)=>{
                    alert.showReward(msg.items);
                    this._rewardDay = this._currentDay;
                    this.updateStatus();
                });
            }
        }
    }
}