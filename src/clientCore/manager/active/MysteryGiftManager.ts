namespace clientCore {
    /**
     * 神秘的礼物全局管理
     */
    export class MysteryGiftManager {
        /**当前事件 */
        private curEvent: number;
        /**事件参数 */
        private eventParam: number;
        /**今日已交互次数 */
        public eventTimes: number;
        /**今日已更换次数 */
        public changeTimes: number;
        /**礼盒坐标 */
        private allpos: xls.pair[] = [
            { v1: 901, v2: 1191 },
            { v1: 917, v2: 655 },
            { v1: 1690, v2: 1072 },
            { v1: 2748, v2: 658 },
            { v1: 1110, v2: 1450 }
        ]
        /**礼盒实例 */
        private giftBox: Laya.Image;
        private giftAni: clientCore.Bone;

        /**
         * 获得活动信息
         */
        public async setup() {
            if (clientCore.SystemOpenManager.ins.checkActOver(195)) {
                return;
            }
            await net.sendAndWait(new pb.cs_mystical_gift_info()).then((msg: pb.sc_mystical_gift_info) => {
                this.curEvent = msg.game;
                this.eventParam = msg.index;
                this.eventTimes = msg.time;
            })
            let msg = await MedalManager.getMedal([MedalDailyConst.MYSTERY_GIFT_CHANGED]);
            this.changeTimes = msg[0].value;
            net.listen(pb.sc_mystical_gift_finish_notify, this, this.OnEventFinish);
            EventManager.on(globalEvent.ENTER_MAP_SUCC, this, this.ShowGiftBox);
        }

        /**展示礼盒 */
        public ShowGiftBox() {
            if (LocalInfo.userLv < 8) return;
            if (!this.giftBox) {
                this.giftBox = new Laya.Image();
                this.giftBox.width = 133;
                this.giftBox.height = 166;
                this.giftBox.mouseEnabled = true;
                this.giftBox.mouseThrough = false;
                this.giftBox.visible = false;
                MapManager.mapItemsLayer.addChildAt(this.giftBox, 0);
                this.giftAni = clientCore.BoneMgr.ins.play('res/animate/mysteryGift/gift.sk', 0, true, this.giftBox);
                this.giftAni.pos(66, 130);
                BC.addEvent(this, this.giftBox, Laya.Event.CLICK, this, this.ShowEventPanel);
                this.giftBox.visible = false;
            }
            if (this.eventTimes < 20 && MapInfo.mapID == 12) {
                MapManager.mapItemsLayer.addChildAt(this.giftBox, 0);
                let idx = Math.floor(Math.random() * this.allpos.length);
                this.giftBox.pos(this.allpos[idx].v1, this.allpos[idx].v2);
                this.giftBox.visible = true;
            } else {
                this.giftBox.visible = false;
            }
        }

        /**
         * 获取事件信息
         */
        public async GetEventInfo() {
            if (!this.curEvent) {
                this.curEvent = Math.floor(Math.random() * 3) + 1;
                await this.SendEventToServer();
            }
            return Promise.resolve({ type: this.curEvent, param: this.eventParam });
        }

        /**更换事件 */
        public async ChangeEvent() {
            let change = Math.floor(Math.random() * 2) + 1;
            this.curEvent = this.curEvent + change;
            if (this.curEvent > 3) this.curEvent = this.curEvent % 3;
            await this.SendEventToServer();
            MedalManager.setMedal([{ id: MedalDailyConst.MYSTERY_GIFT_CHANGED, value: ++this.changeTimes }]);
            return Promise.resolve({ type: this.curEvent, param: this.eventParam });
        }

        private async SendEventToServer() {
            if (this.curEvent == 1)//交付材料
                this.eventParam = Math.floor(Math.random() * 8);
            else if (this.curEvent == 2) {//小游戏
                let games = [3, 7, 12, 13];
                let game = games[Math.floor(Math.random() * 4)];
                let level = Math.floor(Math.random() * 3) + 1;
                this.eventParam = game * 100 + level;
            } else {//打小怪
                this.eventParam = 0;
            }
            await net.sendAndWait(new pb.cs_get_mystical_gift_game({ game: this.curEvent, id: this.eventParam }));
        }

        /**
         * 事件完成
         */
        private OnEventFinish(msg: pb.sc_mystical_gift_finish_notify) {
            this.curEvent = 0;
            this.eventParam = 0;
            this.eventTimes = msg.time;
            if (this.eventTimes < 20 && this.giftBox.visible) {
                let idx = Math.floor(Math.random() * this.allpos.length);
                this.giftBox.pos(this.allpos[idx].v1, this.allpos[idx].v2);
            } else {
                this.giftBox.visible = false;
            }
        }

        /**
         * 触发事件
         */
        private async ShowEventPanel() {
            if (this.eventTimes >= 20) {
                alert.showFWords("今日次数已达上限~");
                return;
            }
            clientCore.Logger.sendLog('2021年9月24日活动', '【主活动】神秘的礼物', '点击场景中礼包');
            let data = await this.GetEventInfo();
            ModuleManager.open("mysteryGiftEvent.MysteryGiftEventModule",data);
        }

        private constructor() { }
        private static _slef: MysteryGiftManager;
        public static get ins(): MysteryGiftManager {
            if (!this._slef) this._slef = new MysteryGiftManager();
            return this._slef;
        }
    }
}