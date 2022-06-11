namespace tigerYearSign {
    /**
     * 虎年签到
     * tigerYearSign.TigerYearSignModule
     * 2021.10.28
     */
    export class TigerYearSignModule extends ui.tigerYearSign.TigerYearSignUI {
        private addUpDay: number;
        private rewarded: number;
        private rewardArr:xls.pair[] = [];

        init() {
            this.addPreLoad(xls.load(xls.continueLogin));
            this.getAddUpDay();
        }

        onPreloadOver() {
            let xlsInfo = xls.get(xls.continueLogin);
            for(let i=0 ; i<=4 ; i++){
                let reward = clientCore.LocalInfo.sex == 1 ? xlsInfo.get(i+15).reward : xlsInfo.get(i+15).rewardMale;
                this.rewardArr = this.rewardArr.concat(reward);
                for(let j=0 ; j<4 ; j++){
                    this["item" + (i*4+j)].skin = `${clientCore.ItemsInfo.getItemIconUrl(reward[j].v1)}`;
                    this["num" + (i*4+j)].text = `X${reward[j].v2}`;
                }
            }
            this.suitImg.skin = clientCore.LocalInfo.sex== 1 ? 'unpack/tigerYearSign/nv.png' : 'unpack/tigerYearSign/nan.png';
        }

        addEventListeners() {
            for (let i = 0; i < 5; i++) {
                BC.addEvent(this, this['btnReceive' + i], Laya.Event.CLICK, this, this.onReceive, [i]);
            }
            for(let i=0 ; i<=19 ; i++){
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
            clientCore.ToolTip.showTips(this["item" + i], {id: this.rewardArr[i].v1});
        }

        private getAddUpDay() {
            return net.sendAndWait(new pb.cs_spring_sign_info()).then((data: pb.sc_spring_sign_info) => {
                this.addUpDay = data.sign;
                this.rewarded = data.receive;
                this.upDataUI();
            });
        }
        /**更新UI面板*/
        private upDataUI(): void {
            for (let i = 0; i < 5; i++) {
                this['btnReceive' + i].disabled = true;
            }
            for (let i = 1; i <= Math.min(this.addUpDay, 5); i++) {
                if (util.getBit(this.rewarded, i) == 1) {
                    this['btnReceive' + (i - 1)].skin = 'tigerYearSign/yilingqu.png';
                    this['btnReceive' + (i - 1)].gray = false;
                    this['btnReceive' + (i - 1)].mouseEnabled = false;
                } else {
                    this['btnReceive' + (i - 1)].skin = 'tigerYearSign/btn_sxzl  .png';
                    this['btnReceive' + (i - 1)].disabled = false;
                }
            }
        }

        /**点击事件 */
        private onReceive(days: number): void {
            net.sendAndWait(new pb.cs_spring_sign_reward({ index: days + 1 })).then((data: pb.sc_spring_sign_reward) => {
                alert.showReward(data.item);
                this.getAddUpDay();
            })
        }



    }
}