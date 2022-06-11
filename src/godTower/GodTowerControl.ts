namespace godTower {
    export class GodTowerControl implements clientCore.BaseControl {
        /** 面板信息*/
        public getInfo(): Promise<pb.sc_get_tower_draw_info> {
            return net.sendAndWait(new pb.cs_get_tower_draw_info()).then((msg: pb.sc_get_tower_draw_info) => {
                return Promise.resolve(msg);
            });
        }

        /** 点击抽奖*/
        public drawBox(_posId: number, handler: Laya.Handler){
            net.sendAndWait(new pb.cs_tower_draw_box({ posId: _posId })).then((msg: pb.sc_tower_draw_box) => {
                handler?.runWith(msg);
            });
        }

        /** 额外奖励*/
        public otherReward(index: number, handler: Laya.Handler){
            net.sendAndWait(new pb.cs_tower_draw_get_extra({ index: index })).then((msg: pb.sc_tower_draw_get_extra) => {
                handler?.runWith(msg);
            });
        }
    }
}