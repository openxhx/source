namespace playground {
    /**
     * 地图事件触发点
     */
    export class EventItem extends Laya.Sprite {

        private static _pool: EventItem[] = [];

        private _eventId: number;
        private _bubble: Laya.Image;
        private _icon: Laya.Image;
        private _cloth: Laya.Image;

        constructor() {
            super();
            this.pivotX = 58.5;
            this.width = 117;
            this.pivotY = this.height = 147;
        }

        public get eventId(): number {
            return this._eventId;
        }

        public setEvent(data: xls.flowerGarden) {
            this.clean();
            this._eventId = data.event;
            switch (this._eventId) {
                case EVENT_TYPE.CLOTH:
                    this.createBubble();
                    let icon: Laya.Image = this.createIcon('playground/cloth.png');
                    icon.pos(6, 45);
                    break;
                case EVENT_TYPE.BEAN:
                    this.createBubble();
                    icon = this.createIcon('playground/bean.png');
                    icon.pos(22, 52);
                    break;
                case EVENT_TYPE.MYSTERIOUS:
                    this.createBubble();
                    icon = this.createIcon('playground/bubble.png');
                    icon.pos(10, 43);
                    break;
                case EVENT_TYPE.RANDOM:
                    this.createBubble();
                    icon = this.createIcon('playground/jump.png');
                    icon.pos(28, 48);
                    break;
                case EVENT_TYPE.GARDEN:
                    icon = this.createIcon('playground/granden.png');
                    icon.pos(-6, 69);
                    break;
                case EVENT_TYPE.CLOTH_PART:
                    let id: number = parseInt(data.parameter.split("/")[clientCore.LocalInfo.sex - 1]);
                    if (clientCore.LocalInfo.checkHaveCloth(id)) { //已经有这个部件了 则变为+能量
                        icon = this.createIcon('playground/energy+2.png');
                        icon.pos(8, 100);
                        return;
                    }
                    this.createCloth(clientCore.ItemsInfo.getItemIconUrl(id));
                    this.createBubble();
                    break;
                case EVENT_TYPE.FORECAST:
                    icon = this.createIcon('playground/card.png');
                    icon.pos(14, 66);
                    break;
                case EVENT_TYPE.CHOICE:
                    icon = this.createIcon('playground/min.png');
                    icon.pos(17, 72);
                    break;
                case EVENT_TYPE.ENERGY:
                    icon = this.createIcon('playground/energy+1.png');
                    icon.pos(8, 100);
                    break;
            }
        }

        private createBubble(): void {
            this._bubble = this._bubble || new Laya.Image('playground/reward_bubble.png');
            this.addChild(this._bubble);
        }

        private createIcon(path: string): Laya.Image {
            this._icon = this._icon || new Laya.Image();
            this._icon.loadImage(path);
            this.addChild(this._icon);
            return this._icon;
        }

        private createCloth(path: string): void {
            if (!this._cloth) {
                this._cloth = new Laya.Image();
                this._cloth.anchorX = this._cloth.anchorY = 0.5;
                this._cloth.pos(58.5, 84);
                this._cloth.scale(0.6, 0.6);
            }
            this._cloth.skin = path;
            this.addChild(this._cloth);
        }

        private clean(): void {
            this._eventId = 0;
            this._icon?.removeSelf();
            this._bubble?.removeSelf();
            this._cloth?.removeSelf();
        }

        dispose(): void {
            this.clean();
            this.removeSelf();
            EventItem._pool.push(this);
        }

        static create(): EventItem {
            return this._pool.shift() || new EventItem();
        }
    }
}