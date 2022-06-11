
namespace clientCore {
    export class BuildQueueManager {
        public static elfInfoHash: util.HashMap<SpriteBuildQueueInfo>;

        private static uiList: Laya.List;

        public static init(uiList: Laya.List) {
            this.uiList = uiList;
            this.elfInfoHash = new util.HashMap();
            uiList.renderHandler = new Laya.Handler(this, this.onElfRender);
            net.listen(pb.sc_build_spirit_info_noitfy, this, this.onSpriteQueueInfoBack);
            net.sendAndWait(new pb.cs_get_spirit_info({}))
                .then((data: pb.sc_get_spirit_info) => {
                    this.handleQueueInfo(data);
                }).catch(() => { });
            Laya.timer.loop(1000, this, this.onTimer);
        }

        public static get allEnergy() {
            return _.reduce(this.elfInfoHash.getValues(), (prev: number, v: SpriteBuildQueueInfo) => {
                return prev + v.num;
            }, 0);
        }

        public static get allInfos() {
            return this.elfInfoHash.getValues();
        }

        public static getInfoById(id: number) {
            return this.elfInfoHash.get(id);
        }

        private static onSpriteQueueInfoBack(data: pb.sc_get_spirit_info) {
            this.handleQueueInfo(data);
        }

        private static handleQueueInfo(data: pb.sc_get_spirit_info) {
            this.elfInfoHash.clear();
            for (const srvData of data.sInfo) {
                this.elfInfoHash.add(srvData.id, new SpriteBuildQueueInfo(srvData));
            }
            this.uiList.dataSource = new Array(3);
            this.uiList.startIndex = this.uiList.startIndex;
        }

        private static onElfRender(cell: ui.main.render.spriteBuildQueueUI, idx: number) {
            let info: SpriteBuildQueueInfo | undefined = this.getInfoById(idx + 1);
            let progress = info ? (info.num / info.total) : 0;
            cell.imgMask.y = (1 - progress) * 28;
            cell.imgBar.visible = idx != 2;
            cell.imgLock.visible = !info;
        }

        private static onTimer() {
            this.uiList.startIndex = this.uiList.startIndex;
        }

        public static unlock(id: number) {
            return net.sendAndWait(new pb.cs_unlock_spirit({ idx: id })).then((data: pb.sc_unlock_spirit) => {
                if (this.elfInfoHash.has(id))
                    this.elfInfoHash.get(data.sInfo.id).srvInfo = data.sInfo;
                else
                    this.elfInfoHash.add(data.sInfo.id, new SpriteBuildQueueInfo(data.sInfo));
            })
        }

        public static buySpirit(id: number) {
            return net.sendAndWait(new pb.cs_buy_spirit({ idx: id })).then((data: pb.sc_buy_spirit) => {
                let info = this.elfInfoHash.get(id);
                info.srvInfo.remain = info.srvInfo.total;
            })
        }
    }
}