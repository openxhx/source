namespace clientCore {

    export class ChrismasInteractManager {
        public static isSnowMan: boolean;
        //今天得到的数量
        public static curCount: number;

        /**
         * 获得活动信息
         */
        public async setup() {
            if (clientCore.SystemOpenManager.ins.checkActOver(216)) {
                return;
            }
            await net.sendAndWait(new pb.cs_christmas_greetings_info()).then((msg: pb.sc_christmas_greetings_info) => {
                ChrismasInteractManager.curCount = msg.num;
            })
            await res.load("res/animate/chrismasInteract/snowman.png");
            await res.load("res/animate/chrismasInteract/clear.png");
            this.listenServer();
        }

        private listenServer() {
            net.listen(pb.sc_christmas_greetings_snowman_notify, this, this.onChangeSnowman);
            net.listen(pb.sc_christmas_greetings_clean_notify, this, this.onClearSnowman);
            EventManager.on(globalEvent.ON_OVER_DAY, this, this.reset);
        }

        private reset() {
            ChrismasInteractManager.curCount = 0;
        }

        private onChangeSnowman(msg: pb.sc_christmas_greetings_snowman_notify) {
            this.showSnowMan(msg.uid, true);
        }

        private onClearSnowman(msg: pb.sc_christmas_greetings_clean_notify) {
            this.showSnowMan(msg.uid, false);
        }

        public showSnowMan(uid: number, flag: boolean) {
            let player: PersonUnit;
            if (uid == LocalInfo.uid) {
                player = PeopleManager.getInstance().player;
                LocalInfo.onLimit = flag;
            } else {
                player = PeopleManager.getInstance().getOther(uid);
            }
            if (!player) return;
            if (flag) {
                player.showSnowman();
            } else if (player._isSnowMan) {
                player.hideSnowman();
            }
        }
        private constructor() { }
        private static _slef: ChrismasInteractManager;
        public static get ins(): ChrismasInteractManager {
            if (!this._slef) this._slef = new ChrismasInteractManager();
            return this._slef;
        }
    }
}