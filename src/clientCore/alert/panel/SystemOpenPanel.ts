namespace alert {
    export class SystemOpenPanel extends ui.alert.SystemOpenUI {
        private _id: number;
        private _itemArr: number[];
        private _level: number;
        constructor(id: number, itemArr: number[], lv: number) {
            super();
            this._id = id;
            this._level = lv;
            this._itemArr = itemArr;
            this.addEventListeners();

            if (this._level > 0) {
                this.showLevelInfo(this.unLockInfo1);
                this.showLevelInfo(this.unLockInfo2);

                if (id > 0) {
                    Laya.timer.once(2000, this, this.startShowUnlockInfo);
                }
            }
            else {
                this.showUnlockInfo(this.unLockInfo1);
                this.showUnlockInfo(this.unLockInfo2);
            }

            if (itemArr.length > 0) {
                this.boxHaveItemUnlock.visible = true;
                this.boxNoItemUnlock.visible = false;

                this.openList.hScrollBarSkin = "";
                this.openList.renderHandler = new Laya.Handler(this, this.showUnlockItems, null, false);

                this.openList.array = itemArr;
                this.openList.repeatX = itemArr.length;
                this.openList.width = itemArr.length * 146 + (itemArr.length - 1) * 10;
                this.imgUnlockTips.x = this.openList.x - this.openList.width / 2 - 5;

                this.imgBg.height = 276;
                this.imgBottomLine.y = 284;
            }
            else {
                this.boxHaveItemUnlock.visible = false;
                this.boxNoItemUnlock.visible = true;
            }
            this.showStar();
        }

        private startShowUnlockInfo() {
            if (this._itemArr.length > 0) {
                this.startTween(this.unLockInfo1);
            }
            else{
                this.startTween(this.unLockInfo2);
            }
        }
        private startTween(panel:ui.alert.panel.UnlockInfoPanelUI){
            Laya.Tween.to(panel, { scaleX: 0 }, 300, null, new Laya.Handler(this, () => {
                this.showUnlockInfo(panel);
                Laya.Tween.to(panel,{scaleX:1},300,null);
            }));
        }

        private showLevelInfo(panel: ui.alert.panel.UnlockInfoPanelUI) {
            panel.boxUnlockFun.visible = false;
            panel.imgLv.visible = true;
            panel.fontLv.visible = true;
            panel.fontLv.value = this._level.toString();
            panel.imgTitle.skin = "alert/titleLvUp.png";
        }
        private showUnlockInfo(panel: ui.alert.panel.UnlockInfoPanelUI) {

            panel.boxUnlockFun.visible = true;
            panel.imgLv.visible = false;
            panel.fontLv.visible = false;
            let pngs = pathConfig.getSystemOpen(this._id);
            panel.imgIcon.skin = pngs.icon;
            panel.imgName.skin = pngs.txt;
            panel.imgTitle.skin = "alert/opentitle.png";
        }

        private showUnlockItems(cell: ui.alert.render.OpenItemRenderUI, index: number) {

            cell.txtType.text = this.getTypeName(cell.dataSource);
            this.setSkin(cell.imgItem, cell.dataSource);
            cell.txtName.text = this.getItemName(cell.dataSource);
        }
        private getTypeName(id: number): string {
            let type = Math.floor(id / 100000);
            if (type == 20) {
                return "花种";
            }
            else if (type == 3) {
                return "装饰";
            }
            else if (type == 4) {
                return "小屋";
            }
        }
        private setSkin(img: Laya.Image, id: number) {
            let type = Math.floor(id / 100000);
            if (type == 20) {
                img.skin = clientCore.ItemsInfo.getItemIconUrl(id);
                img.scale(0.7, 0.7);
            }
            else if (type == 3) {
                img.skin = clientCore.ItemsInfo.getItemIconUrl(id);;
            }
            else if (type == 4) {
                img.skin = pathConfig.getBuildingIconPath(id);
            }
        }
        private getItemName(id: number): string {
            let type = Math.floor(id / 100000);
            if (type == 20) {
                return xls.get(xls.itemBag).get(id).name;
            }
            else if (type == 3) {
                return xls.get(xls.manageBuildingId).get(id).name;
            }
            else if (type == 4) {
                return xls.get(xls.manageBuildingId).get(id).name;
            }
        }
        private showStar() {
            let num = _.random(5, 8, false);
            let dis = 80;
            for (let i = 0; i < num; i++) {
                let star = new Laya.Image('alert/star.png');
                if (i < num / 2)
                    star.pos(- dis * i, _.random(-50, 450, false), true);
                else
                    star.pos(this.width + dis * (i - num / 2), _.random(-50, 450, false), true);
                let s = _.random(0.8, 1.3, true);
                star.scale(s, s, true);
                this.addChild(star);
            }
        }

        playShowScaleAni() {
            this.centerX = this.centerY = 0;
            this.pivot(this.width / 2, this.height / 2);
            this.scale(0.1, 0.1);
            Laya.Tween.to(this, { scaleX: 1, scaleY: 1 }, 400, Laya.Ease.backOut);
        }

        addEventListeners() {

        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.startShowUnlockInfo);
        }
    }
}