namespace halloweenGift {
    /**
     * 礼包
     * 万圣福利
     * halloweenGift.HalloweenGiftModule
     * 2021.10.28
     */
    export class HalloweenGiftModule extends ui.halloweenGift.HalloweenGiftModuleUI {
        private addUpDay: number;
        private rewarded: number;
        private rewardArr:number[] = [9900281 , 9900277 , 1900053 , 3800067 ,
                                      9900281 , 9900277 , 111101 , 1900053 , 
                                      9900281 , 9900277 , 1000166 , 3500094];

        init() {
            if(clientCore.LocalInfo.sex == 2){
                this.rewardArr[6] = 111111;
            }
            for(let i=0 ; i<12 ; i++){
                this["item" + i].skin = `${clientCore.ItemsInfo.getItemIconUrl(this.rewardArr[i])}`;
            }
            this.getAddUpDay();
        }

        onPreloadOver() {

        }

        addEventListeners() {
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['btnReceive' + i], Laya.Event.CLICK, this, this.onReceive, [i]);
            }
            for(let i=0 ; i<12 ; i++){
                BC.addEvent(this, this["item" + i], Laya.Event.CLICK, this, this.ShowItemTip , [i]);
            }
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);

        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            EventManager.event('CumulativeLoginClose');//通知强弹
        }

        private ShowItemTip(i:number) {
            clientCore.ToolTip.showTips(this["item" + i], {id: this.rewardArr[i]});
        }

        private getAddUpDay() {
            return net.sendAndWait(new pb.cs_halloween_welfare_info()).then((data: pb.sc_halloween_welfare_info) => {
                this.addUpDay = data.day;
                this.rewarded = data.reward;
                this.upDataUI();
            });
        }
        /**更新UI面板*/
        private upDataUI(): void {
            for (let i = 0; i < 3; i++) {
                this['btnReceive' + i].disabled = true;
            }
            for (let i = 1; i <= Math.min(this.addUpDay, 3); i++) {
                if (util.getBit(this.rewarded, i) == 1) {
                    this['btnReceive' + (i - 1)].skin = 'halloweenGift/btn_yilingqu.png';
                    this['btnReceive' + (i - 1)].gray = false;
                    this['btnReceive' + (i - 1)].mouseEnabled = false;
                } else {
                    this['btnReceive' + (i - 1)].skin = 'halloweenGift/btn_sxzl.png';
                    this['btnReceive' + (i - 1)].disabled = false;
                }
            }
        }

        /**点击事件 */
        private onReceive(days: number): void {
            net.sendAndWait(new pb.cs_halloween_welfare_reward({ day: days + 1 })).then((data: pb.sc_halloween_welfare_reward) => {
                alert.showReward(data.item);
                this.getAddUpDay();
            })
        }



    }
}