namespace clientCore {

    export enum REG_ENUM {
        /** 首充礼包*/
        FIRST_RECHARGE_GIFT = 1,
        /**三日礼包 */
        THREE_DAY_GIFT = 2
    }

    /**
     * huabutton的自动消亡管理
     */
    export class RegRemoveManager {

        private static _regMap: util.HashMap<component.HuaButton>;

        constructor() { }

        public static setup(): void {
            this._regMap = new util.HashMap<component.HuaButton>();
            EventManager.on(globalEvent.REG_REMOVE, this, this.onReg);
        }

        private static onReg(key: number, value: component.HuaButton): void {
            switch (key) {
                case REG_ENUM.FIRST_RECHARGE_GIFT: //首充礼包
                    net.sendAndWait(new pb.cs_get_first_recharge_gift_info()).then((msg: pb.sc_get_first_recharge_gift_info) => { //获取信息
                        if (msg.buyStatus == 1 && msg.rewardStatus == 1) {
                            value.destory();
                            value = null;
                        } else {
                            this._regMap.add(key, value);
                        }
                    })
                    break;
                // case REG_ENUM.THREE_DAY_GIFT:
                //     net.sendAndWait(new pb.cs_get_login_activity_status()).then((data: pb.sc_get_login_activity_status) => {
                //         //第三天奖励已领取
                //         if (util.getBit(data.flag, 3) == 1)
                //             value.destory();
                //         else
                //             this._regMap.add(key, value);
                            
                //     })
                //     break;
                default:
                    break;
            }
        }


        public static remove(key: REG_ENUM): void {
            let value: component.HuaButton = this._regMap.remove(key);
            value && value.destory();
        }
    }
}