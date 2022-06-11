namespace nationalDayGift {
    /**
     * 礼包
     * 十一福利
     * nationalDayGift.NationalDayGiftModule
     * 2021.9.30
     */
    export class NationalDayGiftModule extends ui.nationalDayGift.NationalDayGiftModuleUI {
        private addUpDay: number;
        private rewarded: number;


        init() {
            this.addPreLoad(this.getAddUpDay());
        }

        onPreloadOver() {

        }

        addEventListeners() {
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['btnReceive' + i], Laya.Event.CLICK, this, this.onReceive, [i]);
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

        private getAddUpDay() {
            return net.sendAndWait(new pb.cs_ten_one_welfare_info()).then((data: pb.sc_ten_one_welfare_info) => {
                this.addUpDay = data.day;
                this.rewarded = data.reward;
                this.upDataUI();
            });
        }
        /**更新UI面板*/
        private upDataUI(): void {
            for (let i = 0; i < 3; i++) {
                this['btnReceive' + i].disabled = true;
                this['imgReceive' + i].visible = false;
            }
            for (let i = 1; i <= Math.min(this.addUpDay, 3); i++) {
                if (util.getBit(this.rewarded,i) == 1) {
                    this['imgReceive' + (i - 1)].visible = true;
                    this['btnReceive' + (i - 1)].visible = false;
                } else {
                    this['btnReceive' + (i - 1)].disabled = false;
                }
            }
        }

        /**点击事件 */
        private onReceive(days: number): void {
            net.sendAndWait(new pb.cs_ten_one_welfare_reward({ day: days + 1 })).then((data: pb.sc_ten_one_welfare_reward) => {
                alert.showReward(data.item);
                this.getAddUpDay();
            })
        }



    }
}