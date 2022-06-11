namespace clientCore {
    export class MapItemBase extends Laya.UIComponent implements IFriendItem {
        // private _type: string;//
        private _img: Laya.Image;
        private _mapItemInfo: MapItemInfo;
        private _getTime: number;
        protected _mcReward: ui.commonUI.item.mapRewardItemUI;
        private _url: string;

        constructor(info: MapItemInfo) {
            super();
            this._getTime = info.getTime;
            this._mapItemInfo = info;
            this.showMapItems();
        }
        // public get type(): string {
        //     return this._type;
        // }
        public get img(): Laya.Image {
            return this._img;
        }
        public get url(): string {
            return this._url;
        }
        public get mapItemInfo(): MapItemInfo {
            //这里的itemInfo为了解决引用问题（MapitemsInfoManager里面_allBuildingInfoArr和_mapItemsArr的引用问题，统一用MapItemsInfoManager获取）
            //获取不到，再用构造函数里面传进来的
            let itemInfo = clientCore.MapItemsInfoManager.instance.getBuildingInfoByGetTime(this._getTime);
            if (!itemInfo)
                itemInfo = this._mapItemInfo;
            return itemInfo;
        }
        public getImgPath(): string {
            return "";
        }
        public showMapItems() {
            this._url = this.getImgPath();
            this.loadImgByUrl(this._url);
            this.img.x = this.mapItemInfo.offsetPos.x;
            this.img.y = this.mapItemInfo.offsetPos.y;
            this.img.scaleX = this.mapItemInfo.isReverse ? -1 : 1;

            let pos = MapInfo.calPositionByRowAndCol(this.mapItemInfo.mapPosRow, this.mapItemInfo.mapPosCol);
            this.x = pos.x;
            this.y = pos.y;
        }
        /**
         * 设置图片
         * @param url 
         */
        public loadImgByUrl(url: string) {
            this._img = new Laya.Image();

            res.load(url, Laya.Loader.IMAGE)
                .then(() => {
                    this._img.mouseEnabled = true;
                    this.mouseEnabled = true;
                    this._img.source = res.get(url);
                    if (this.mapItemInfo.type < 3) {
                        if (this.mapItemInfo.type == 2 && this.mapItemInfo.flowerCurStage == 1) {
                            this.setProduceRewardPos();
                            this._mcReward.y = this._mcReward.y + 90;
                        }
                        else {
                            this.setProduceRewardPos();
                        }
                    }
                }).catch(() => {
                    this._img.mouseEnabled = true;
                    this.mouseEnabled = true;
                });
            this.addChild(this._img);
            if (this._mcReward) {
                MapManager.mapItemsLayer.addChild(this._mcReward);
            }
            // this.addChild(this._mcReward);
        }
        /**花朵不同等级 显示不同的状态 */
        protected changeImg(url: string) {
            this._url = url;
            res.load(url, Laya.Loader.IMAGE)
                .then(() => {
                    this._img.source = res.get(url);
                });
        }

        //下面两个方法需要在具体实现里面重写,返回具体的信息
        public get row(): number {
            return this.mapItemInfo.mapPosRow;
        }
        public get col(): number {
            return this.mapItemInfo.mapPosCol;
        }

        public get getTime(): number {
            return this.mapItemInfo.getTime;
        }
        public setPos() {
            let pos = MapInfo.calPositionByRowAndCol(this.mapItemInfo.mapPosRow, this.mapItemInfo.mapPosCol);
            this.x = pos.x;
            this.y = pos.y;
            this._img.scaleX = this.mapItemInfo.isReverse ? -1 : 1;
            this._img.pos(this.mapItemInfo.offsetPos.x, this.mapItemInfo.offsetPos.y);

            if (this._mcReward) {
                this.setProduceRewardPos();
                if (this.mapItemInfo.type == 2 && this.mapItemInfo.flowerCurStage == 1) {
                    this._mcReward.y = this._mcReward.y + 90;
                }
                // this._mcReward.visible = true;
                this.showCompleteReward();
            }
        }
        public hideMapItem() {
            this.visible = false;
            this._mcReward && (this._mcReward.visible = false);
        }
        /**
         * 具体实现放子类
         */
        public refreshRestTime() {
        }
        /**加速完成，或者收获的时候，刷新地图显示信息 */
        public getOrProduceOneProduct() {

        }
        public get mcReward() {
            return this._mcReward;
        }

        public initProduceReward() {
            this._mcReward = new ui.commonUI.item.mapRewardItemUI();
            MapManager.mapItemsLayer.addChild(this._mcReward);
            // this.addChild(this._mcReward);
            var rewardID: number;
            if (this.mapItemInfo.type == 1) {
                rewardID = xls.get(xls.manageBuildingFormula).get(this.mapItemInfo.produceFormulaID).outputItem;
            }
            else if (this.mapItemInfo.type == 2) {
                rewardID = xls.get(xls.flowerPlant).get(this.mapItemInfo.id).outputItem;
            }
            this._mcReward.mcRewardImg.skin = clientCore.ItemsInfo.getItemIconUrl(rewardID);
            this.showCompleteReward();
            BC.addEvent(this, this._mcReward, Laya.Event.MOUSE_DOWN, this, this.onRewardClick);
        }

        onRewardClick(e: Laya.Event) {
            e.stopPropagation();
            // this.getReward();
        }
        /**不同情况子类实现 */
        public showCompleteReward() {

        }
        protected setProduceRewardPos() {
            this._mcReward.x = this.x + this._img.x + Math.floor((this._img.width - this._mcReward.width) / 2);
            this._mcReward.y = this.y + this._img.y - this._mcReward.height + 18;
        }
        public getReward() {

        }
        public checkCanGet(): boolean {
            return false;
        }
        public destroy() {
            BC.removeEvent(this);
            this._img && this.img.removeSelf();
            this._mcReward && this._mcReward.removeSelf();
        }

        quickFriend(): void {
        }

        pickFriend(): void {
        }
    }
}