namespace library {
    /**
     * 兑换渲染
     */
    export class ExchangeItem extends ui.library.render.ExchangeItemUI {

        private _rew: xls.pair;
        private _materials: { id: number, cnt: number }[] = [];

        constructor() {
            super();
            this.list.mouseHandler = Laya.Handler.create(this, this.itemMouse, null, false);
            this.list.renderHandler = Laya.Handler.create(this, this.itemRender, null, false);
            this.reward.on(Laya.Event.CLICK, this, this.onReward);
        }

        public set data(value: xls.eventExchange) {
            this._rew = clientCore.LocalInfo.sex == 1 ? value.femaleProperty[0] : value.maleProperty[0];
            this.calculateLeaf(value.cost);
            this.reward.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(this._rew.v1);
            this.reward.ico.skin = clientCore.ItemsInfo.getItemIconUrl(this._rew.v1);
            this.reward.num.value = util.StringUtils.parseNumFontValue(this._rew.v2);
            this.list.array = value.cost;
        }

        private calculateLeaf(cost: xls.pair[]): void {
            this._materials = [];
            let len: number = cost.length;
            for (let i: number = 0; i < len; i++) {
                let itemId: number = cost[i].v1;
                let cnt: number = cost[i].v2 - clientCore.ItemsInfo.getItemNum(itemId);
                cnt > 0 && this._materials.push({ id: itemId, cnt: cnt });
            }
        }

        private itemRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let data: xls.pair = this.list.array[index];
            item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(data.v1);
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(data.v1);
            item.num.value = util.StringUtils.parseNumFontValue(clientCore.ItemsInfo.getItemNum(data.v1), data.v2);
        }

        private itemMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.MOUSE_DOWN) return;
            let data: xls.pair = this.list.array[index];
            data && clientCore.ToolTip.showTips(this.list.getCell(index), { id: data.v1 });
        }

        private onReward(): void {
            this._rew && clientCore.ToolTip.showTips(this.reward, { id: this._rew.v1 });
        }

        public get materials(): { id: number, cnt: number }[] {
            return this._materials;
        }
    }
}