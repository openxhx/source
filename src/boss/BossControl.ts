namespace boss {

    export class BossControl implements clientCore.BaseControl {

        constructor() { }

        /** 激励*/
        public excitation(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_inspire_npc_for_world_boss()).then(() => { handler && handler.run(); })
        }

        /** 获取伤害排行*/
        public damageRank(): Promise<pb.sc_get_world_boss_damage_rank> {
            return net.sendAndWait(new pb.cs_get_world_boss_damage_rank()).then((data: pb.sc_get_world_boss_damage_rank) => {
                return Promise.resolve(data);
            }).catch(() => {
                return Promise.resolve(null);
            })
        }

        /**
         * 对boss造成伤害
         * @param times 
         */
        public attackBoss(times: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_attack_world_boss_by_counts({ counts: times })).then((msg: pb.sc_attack_world_boss_by_counts) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.items));
                // _.forEach(msg.items, (element) => { alert.showFWords(`获得：${clientCore.ItemsInfo.getItemName(element.itemId)} x${element.itemCnt}`); })
                handler && handler.runWith(msg);
            })
        }

        /** 攻击boss*/
        public fightBoss(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_attack_world_boss()).then((msg: pb.sc_attack_world_boss) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.items));
                // _.forEach(msg.items, (element) => { alert.showFWords(`获得：${clientCore.ItemsInfo.getItemName(element.itemId)} x${element.itemCnt}`); })
                handler && handler.runWith(msg);
            })
        }

        /** 清理cd*/
        public clearCd(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_clear_world_boss_wait_time()).then(() => {
                handler && handler.run();
            });
        }

        /** 与boss交谈*/
        public talk(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_talk_with_semon()).then((msg: pb.sc_talk_with_semon) => {
                // alert.showReward(clientCore.GoodsInfo.createArray(msg.itms));
                handler && handler.runWith(msg);
            });
        }

        /**
         * 物品合成
         * @param id 将要合成的物品id 
         */
        public synthesis(id: number): void {
            net.sendAndWait(new pb.cs_common_merge_item({ id: id })).then((msg: pb.sc_common_merge_item) => {
                alert.showReward(clientCore.GoodsInfo.createArray([msg.item]));
            });
        }
    }
}