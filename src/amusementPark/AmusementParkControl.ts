namespace amusementPark {
    export class AmusementParkControl implements clientCore.BaseControl {
        public model: AmusementParkModel;

        /** 获取游戏进度*/
        public getGameOpen(type: number, thenHandler?: Laya.Handler, catchHandler?: Laya.Handler) {
            net.sendAndWait(new pb.cs_mini_game_collect_panel({ type: type })).then((msg: pb.sc_mini_game_collect_panel) => {
                if (this.model) {
                    this.model.setGameOpen(type, msg.progress);
                }
                thenHandler?.runWith(msg);
            }).catch(() => {
                catchHandler?.run();
            });
        }

        public dispose(): void {
            this.model = null;
        }
    }
}