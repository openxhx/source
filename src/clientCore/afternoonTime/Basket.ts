namespace clientCore {
    /**
     * 饼干花篮
     */
    export class Basket {
        /** 所有者*/
        private _owner: PersonUnit;
        private _x: number;
        private _y: number;
        private _visible: boolean;
        private _optUI: ui.afternoonTimeBasket.BasketUI;
        private _waiting: boolean;
        private aniBasket: clientCore.Bone;
        constructor() { }

        async init(owner: PersonUnit) {
            this._owner = owner;
            await clientCore.ModuleManager.loadatlas('afternoonTimeBasket');
            BasketManager.ins.add(owner.id, this);
            this.addOptUI();
        }

        public update(num: number): void {
            if (!this._optUI) return;
            this._optUI.visible = num > 0;
            if (num > 0) {
                this._optUI.labNum.text = num.toString();
            }
        }

        private addOptUI() {
            this._optUI = new ui.afternoonTimeBasket.BasketUI;
            PersonLayer.ins.petLayer.addChildAt(this._optUI, 0);
            this.x = this._owner.x;
            this.y = this._owner.y;
            this._optUI.scaleX = 0.8;
            this._optUI.scaleY = 0.8;
            BC.addEvent(this, this._optUI, Laya.Event.CLICK, this, this.onClick);
            this.update(BasketManager.ins.getBasketNum(this._owner.id));
        }

        private onClick() {
            if (this._owner.id == LocalInfo.uid) return;
            if (this._waiting) return;
            if (BasketManager.ins._getCookNum >= 100) {
                alert.showSmall("今日领取已达上限！");
                return;
            }
            if (BasketManager.ins.getBasketNum(this._owner.id) <= 0) return;
            this._waiting = true;
            net.sendAndWait(new pb.cs_thanks_afternoon_get_cookie({ uid: this._owner.id })).then((msg: pb.sc_thanks_afternoon_get_cookie) => {
                BasketManager.ins._getCookNum++;
                BasketManager.ins.addInfo(this._owner.id, msg.num);
                this._optUI.labNum.text = msg.num.toString();
                this.aniBasket = clientCore.BoneMgr.ins.play("res/animate/afternoonTime/basket.sk", 0, false, this._optUI);
                this.aniBasket.once(Laya.Event.COMPLETE, this, () => {
                    alert.showReward(msg.item);
                    this._waiting = false;
                    this.aniBasket?.dispose();
                });
            }).catch(() => {
                this._waiting = false;
            })
        }

        get visible(): boolean {
            return this._visible;
        }

        set visible(value: boolean) {
            this._visible = value;
            this._optUI && (this._optUI.visible = value);
        }

        get x(): number {
            return this._x;
        }
        set x(value: number) {
            this._x = value;
            this._optUI && this._optUI.pos(this._x, this._y);
        }

        get y(): number {
            return this._y;
        }
        set y(value: number) {
            this._y = value;
            this._optUI && this._optUI.pos(this._x, this._y);
        }

        pos(x: number, y: number): void {
            this.x = x;
            this.y = y;
        }

        dispose(): void {
            PetManager.ins.remove(this._owner.id);
            this._optUI?.removeSelf();
            this._optUI = this._owner = null;
            BC.removeEvent(this);
            this.aniBasket?.dispose();
            this.aniBasket = null;
        }
    }
}