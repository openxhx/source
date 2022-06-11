namespace clientCore {

    export class CoolBeachImageManager {
        private static _ins: CoolBeachImageManager;

        public images: pb.ICoolInfo[];
        public redBagGotId: number[];

        public txtArr:string[] = ['夏日炎炎正好眠！','冰爽到底就是我！','清凉夏日心感动！','话不多说就选我！','选我会有西瓜吃！','我就是你的空调！'];
        public selfTxt:number;
        static get instance() {
            this._ins = this._ins || new CoolBeachImageManager();
            return this._ins;
        }

        constructor() {
            this.images = [];
            this.redBagGotId = [];
        }

        setup() {
            this.getImages();
        }

        public getImages() {
            net.sendAndWait(new pb.cs_cool_beach_show_selection_list()).then((data: pb.sc_cool_beach_show_selection_list) => {
                this.images = data.arr;
                if (this.images.length < 20) {
                    Laya.timer.once(60000, this, this.getImages);
                }
            });
        }
    }
}