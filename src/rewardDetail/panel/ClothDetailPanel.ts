namespace rewardDetail {
    export class ClothDetailPanel extends Laya.View {
        private _person: clientCore.Person;
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
            // sp.x = -clientCore.LayerManager.OFFSET;
            this.addChildAt(sp, 0);
            sp.width = Laya.stage.width;
            sp.height = Laya.stage.height;

            this._person = new clientCore.Person(clientCore.LocalInfo.sex, this.getDefultFace());
            this._person.x = Laya.stage.width / 2;
            this._person.y = Laya.stage.height / 2;
            this.addChild(this._person);

            this._img = new Laya.Image();
            this._img.skin = "rewardDetail/clickAnyWhere.png";
            this._img.x = Laya.stage.width / 2 - this._img.width / 2;
            this._img.y = Laya.stage.height - this._img.height - 30;
            this.addChild(this._img);

            this._imgInfo = new Laya.Image();
            this._imgInfo.anchorY = 0.5;
            this._imgInfo.skin = "rewardDetail/buyInfo.png";
            this._imgInfo.x = Laya.stage.width / 2 + 450;
            this._imgInfo.y = Laya.stage.height - this._imgInfo.height - 30;
            this.addChild(this._imgInfo);
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.hidePanel);
        }

        private getDefultFace() {
            if (clientCore.LocalInfo.sex == 1) {
                return [4100205, 4100206, 4100207];
            } else {
                return [4100208, 4100209, 4100210];
            }
        }
        showCloth(id: number, title: boolean) {
            let suitID = id;
            let clothIDsArr = clientCore.SuitsInfo.getSuitInfo(suitID).clothes;
            this._person.replaceByIdArr(clothIDsArr);
            this._imgInfo.visible = title;
        }
        showOneCloth(id, title: boolean) {
            this._person.replaceByIdArr(clientCore.LocalInfo.wearingClothIdArr);
            if (typeof id == "number") {
                this._person.upById(id);
            }else{
                for(let i=0 ; i<id.length ; i++){
                    this._person.upById(id[i]);
                }
            }
            this._imgInfo.visible = title;
        }
        showPanel() {
            this._person.scale(0, 0);
            Laya.Tween.to(this._person, { scaleX: 0.8, scaleY: 0.8 }, 300, Laya.Ease.backOut);
        }
        hidePanel() {
            this._person.scale(0.8, 0.8);
            Laya.Tween.to(this._person, { scaleX: 0, scaleY: 0 }, 300, Laya.Ease.strongOut, new Laya.Handler(this, () => {
                this.removeSelf();
                this.event(Laya.Event.CLOSE);
            }));
        }
        destroy() {
            BC.removeEvent(this);
            this.removeSelf();
            this._img?.destroy();
            this._img = null;
            this._person?.destroy();
            this._person = null
        }
    }
}