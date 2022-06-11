namespace clientCore {
    /**
     * 复苏之春
     */
    export class AwakeSpringManager {
        /**领取时间戳 */
        private getRainTime: number;
        /**是否已经在计时 */
        private isTime: boolean;

        /**今天唤醒次数 */
        public awakeCnt: number;

        /**动物们 */
        private animals: SleepingAnimal[];
        /**当前动物 */
        private curAnimal: SleepingAnimal;
        constructor() { }

        public async setup() {
            let msg = await this.getInfo();
            this.getRainTime = msg.rainTimeStamp;
            this.awakeCnt = msg.foundTimes;
            let curRain = Math.floor((clientCore.ServerManager.curServerTime - this.getRainTime) / 600);
            if (curRain < 30) {
                this.isTime = true;
                let dis = this.getRainTime + 60 * 10 * 30 - clientCore.ServerManager.curServerTime;
                Laya.timer.once(dis * 1000, this, this.checkRedPoint);
            } else {
                this.isTime = false;
            }
        }

        private getInfo() {
            return net.sendAndWait(new pb.cs_new_spring_panel()).then((msg: pb.sc_new_spring_panel) => {
                return Promise.resolve(msg);
            });
        }

        public onRainBack(time: number) {
            util.RedPoint.reqRedPointRefresh(23501);
            this.getRainTime = time;
            let dis = this.getRainTime + 60 * 10 * 30 - clientCore.ServerManager.curServerTime;
            if (this.isTime) Laya.timer.clear(this, this.checkRedPoint);
            Laya.timer.once(dis * 1000, this, this.checkRedPoint);
        }

        private checkRedPoint() {
            util.RedPoint.reqRedPointRefresh(23501);
            this.isTime = false;
        }

        public addAnimalToMap(mapid: number) {
            let positions = [];
            if (mapid == 11) positions = [693, 909, 1930, 1014, 1998, 594, 2487, 455, 2417, 909];
            else positions = [663, 1250, 2783, 1029, 1089, 984, 2433, 1401, 1254, 1251];
            let cnt = 5 - this.awakeCnt;
            cnt = Math.min(cnt, 3);
            this.animals = [];
            for (let i = 0; i < cnt; i++) {
                let idx = Math.floor(Math.random() * positions.length / 2);
                let type = Math.ceil(Math.random() * 3);
                let x = positions.splice(idx * 2, 1)[0];
                let y = positions.splice(idx * 2, 1)[0];
                let animal = new SleepingAnimal(x, y);
                animal.loadImg(type);
                MapManager.curMap.pickLayer.addChild(animal);
                this.animals.push(animal);
                BC.addEvent(this, animal, Laya.Event.CLICK, this, this.onAnimalClick, [i]);
            }
        }

        private onAnimalClick(idx: number) {
            if (MapManager.isPickingMapItem) {
                alert.showFWords("采集中…………");
                return;
            }
            this.curAnimal = this.animals[idx];
            ModuleManager.open("awakeSpringGame.AwakeSpringGameModule", this.curAnimal.ani_type);
        }

        public removeCurAni() {
            this.curAnimal.destroy();
        }

        public removeAllAni() {
            if (!this.animals) return;
            for (let i = 0; i < this.animals.length; i++) {
                this.animals[i]?.destroy();
            }
            this.animals = [];
        }

        private static _ins: AwakeSpringManager;
        public static get ins(): AwakeSpringManager {
            return this._ins || (this._ins = new AwakeSpringManager());
        }
    }
}