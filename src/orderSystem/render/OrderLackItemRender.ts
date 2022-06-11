namespace orderSystem {
    export class OrderLackItemRender extends ui.commonUI.item.RewardItemUI {

        private _itemIcon: Laya.Image;

        constructor() {
            super();
        }

        public set dataSource(data: pb.IOrderItemInfo) {
            if (data) {
                this.ico.skin = clientCore.ItemsInfo.getItemIconUrl(data.needCollectItemId);
                this.txtName.text = clientCore.ItemsInfo.getItemName(data.needCollectItemId);
                this.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(data.needCollectItemId);
                this.num.value = (data.needItemTotalCnt - clientCore.ItemsInfo.getItemNum(data.needCollectItemId)).toString();
                this.txtName.visible = false;
                this.scale(0.8,0.8);
            }
        }

    }
}