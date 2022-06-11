namespace clientCore {
    /**
     * 家族地图
     */
    export class MapPickItem extends Laya.Sprite {
        public info: pb.IPickItem;
        private _itemImg: Laya.Image;
        private _ske: Laya.Skeleton;
        private _tips: Laya.Text;

        constructor(info: pb.IPickItem) {
            super();
            this.mouseEnabled = true;
            this.width = 128;
            this.height = 128;
            // this.mouseThrough = true;
            this.info = info;
            this._itemImg = new Laya.Image();
            this._itemImg.anchorX = 0.5;
            this._itemImg.anchorY = 0.5;
            this.addChild(this._itemImg);
            this._itemImg.pos(this.width / 2, this.height / 2);
            this.loadImg();
            this._itemImg.scale(0.6, 0.6);
            this.pos(this.info.pos.x, this.info.pos.y);

            this._ske = MapPickAnimate.createAnimate();
            this.addChildAt(this._ske, 0);
            this._ske.pos(this.width / 2, this.height / 2);
        }
        private loadImg() {
            let itemID = xls.get(xls.mapObject).get(this.info.posId).mapObjId;
            console.log(`will load itemID ${itemID}`);
            this._itemImg.skin = ItemsInfo.getItemIconUrl(itemID);
        }
        public refreshData(info: pb.IPickItem) {
            this.info = info;
        }
        public destroy() {
            Laya.timer.clear(this, this.onTimeOut);
            this.removeSelf();
        }
        public showTips(): void {
            this._tips = this._tips || this.creTxt();
            this.addChild(this._tips);
        }
        public hideTips(): void {
            this._tips?.removeSelf();
        }
        public creTxt(): Laya.Text {
            let txt: Laya.Text = new Laya.Text();
            txt.fontSize = 16;
            txt.font = '汉仪中圆简';
            txt.color = '#ffffff';
            txt.text = '正在收集中。。。';
            txt.x = 20;
            return txt;
        }


        /***
         * 道具自动刷新
         * @param waitTime 配表的刷新时间
         */
        enterWait(waitTime: number): void {
            this.visible = false;
            Laya.timer.once(waitTime, this, this.onTimeOut);
        }

        private onTimeOut(): void {
            this.visible = true;
        }

        public playAni() {
            let clearAni = clientCore.BoneMgr.ins.play("res/animate/chrismasInteract/clear.sk", 0, false, this);
            clearAni.pos(this.width / 2, this.height);
            clearAni.scaleX = clearAni.scaleY = 0.6;
            clearAni.once(Laya.Event.COMPLETE, this, this.showPanel);
        }

        private showPanel() {
            this.mouseEnabled = false;
            LocalInfo.onLimit = false;
            let random = Math.floor(Math.random() * 2);
            let moduleName = "christmasInteract.ChrismasInteractPanel";
            if (random == 0 || clientCore.ChrismasInteractManager.curCount >= 200) {
                //christmasInteract.ChrismasInteractPanel
                moduleName = "christmasInteract.ChrismasJockPanel";
            }
            clientCore.ModuleManager.open(moduleName).then(() => {
                let waitTime = xls.get(xls.mapObject).get(this.info.posId).refresh * 1000;
                this.enterWait(waitTime);
                this.mouseEnabled = true;
            })
        }
    }
}