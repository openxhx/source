namespace rechargeActivity {
    export class RechargeRender extends ui.rechargeActivity.render.singleRechargeItemUI {
        constructor() {
            super();
            this.itemList.mouseHandler = new Laya.Handler(this, this.onShowTips);
        }

        private onShowTips(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(e.currentTarget as Laya.Sprite, { id: e.currentTarget['dataSource'].id })
            }
        }
        setInfo(type: number, data: { data: xls.rechargeActivity, flag: boolean }, value: number) {
            let getFlag = data.flag;
            let rInfo: xls.rechargeActivity = data.data;
            let rewardArr = clientCore.LocalInfo.sex == 1 ? rInfo.rewardFamale : rInfo.rewardMale;
            this.itemList.dataSource = _.map(rewardArr, (o) => {
                return {
                    id: o.v1,
                    num: { value: o.v2.toString() },
                    ico: { skin: clientCore.ItemsInfo.getItemIconUrl(o.v1) },
                    txtName: { text: clientCore.ItemsInfo.getItemName(o.v1), visible: true },
                    imgBg: { skin: clientCore.ItemsInfo.getItemIconBg(o.v1) }
                }
            });
            this.boxSingleRecharge.visible = false;
            this.boxCumulativeRecharge.visible = false;
            switch (type) {
                case 1:
                    this.boxNumCon.removeChildren();
                    this.boxNumCon.addChild(this.createNum(rInfo.cost));
                    this.btnGetReward.visible = value >= rInfo.cost && !getFlag;
                    this.imgGet.visible = getFlag;
                    this.boxNeedInfo.visible = value < rInfo.cost;
                    this.boxSingleRecharge.visible = true;
                    this.boxSingleRecharge.mouseThrough = true;
                    break;
                case 2:
                    break;
                case 3://累计消费
                    this.boxCumulativeRecharge.visible = true;
                    this.btnCumulativeGetReward.visible = value >= rInfo.cost && !getFlag;
                    this.boxNeedDetailInfo.visible = value < rInfo.cost;
                    this.imgCumulativeGet.visible = getFlag;
                    this.txtCumulativeNeedReNum.text = value >= rInfo.cost ? "0" : ("" + (rInfo.cost - value));
                    this.txtCumulativeRechargeNum.text = "" + value + "/" + rInfo.cost;
                    this.imgCumulativeReMask.x = -this.imgCumulativeReMask.width + (value >= rInfo.cost ? 1 : value / rInfo.cost) * this.imgCumulativeReMask.width;
                    this.boxCumulativeRecharge.mouseThrough = true;
                    this.imgCoin.visible = true;
                    this.txtYuan.visible = false;
                    this.txtIntro.text = this.txtIntro.text.replace("充值", "消费");
                    break;
                case 4://累计充值
                    this.boxCumulativeRecharge.visible = true;
                    this.btnCumulativeGetReward.visible = value >= rInfo.cost && !getFlag;
                    this.boxNeedDetailInfo.visible = value < rInfo.cost;
                    this.imgCumulativeGet.visible = getFlag;
                    this.txtCumulativeNeedReNum.text = value >= rInfo.cost ? "0" : ("" + (rInfo.cost - value));
                    this.txtCumulativeRechargeNum.text = "" + value + "/" + rInfo.cost;
                    this.imgCumulativeReMask.x = -this.imgCumulativeReMask.width + (value >= rInfo.cost ? 1 : value / rInfo.cost) * this.imgCumulativeReMask.width;
                    this.boxCumulativeRecharge.mouseThrough = true;
                    this.imgCoin.visible = false;
                    this.txtYuan.visible = true;
                    break;
            }
        }
        createNum(num: number): Laya.FontClip {
            let str = num.toString();
            let fc = new Laya.FontClip("rechargeActivity/font_RedNum.png", "0123456789");
            fc.spaceX = -20;
            fc.value = str;
            this.imgRMB.x = this.boxNumCon.x + str.length * 20;
            return fc;
        }
    }
}