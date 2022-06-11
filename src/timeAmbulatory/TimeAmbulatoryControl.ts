namespace timeAmbulatory {
    export class TimeAmbulatoryControl implements clientCore.BaseControl {
        public _model: TimeAmbulatoryModel;

        public readonly redPointId: number = 15401;     //红点id

        /**面板信息 */
        public getInfo() {
            return net.sendAndWait(new pb.cs_taobao_festival_get_info()).then((msg: pb.sc_taobao_festival_get_info) => {
                return Promise.resolve(msg);
            });
        }

        /** 获取翻牌子信息*/
        public openCardInfo(id: number): Promise<pb.sc_common_open_card_get_info> {
            return net.sendAndWait(new pb.cs_common_open_card_get_info({ id: id })).then((msg: pb.sc_common_open_card_get_info) => {
                return Promise.resolve(msg);
            })
        }

        /** 重置*/
        public resetCard(id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_common_open_card_reset_card({ id: id })).then((msg: pb.sc_common_open_card_reset_card) => {
                handler?.runWith([msg.cardInfo]);
            })
        }

        /** 翻牌子*/
        public openCard(id: number, pos: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_common_open_card_divine({ id: id, cardPos: pos })).then((msg: pb.sc_common_open_card_divine) => {
                handler?.runWith(msg);
            }).catch(() => {
                handler?.run();
            })
        }

        /** 领取背景秀*/
        public reqBg(id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_common_open_card_get_reward({ id: id })).then((msg: pb.sc_common_open_card_get_reward) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.itms));
                handler?.run();
            })
        }

        /**领取奖励 
         * 1 领取活跃值奖励  2 领取累计消耗奖励
         */
        public getReward(type: number, index: number) {
            return net.sendAndWait(new pb.cs_taobao_festival_get_reward({ flag: type, index: index })).then((msg: pb.sc_taobao_festival_get_reward) => {
                return Promise.resolve(msg);
            });
        }

        /**获取晃一晃能量值 */
        public getEnergyInfo() {
            return net.sendAndWait(new pb.cs_taobao_festival_get_energy_cnt()).then((msg: pb.sc_taobao_festival_get_energy_cnt) => {
                return Promise.resolve(msg);
            });
        }
    }
}