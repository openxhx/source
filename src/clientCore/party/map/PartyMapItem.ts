namespace clientCore {
    export class PartyMapItem extends Laya.UIComponent{
        private _img:Laya.Image;
        private _itemInfo:PartyItemInfo;
        constructor(info: PartyItemInfo) {
            super();
            this._itemInfo = info;
            this.showMapItems();
        }
        public get img(): Laya.Image {
            return this._img;
        }
        public get itemInfo():PartyItemInfo{
            return this._itemInfo;
        }
        public showMapItems() {
            this.loadImgByUrl(ItemsInfo.getItemUIUrl(this._itemInfo.ID));
            this.setPos();
        }
         /**
         * 设置图片
         * @param url 
         */
        public loadImgByUrl(url: string) {
            this._img = new Laya.Image();
            this._img.mouseEnabled = true;
            this.mouseEnabled = true;
            res.load(url, Laya.Loader.IMAGE)
                .then(() => {
                    this._img.source = res.get(url);
                });
            this.addChild(this._img);
        }

        public setPos() {
            let pos = MapInfo.calPositionByRowAndCol(this.itemInfo.row, this.itemInfo.col);
            this.pos(pos.x,pos.y);
            this._img.scaleX = this.itemInfo.isReverse ? -1 : 1;
            this._img.pos(this.itemInfo.offsetPos.x, this.itemInfo.offsetPos.y);
        }

        public hideMapItem() {
            this.visible = false;
        }
        public get lowBoundPos():number{
            return this.y+this.img.height+this.img.y;
        }
    }
}