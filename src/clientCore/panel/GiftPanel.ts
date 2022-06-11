namespace clientCore {
    /**
     * 好感度赠礼
     */
    export class GiftPanel extends ui.gift.GiftPanelUI {

        private _info: role.RoleInfo;
        private _heart: Bone;
        private _gifts: ItemBagInfo[];

        constructor() {
            super();
            this.list.hScrollBarSkin = "";
            this.list.mouseHandler = Laya.Handler.create(this, this.itemSel, null, false);
        }

        show(roleId: number): void {
            this._info = RoleManager.instance.getRoleById(roleId);
            this._heart = clientCore.BoneMgr.ins.play("res/animate/favor/xin.sk", 0, true, this);
            this._heart.mask = new Laya.Image("gift/heart3.png");
            this.updateGift();
            DialogMgr.ins.open(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, EventManager, globalEvent.FAVOR_UPDATE, this, this.updateGift);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        hide(): void {
            DialogMgr.ins.close(this);
        }

        destroy(): void {
            this._heart?.dispose();
            this._info = this._gifts = this.height = null;
            super.destroy();
        }

        private updateGift(): void {
            this._gifts = clientCore.ItemBagManager.getItemsByEvent(11);
            this.list.array = _.map(this._gifts, (element) => {
                return {
                    "ico": { skin: clientCore.ItemsInfo.getItemIconUrl(element.xlsInfo.itemId) },
                    "num": { text: `拥有：${element.goodsInfo.itemNum}` },
                    "nick": { text: element.xlsInfo.name }
                }
            })
            this.updateFavor();
        }

        private updateFavor(): void {
            this.fntLv.value = this._info ? util.StringUtils.fillZero(this._info.faverLv, 2) : '00';
            this.txFavor.text = ' ' + this._info.faver + '/' + this._info.needFaver;
            let y: number = (1 - this._info.faverPercent) * 84
            this._heart.mask.y = -y;
            this._heart.pos(72, 81 + y);
        }

        private itemSel(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let info: clientCore.ItemBagInfo = this._gifts[index];
            info && info.goodsInfo.itemNum > 0 && clientCore.RoleManager.instance.giveGift(this._info.id, info.goodsInfo.itemID,1);
        }

        private static _ins: GiftPanel;
        public static async showAlert(roleId: number): Promise<void> {
            await res.load("atlas/gift.atlas");
            this._ins = this._ins || new GiftPanel();
            this._ins.show(roleId);
        }

        public static hideAlert(): void {
            this._ins?.hide();
        }
    }
}