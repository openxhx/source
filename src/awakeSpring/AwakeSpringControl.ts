namespace awakeSpring {
    export class AwakeSpringControl implements clientCore.BaseControl {
        sign: number;
        constructor() { }
        getInfo(): Promise<void> {
            return net.sendAndWait(new pb.cs_new_spring_panel()).then((msg: pb.sc_new_spring_panel) => {
                let model: AwakeSpringModel = clientCore.CManager.getModel(this.sign) as AwakeSpringModel;
                model.initMsg(msg);
            });
        }

        /**
         * 收获春雨
         * @param handler 
         */
        getRain(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_new_spring_get_rain()).then((msg: pb.sc_new_spring_get_rain) => {
                if (msg.items.length > 0) {
                    alert.showReward(msg.items);
                    let model: AwakeSpringModel = clientCore.CManager.getModel(this.sign) as AwakeSpringModel;
                    model.rainTime = msg.rainTimeStamp;
                    handler?.run();
                }
            });
        }

        /**
         * 兑换衣服
         * @param pos 
         * @param id 
         * @param handler 
         */
        exchangeReward(pos: number, id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_new_spring_exchange_cloth({ pos: pos, id: id })).then((msg: pb.sc_new_spring_exchange_cloth) => {
                alert.showReward(msg.items);
                handler?.run();
            });
        }

        /**
         * 特殊奖励兑换
         * @param id 
         * @param mod 
         */
        exchange(id: number, mod: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_common_exchange({ exchangeId: id, activityId: mod })).then((msg: pb.sc_common_exchange) => {
                alert.showReward(msg.item);
                handler?.run();
            })
        }
    }
}