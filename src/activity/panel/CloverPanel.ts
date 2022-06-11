namespace activity {
    /**
     * 领取体力
     */
    export class CloverPanel extends ActivityBasePanel<ui.activity.panel.CloverPanelUI>{

        private _wait: boolean;

        addEvent() {
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this.ui["btn" + i], Laya.Event.CLICK, this, this.onGet, [i]);
            }
            this.show();
        }

        removeEvent() {
            BC.removeEvent(this);
        }

        async show(): Promise<void> {
            this._wait = true;
            //每日领奖
            this.setBtnStatus(this.ui.btn1, await this.checkDaily());
            //上下午领奖
            net.sendAndWait(new pb.cs_get_strength_activity_status()).then((msg: pb.sc_get_strength_activity_status) => {
                this._wait = false;
                this.checkTime2(msg.status);
            })
        }

        /**
         * 领取奖励
         * @param type 1-每日奖励 2-上午 3-下午
         */
        private onGet(type: number): void {
            if (this._wait) {
                alert.showFWords("系统初始化中，请稍后~");
                return;
            }

            let btn: component.HuaButton = this.ui["btn" + type];
            let wait: any;
            if (type == 1) {
                wait = net.sendAndWait(new pb.cs_get_daily_strength_reward());
            } else if (btn.fontSkin == "commonBtn/btn_get.png") {
                wait = net.sendAndWait(new pb.cs_get_strength_activity_reward());
            } else {
                wait = net.sendAndWait(new pb.cs_replacement_strength_activity_reward({ type: type - 1 }));
            }

            wait.then((data) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.items), "恭喜获得：");
                this.setBtnStatus(btn, 1);
                this.checkRedPoint();
            })
        }

        private checkRedPoint(): void {
            util.RedPoint.reqRedPointRefresh(3303);
        }

        private checkDaily(): Promise<number> {
            return new Promise((suc) => {
                net.sendAndWait(new pb.cs_get_daily_strength_status()).then((msg: pb.sc_get_daily_strength_status) => {
                    suc(msg.status);
                    util.RedPoint.reqRedPointRefresh(3303);
                })
            })
        }

        /** 检查是否在活动时间*/
        private checkTime(time: number): number {
            let t: number = clientCore.ServerManager.curServerTime;
            let y: string = util.TimeUtil.analysicYear(t);
            let array: string[] = clientCore.GlobalConfig.getPhysicalTime.split("/");
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let element: string = array[i];
                let arr: string[] = element.split("_");
                let upTime: number = new Date(y + " " + arr[0]).getTime() / 1000;
                let downTime: number = new Date(y + " " + arr[1]).getTime() / 1000;
                if (upTime <= time && downTime >= time) {
                    return i;
                }
            }
            return -1;
        }

        /**
         * 检查状态
         * @param status 0-都没领 1-只领了上午 2-只领了下午 3-都领了
         */
        private checkTime2(status: number): void {
            let t: number = clientCore.ServerManager.curServerTime;
            let y: string = util.TimeUtil.analysicYear(t);
            let array: string[] = clientCore.GlobalConfig.getPhysicalTime.split("/");
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let element: string = array[i];
                let arr: string[] = element.split("_");
                // let upTime: number = new Date(y + " " + arr[0]).getTime() / 1000;
                // let downTime: number = new Date(y + " " + arr[1]).getTime() / 1000;
                let upTime: number = util.TimeUtil.formatTimeStrToSec(y + " " + arr[0]);
                let downTime: number = util.TimeUtil.formatTimeStrToSec(y + " " + arr[1]);
                if (upTime <= t && downTime >= t) {
                    let stc: number = i == status - 1 || status == 3 ? 1 : 0;
                    this.setBtnStatus(this.ui["btn" + (i + 2)], stc);
                } else if (t < upTime) {
                    this.setBtnStatus(this.ui["btn" + (i + 2)], 3);
                } else if (t > downTime) {
                    let stc: number = i == status - 1 || status == 3 ? 1 : 2;
                    this.setBtnStatus(this.ui["btn" + (i + 2)], stc);
                }
            }
        }

        /**
         * 设置按钮状态
         * @param btn 
         * @param type 
         */
        private setBtnStatus(btn: component.HuaButton, type: number): void {
            btn.width = 135;
            btn.disabled = false;
            switch (type) {
                case 0: //领取
                    btn.fontX = 42;
                    btn.fontY = 20;
                    btn.fontSkin = "commonBtn/btn_get.png";
                    break;
                case 1: //已领取
                    btn.fontX = 30;
                    btn.fontY = 20;
                    btn.fontSkin = "commonBtn/btn_yilinqu.png";
                    btn.disabled = true;
                    break;
                case 2: //10神叶领取
                    btn.width = 151;
                    btn.fontX = 15;
                    btn.fontY = 10;
                    btn.fontSkin = "commonBtn/btn_bulin2.png";
                    break;
                case 3: //不可领取
                    btn.fontX = 15;
                    btn.fontY = 20;
                    btn.fontSkin = "commonBtn/btn_bulin.png";
                    btn.disabled = true;
                    break;
                default:
                    break;
            }
        }

    }
}