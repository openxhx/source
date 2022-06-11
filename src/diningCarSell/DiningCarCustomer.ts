namespace diningCarSell {
    export class Customer extends ui.diningCarSell.render.CustomerItemUI {
        private _bone: clientCore.Bone;
        /**位置 */
        posIdx: number;
        /**需要的餐品 */
        needFood: number[];
        /**到期的时间 */
        endTime: number;
        /**等待的时间 */
        waitTime: number;
        /**当前npc */
        curNpc: number;
        /**是否游戏 */
        isGame: boolean;
        /**分数 */
        coin: number;
        constructor(flag: boolean = false) {
            super();
            this.isGame = flag;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.width = 342;
            this.height = 362;
        }

        private listRender(item: Laya.Image) {
            let id = item.dataSource;
            item.skin = `res/activity/diningCar/food/${id}.png`;
        }

        public show() {
            this.list.array = this.needFood;
            this.list.repeatX = this.needFood.length;
            this.imgMask.width = 113;
            this.visible = true;
            Laya.timer.loop(1000, this, this.onTimer);
        }

        public setNpc(id: number) {
            this.curNpc = id;
            this._bone = clientCore.BoneMgr.ins.play(`res/battle/role/${id}.sk`, 'idle', true, this);
            this._bone.pos(125, 300);
            this._bone.scaleX = 1.2;
            this._bone.scaleY = 1.2;
        }

        public giveFood(id: number) {
            let index = this.needFood.indexOf(id);
            if (index >= 0) {
                this.needFood.splice(index, 1);
                if (this.needFood.length == 0) {
                    this.visible = false;
                    this._bone?.dispose();
                    this._bone = null;
                    Laya.timer.clear(this, this.onTimer);
                    if (this.isGame) {
                        core.SoundManager.instance.playSound('res/sound/coin.ogg');
                        EventManager.event("DININGCAR_GET_COIN", [this.coin, this.posIdx, this.curNpc]);
                    } else {
                        net.sendAndWait(new pb.cs_breakfast_car_serve_food({ pos: this.posIdx })).then((msg: pb.sc_breakfast_car_serve_food) => {
                            core.SoundManager.instance.playSound('res/sound/coin.ogg');
                            EventManager.event("DININGCAR_GET_COIN", [msg.turnover, this.posIdx, this.curNpc]);
                        })
                    }
                    return 0;
                } else {
                    this.list.array = this.needFood;
                    this.list.repeatX = this.needFood.length;
                    return 1;
                }
            } else {
                return -1;
            }
        }

        private onTimer() {
            if (clientCore.ServerManager.curServerTime >= this.endTime) {
                this.visible = false;
                this._bone?.dispose();
                this._bone = null;
                Laya.timer.clear(this, this.onTimer);
                EventManager.event("DININGCAR_GET_COIN", [0, this.posIdx, this.curNpc]);
            } else {
                let leftTime = this.endTime - clientCore.ServerManager.curServerTime;
                this.imgMask.width = 113 * leftTime / this.waitTime;
            }
        }

        public destroy() {
            this._bone?.dispose();
            this._bone = null;
            this.needFood = null;
            Laya.timer.clear(this, this.onTimer);
            super.destroy();
        }
    }
}