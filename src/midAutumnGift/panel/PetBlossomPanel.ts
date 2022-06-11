namespace midAutumnGift {
    export class PetBlossomPanel extends ui.midAutumnGift.panel.PetBlossomPanelUI {

        initOver() {
            let cnt = clientCore.ItemsInfo.getItemNum(9900213);
            this.labCnt.text = cnt + '/1';
            this.btnBuy.visible = cnt == 0;
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        private closeSelf() {
            clientCore.UIManager.releaseCoinBox();
            clientCore.DialogMgr.ins.close(this);
        }

        /**购买晶石 */
        private buySton() {
            let has = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
            if (has < 200) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                return;
            }
            alert.showSmall('确定花费200灵豆购买心灵结晶?', {
                callBack: {
                    caller: this, funArr: [() => {
                        this.btnBuy.visible = false;
                        net.sendAndWait(new pb.cs_three_fairy_gifts_buy()).then((msg: pb.sc_three_fairy_gifts_buy) => {
                            alert.showReward(msg.item);
                        }).catch(() => {
                            this.btnBuy.visible = true;
                        })
                    }]
                }
            })
        }

        /**花宝绽放 */
        private petBlossom() {
            if (this.btnBuy.visible) {
                alert.showFWords('还需要心灵结晶~');
                return;
            }
            this.btnZhanfang.mouseEnabled = false;
            net.sendAndWait(new pb.cs_get_hua_film_reward()).then((msg: pb.sc_get_hua_film_reward) => {
                alert.showReward(msg.item);
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeSelf);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buySton);
            BC.addEvent(this, this.btnZhanfang, Laya.Event.CLICK, this, this.petBlossom);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}