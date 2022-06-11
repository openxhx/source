namespace happinessFlavour {
    /**
     * 2021.12.3
     * 可可爱爱小礼物
     * happinessFlavour.LovelyGiftMakePanel
    */
    export class LovelyGiftMakePanel extends ui.happinessFlavour.panel.LovelyGiftMakePanelUI {
        private buyID: number;
        private giftNum: number;
        private isMakeNum: number;
        private coinId: number;
        init() {
            clientCore.UIManager.setMoneyIds([9900246, 9900247, 9900248]);
            clientCore.UIManager.showCoinBox();
            this.addPreLoad(this.isMake());
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.listMouse);
        }

        onPreloadOver() {
            this.giftNumInfo();
            this.updataUI(this.giftNum);
        }

        addEventListeners() {
            BC.addEvent(this, this.imgCoin3, Laya.Event.CLICK, this, this.tips);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
            BC.addEvent(this, this.btnleft, Laya.Event.CLICK, this, this.onChoose, [true]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.onChoose, [false]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
            clientCore.ModuleManager.open("happinessFlavour.HappinessFlavourModule", "1");
        }

        private listRender(item: ui.happinessFlavour.render.LovelyGiftMakeItemUI) {
            const data: xls.pair = item.dataSource;
            item.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(data.v1);
            item.txtNum.text = `${data.v2}`;
        }

        private listMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(this.list.getCell(idx), { id: this.list.getItem(idx).v1 });
            }
        }

        /**规则 */
        private onRule() {
            alert.showRuleByID(1222);
        }

        /**设置礼物初值 */
        private giftNumInfo() {
            this.giftNum = util.get1num(this.isMakeNum);
        }

        /**制作 */
        private onGet() {
            net.sendAndWait(new pb.cs_lovely_little_gift_make({ index: this.giftNum + 1 })).then((data: pb.sc_lovely_little_gift_make) => {
                alert.showReward(data.item);
                this.isMake().then(() => {
                    if (this.giftNum <= 4) this.giftNum++;
                    this.updataUI(this.giftNum);
                });
            });
        }

        /**切换 */
        private onChoose(i: boolean) {
            if (i) {
                if (this.giftNum == 0) {
                    this.giftNum = 7;
                    this.updataUI(this.giftNum);
                } else {
                    this.updataUI(--this.giftNum);
                }
            } else {
                if (this.giftNum == 7) {
                    this.giftNum = 0;
                    this.updataUI(this.giftNum);
                } else {
                    this.updataUI(++this.giftNum);
                }
            }
        }


        private tips() {
            clientCore.ToolTip.showTips(this.imgCoin3, { id: this.coinId });
        }

        /**更新UI */
        private updataUI(num: number) {
            this.btnGet.disabled = false;
            this.buyID = 2998 + num;
            var data = xls.get(xls.eventExchange).get(this.buyID);
            this.list.array = data.cost;
            this.list.repeatX = data.cost.length;
            let isLock: boolean;
            let isGet: boolean;
            if (num < 5) {
                this.list.array = data.cost.slice(0, data.cost.length - 1);
                this.list.repeatX = data.cost.length - 1;
                isLock = num > 0 && util.getBit(this.isMakeNum, num) != 1;
                isGet = util.getBit(this.isMakeNum, num + 1) == 1;
                this.labMake.text = `已制作：${util.getBit(this.isMakeNum, num + 1)}/1次`;
                this.imgBean.visible = true;
            } else {
                this.list.array = data.cost;
                this.list.repeatX = data.cost.length;
                isLock = util.get1num(this.isMakeNum) != 5;
                isGet = false;
                this.labMake.text = '';
                this.imgBean.visible = false;
            }
            this.imgGift.skin = isGet ? "happinessFlavour/yizhizuo.png" : (isLock ? "happinessFlavour/gift2.png" : `happinessFlavour/box${num}.png`);
            this.btnGet.disabled = isGet || isLock;
            this.coinId = clientCore.LocalInfo.sex == 1 ? data.femaleProperty[0].v1 : data.maleProperty[0].v1;
            this.imgCoin3.skin = clientCore.ItemsInfo.getItemIconUrl(this.coinId);

        }
        /**获取物品领取状态 */
        private isMake() {
            return net.sendAndWait(new pb.cs_happy_taste_of_festival_info()).then((data: pb.sc_happy_taste_of_festival_info) => {
                this.isMakeNum = data.flag;
            });
        }
    }
}