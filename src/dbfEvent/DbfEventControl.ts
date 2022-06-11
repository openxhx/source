namespace dbfEvent {
    export class DbfEventControl implements clientCore.BaseControl {
        /** 面板信息*/
        public getEventInfo(): Promise<pb.sc_get_dragon_boat_festival_info> {
            return net.sendAndWait(new pb.cs_get_dragon_boat_festival_info()).then((msg: pb.sc_get_dragon_boat_festival_info) => {
                return Promise.resolve(msg);
            });
        }

        /**玩家观看剧情 */
        public watchStory() {
            net.sendAndWait(new pb.cs_watch_dragon_boat_festival_story());
        }

        /**
         * 购买食材包
         * @param type 0菖蒲叶购买 1货币购买
         */
        public buyMaterials(type: number) {
            return net.sendAndWait(new pb.cs_dragon_boat_festival_buy_food_materials({ type: type })).then((msg: pb.sc_dragon_boat_festival_buy_food_materials) => {
                return Promise.resolve(msg);
            });
        }
    }
}