namespace mapBean {
    /**
     * 花神之镜地图bean
     */
    export class GodMirrorBean implements core.IMapBean {
        private _destoryed: boolean;
        private _person: clientCore.Person;
        private _info: pb.IMirrorRankInfo;
        private _img: Laya.Image;
        private _img1: Laya.Image;
        async start() {
            await res.load('unpack/godMirror/godMirrorBean.png');
            await net.sendAndWait(new pb.cs_get_flora_of_mirror_ranking_info({ start: 0, end: 0, flag: 1 })).then((data: pb.sc_get_flora_of_mirror_ranking_info) => {
                this._info = data.info[0];
            })
            if (!this._destoryed)
                this.init();
        }

        private init() {
            this._img = new Laya.Image('unpack/godMirror/godMirrorBean.png');
            this._img1 = new Laya.Image('unpack/godMirror/ziti.png');
            this._img.pos(1650, 850);
            this._img1.pos(this._img.x + 265, this._img.y + 409)
            BC.addEvent(this, this._img, Laya.Event.CLICK, this, this.touch);
            clientCore.MapManager.mapItemsLayer.addChild(this._img);
            clientCore.MapManager.mapItemsLayer.addChild(this._img1);
            if (this._info) {
                this._person = new clientCore.Person(this._info.sexy, this._info.image);
                clientCore.MapManager.mapItemsLayer.addChild(this._person);
                this._person.scale(0.35, 0.35);
                this._person.pos(this._img.x + 415, this._img.y + 260);
            }
        }

        redPointChange() {
        }

        touch() {
            clientCore.ModuleManager.open('godMirror.GodMirrorModule');
        }

        destroy() {
            BC.removeEvent(this);
            this._destoryed = true;
            this._person?.destroy();
            this._img?.destroy();
            this._img1?.destroy();
            this._person = null;
            this._img = null;
            this._img1 = null;
        }
    }
}