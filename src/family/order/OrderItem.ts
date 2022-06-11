namespace family.order {
    /**
     * 订单单元格
     */
    export class OrderItem extends ui.familyOrder.OrderItemUI {

        private _getTime: number;

        constructor() {
            super();
            this.anchorX = this.anchorY = 0.5;
            this.pos(this.width / 2, this.height / 2);
            this.valueList.renderHandler = Laya.Handler.create(this, this.valueRender, null, false);
            this.rewardList.renderHandler = Laya.Handler.create(this, this.rewardRender, null, false);
            this.valueList.mouseHandler = new Laya.Handler(this, this.listMouse);
            this.rewardList.mouseHandler = new Laya.Handler(this, this.listMouse);
            this.btnDelivery.on(Laya.Event.CLICK, this, this.onDelivery);
            this.btnDelete.on(Laya.Event.CLICK, this, this.onDelete);
        }

        public setInfo(info: pb.IfmlOrder): void {
            this._getTime = info.gettime;
            let xlsData: xls.familyOrder = xls.get(xls.familyOrder).get(info.orderId);
            this.txName.changeText(xlsData.ordertitle);
            this.txDesc.text = xlsData.npcDialogue[info.dialogue];
            //奖励
            let rewards: xls.pair[] = xlsData.itemReward;
            this.rewardList.array = rewards;
            //任务内容
            this.valueList.array = info.orderItemInfo;
            this.rewardList.repeatX = rewards.length;
            this.valueList.repeatX = info.orderItemInfo.length;
        }

        private valueRender(item: ui.familyOrder.OrderRwdItemUI, index: number): void {
            let info: pb.fmlOrderItem = this.valueList.array[index];
            let has: number = clientCore.ItemsInfo.getItemNum(info.itemId);
            item.txtUp.visible = false;
            item.txtDown.visible = true;
            item.txtDown.style.font = '汉仪中圆简';
            item.txtDown.style.fontSize = 30;
            item.txtDown.style.width = 142;
            item.txtDown.style.align = 'center';
            let color1 = has >= info.need ? '#33c200' : '#c30017';
            item.txtDown.innerHTML = util.StringUtils.getColorText2([has.toString(), color1, '/' + info.need, '#805329']);
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(info.itemId);
            item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(info.itemId);
        }

        private rewardRender(item: ui.familyOrder.OrderRwdItemUI, index: number): void {
            let info: xls.pair = this.rewardList.array[index];
            item.txtUp.visible = true;
            item.txtDown.visible = false;
            item.txtUp.value = info.v2.toString();
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(info.v1);
            item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(info.v1);
        }

        private listMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data: pb.fmlOrderItem | xls.pair = e.currentTarget['dataSource'];
                let id = data instanceof pb.fmlOrderItem ? data.itemId : data.v1;
                clientCore.ToolTip.showTips(e.currentTarget, { id: id });
            }
        }

        private node(box: Laya.Box, name: string): any {
            return box.getChildByName(name);
        }

        /** 交付*/
        private onDelivery(): void {
            let _array: { id: number, num: number }[] = [];
            _.forEach(this.valueList.array, (element: pb.fmlOrderItem) => {
                let has: number = clientCore.ItemsInfo.getItemNum(element.itemId);
                let num: number = has - element.need;
                num < 0 && _array.push({ id: element.itemId, num: -num });
            })
            // 有材料不足
            if (_array.length > 0) {
                alert.showFWords('材料不足');
                return;
                let reple: ReplePanel = new ReplePanel();
                reple.show(this._getTime, _array);
                return;
            }
            FamilySCommand.ins.deliveryOrder(this._getTime);
        }

        /** 删除*/
        private onDelete(): void {
            alert.showSmall("是否删除订单？", {
                callBack: {
                    caller: this,
                    funArr: [this.deleteOrder]
                }
            })
        }

        private deleteOrder(): void {
            FamilySCommand.ins.deleteOrder(this._getTime);
        }
    }
}