namespace luckyDrawActivity {
    export class ClothDetailPanel extends Laya.View {
        private _person: clientCore.Person;
        private _suitIDArr: number[] = [2100012, 2100052, 2100160];
        private _img: Laya.Image;
        private _imgInfo: Laya.Image;
        constructor() {
            super();
        }
        init() {
            this.mouseEnabled = true;
            let sp = new Laya.Sprite();
            sp.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
            sp.alpha = 0.8;
            this.addChildAt(sp, 0);
            sp.width = Laya.stage.width;
            sp.height = Laya.stage.height;

            this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.getFaceIdArr());
            this._person.x = Laya.stage.width / 2;
            this._person.y = Laya.stage.height / 2;
            this.addChild(this._person);

            this._img = new Laya.Image();
            this._img.skin = "luckyDrawActivity/clickAnyWhere.png";
            this._img.x = Laya.stage.width / 2 - this._img.width / 2;
            this._img.y = Laya.stage.height - this._img.height - 30;
            this.addChild(this._img);

            this._imgInfo = new Laya.Image();
            this._imgInfo.anchorY = 0.5;
            this._imgInfo.skin = "luckyDrawActivity/buyInfo.png";
            this._imgInfo.x = Laya.stage.width / 2 + 450;
            this._imgInfo.y = Laya.stage.height - this._imgInfo.height - 30;
            this.addChild(this._imgInfo);
            this._imgInfo.visible = false;
        }
        showCloth(id: number) {
            let suitID = this._suitIDArr[id - 1];
            let clothIDsArr = clientCore.SuitsInfo.getSuitInfo(suitID).clothes;
            this._person.replaceByIdArr(clothIDsArr);
        }
        showPanel() {
            this._person.scale(0, 0);
            Laya.Tween.to(this._person, { scaleX: 0.8, scaleY: 0.8 }, 300);
        }
        hidePanel() {
            this._person.scale(0.8, 0.8);
            Laya.Tween.to(this._person, { scaleX: 0, scaleY: 0 }, 300, null, new Laya.Handler(this, () => {
                this.removeSelf();
            }));
        }
        destroy() {

        }
    }
}