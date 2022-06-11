namespace clientCore {
    /**
     * 花宝
     */
    export class Pet {

        /** 所有者*/
        private _owner: PersonUnit;
        private _petMovie: Bone;
        private _petCon: Laya.Sprite = new Laya.Sprite();
        private _render: Laya.Sprite = new Laya.Sprite();
        private _x: number;
        private _y: number;
        private _visible: boolean;
        private _maxSpeed: number = 10;
        private _ai: PetAI;
        private _optUI: ui.commonUI.item.PetOptItemUI;
        private _clickArea: Laya.Sprite;
        constructor() { }

        init(bigType: number, littleType: number, owner: PersonUnit): void {
            this._owner = owner;
            PersonLayer.ins.petLayer.addChild(this._render);
            this._render.addChild(this._petCon);
            this._petMovie = BoneMgr.ins.play(pathConfig.getflowerPetRes(bigType, littleType), "idle", true, this._petCon);
            this._petMovie.scaleX = this._petMovie.scaleY = 0.25 * xls.get(xls.babySize).get(bigType * 10 + littleType).size;
            this._ai = new PetAI(this);
            PetManager.ins.add(owner.id, this);
            if (owner.id == LocalInfo.uid) {
                if (FlowerPetInfo.petType > 0) {
                    this.addOptUI();
                }
            }
        }
        private addOptUI() {
            this._optUI = new ui.commonUI.item.PetOptItemUI();
            this._optUI.mouseThrough = true;
            this._optUI.x = 0;
            this._optUI.y = -57;
            this._optUI.visible = false;
            this._render.addChild(this._optUI);
            this._optUI.ani1.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
            BC.addEvent(this, this._optUI.btnClearAll, Laya.Event.MOUSE_DOWN, this, this.onClearAll);
            BC.addEvent(this, this._optUI.btnPutBack, Laya.Event.MOUSE_DOWN, this, this.putBackClick);
            BC.addEvent(this, EventManager, globalEvent.START_CHANGE_MAP, this, this.changeMap);
            this.addClickArea();
        }
        private changeMap() {
            this._optUI.visible = false;
            this._optUI.ani1.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
        }
        protected addClickArea() {
            this._clickArea = new Laya.Sprite();
            this._clickArea.width = 60;
            this._clickArea.height = 110;
            this._clickArea.x = -30;
            this._clickArea.y = -55 - 60;
            this._clickArea.graphics.clear();
            this._clickArea.graphics.drawRect(0, 0, this._clickArea.width, this._clickArea.height, "#000000");
            this._clickArea.alpha = 0;
            this._render.addChild(this._clickArea);
            BC.addEvent(this, this._clickArea, Laya.Event.MOUSE_DOWN, this, this.showOptUI);
        }

        private showOptUI(e: Laya.Event) {
            e.stopPropagation();
            if (!MapInfo.isSelfHome) {
                return;
            }
            this._optUI.visible = true;
            if (this._optUI.ani1.wrapMode == Laya.AnimationBase.WRAP_POSITIVE) {
                this._optUI.ani1.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
            }
            else {
                this._optUI.ani1.wrapMode = Laya.AnimationBase.WRAP_POSITIVE;
            }
            this._optUI.ani1.play(0, false);
        }
        private onClearAll(e: Laya.Event) {
            e.stopPropagation();
            MapItemsInfoManager.instance.optOneKey();
        }
        private putBackClick(e: Laya.Event) {
            e.stopPropagation();
            net.sendAndWait(new pb.cs_set_flower_baby_follow({ flag: 0 })).then((msg: pb.sc_set_flower_baby_follow) => {
                clientCore.FlowerPetInfo.followStatus = 0;
                clientCore.PeopleManager.getInstance().player.showFlowerPet(false);
                this._optUI.visible = false;
                this._optUI.ani1.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
                this._optUI.ani1.gotoAndStop(0);
            });
        }

        get visible(): boolean {
            return this._visible;
        }

        set visible(value: boolean) {
            this._visible = value;
            this._render && (this._render.visible = value);
        }

        get x(): number {
            return this._x;
        }
        set x(value: number) {
            this._x = value;
            this._render && this._render.pos(this._x, this._y);
        }

        get y(): number {
            return this._x;
        }
        set y(value: number) {
            this._y = value;
            this._render && this._render.pos(this._x, this._y);
        }

        public update(): void {
            this._ai && this._ai.update();
        }

        public fly_update(): void {
            let tx = this._owner.dirction == 0 ? this._owner.x + 120 : this._owner.x - 120;
            let ty = this._owner.y - 60;
            let dx: number = tx - this._x;
            let dy: number = ty - this._y;
            let dis: number = Math.sqrt(Math.pow(Math.abs(dx), 2) + Math.pow(Math.abs(dy), 2));
            this.reversal(tx > this._x);
            let angle: number = Math.atan2(ty - this._y, tx - this._x);
            let speed: number = dis / 300 * this._maxSpeed;
            this.x = this._x + speed * Math.cos(angle);
            this.y = this._y + speed * Math.sin(angle);

            //    this._optUI?.pos(this.x,this.y);
        }

        public checkFly(): boolean {
            let tx = this._owner.dirction == 0 ? this._owner.x + 120 : this._owner.x - 120;
            let ty = this._owner.y - 60;
            let dx: number = tx - this._x;
            let dy: number = ty - this._y;
            let dis: number = Math.sqrt(Math.pow(Math.abs(dx), 2) + Math.pow(Math.abs(dy), 2));
            if (dis <= 1) {
                return false;
            }
            return true;
        }

        pos(x: number, y: number): void {
            this.x = x;
            this.y = y;
        }

        public fly(): void {
            this._petMovie && this._petMovie.play("fly", true);
        }

        public idle(): void {
            if (this._petMovie) {
                this.reversal(this._owner.dirction == 1);
                this._petMovie.play("idle", true);
            }
        }

        public randomIdle(): void {
            let tag: number = _.random(0, 1);
            tag == 1 && this._petMovie.play("idle2", false, Laya.Handler.create(this, this.idle));
        }

        public reversal(bool: Boolean): void {
            let scale: number = Math.abs(this._petMovie.scaleX);
            this._petMovie.scaleX = bool ? -scale : scale;
            this._optUI && (this._optUI.scaleX = this._petMovie.scaleX > 0 ? 1 : -1);
        }

        dispose(): void {
            PetManager.ins.remove(this._owner.id);
            this._petMovie && this._petMovie.dispose();
            this._ai && this._ai.dispose();
            this._ai = this._render = this._owner = null;
            this._optUI?.removeSelf();
            BC.removeEvent(this);
        }
    }
}