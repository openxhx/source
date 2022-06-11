namespace yearSong {
    /**
     * 直购，根据注册时间打折
     */
    export class DoubleYearBuyPanel extends ui.yearSong.panel.DoubleYearBuyPanelUI {

        private ruleId: number[] = [1171 ,1173];
        private suit1:number = 2110491;
        private suit2:number = 2110492;
        private giftId:number = 1000147;
        private buyId:number;
        private buyId2:number;

        constructor() {
            super();
            this.initUI();
            this.addEventListeners();
        }

        private initUI() {
            let time: number = clientCore.LocalInfo.createRoleTime;
            if (time < util.TimeUtil.formatTimeStrToSec("2020-11-01 00:00:00")) {
                this.labPrice1_1.text = 0 + "";
                this.buyId = 2940;
            } else if (time < util.TimeUtil.formatTimeStrToSec("2021-01-01 00:00:00")) {
                this.labPrice1_1.text = 135 + "";
                this.buyId = 2934;
            } else if (time < util.TimeUtil.formatTimeStrToSec("2021-04-01 00:00:00")) {
                this.labPrice1_1.text = 225 + "";
                this.buyId = 2933;
            } else if (time < util.TimeUtil.formatTimeStrToSec("2021-07-01 00:00:00")) {
                this.labPrice1_1.text = 315 + "";
                this.buyId = 2932;
            } else {
                this.labPrice1_1.text = 450 + "";
                this.buyId = 2931;
            }
            this.labPrice2.text = 270 + "";
            this.labPrice1.text = 450 + "";
            if (clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec("2021-10-7 00:00:00")) {
                this.line0.y = 30;
                this.buyId2 = 2936;
            } else {
                this.line0.y = 60;
                this.buyId2 = 2935;
                this.discountImg.visible = false;
            }
            this.suitImg0.skin = clientCore.LocalInfo.sex == 1?`unpack/yearSong/suit_0_0_nv.png` : `unpack/yearSong/suit_0_0_nan.png`;
            this.suitImg1.skin = clientCore.LocalInfo.sex == 1?`unpack/yearSong/suit_0_1_nv.png` : `unpack/yearSong/suit_0_1_nan.png`;
            this.icon1_0.skin = this.icon1_1.skin = this.icon2_0.skin = this.icon2_1.skin = clientCore.ItemsInfo.getItemIconUrl(YearSongModel.instance.coinid);
            this.btnOther.visible = clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec("2021-10-5 00:00:00")?false:true;
            this.btnOpen.visible = clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec("2021-10-5 00:00:00")?true:false;
            this.setUI();
        }

        private setUI() {
            //左套装
            let have1 = clientCore.SuitsInfo.getSuitInfo(this.suit1).allGet;
            this.imgGot1.visible = have1;
            this.boxBuy1.visible = !have1;
            //右套装
            let have2 = clientCore.SuitsInfo.getSuitInfo(this.suit2).allGet;
            this.imgGot2.visible = have2;
            this.boxBuy2.visible = !have2;
            //赠品
            let have3 = clientCore.ItemsInfo.checkHaveItem(this.giftId);
            this.imgGot3.visible = have3;
            this.btnGet.visible = !have3;

            this.btnGet.disabled = !have1 || !have2;
        }

        async show() {
            clientCore.UIManager.setMoneyIds([YearSongModel.instance.coinid , 0]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年9月30日活动', '【付费】岁月如歌', '打开大乐必易-吴侬软语面板');
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /**打开复出直购 */
        private openOther() {
            if(clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec("2021-10-5 00:00:00")){
                return;
            }
            EventManager.event('YearSong_SHOW_EVENT_PANEL', panelType.doubleVipBuy);
        }

        /**帮助说明 */
        private showRule(i:number) {
            alert.showRuleByID(this.ruleId[i-1]);
        }

        /**展示套装详情 */
        private onTryClick(index: number) {
            let id = index == 1 ? this.suit1 : this.suit2;
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", id);
        }

        /**预览背景秀 */
        private onTryGift() {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.giftId, condition: '', limit: '' });
        }


        /**领取赠品 */
        private getGift() {
            net.sendAndWait(new pb.cs_common_recharge_get_ext_reward({ stage: 1 ,  activityId:197  , index :1})).then((msg: pb.sc_common_recharge_get_ext_reward) => {
                alert.showReward(msg.items);
                this.imgGot3.visible = true;
                this.btnGet.visible = false;
            })
        }

        /**购买 */
        private buyGoods(idx: number) {
            let price:number;
            let buyId;
            if(idx == 1){
                buyId = this.buyId;
                price = Number(this.labPrice1_1.text);
            }else{
                buyId = this.buyId2;
                price = clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec("2021-10-7 00:00:00") ? 270:450;
            }
            let have = clientCore.ItemsInfo.getItemNum(YearSongModel.instance.coinid);
            if (have < price) {
                alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(YearSongModel.instance.coinid)}不足,是否前往补充?`, { callBack: { funArr: [YearSongModel.instance.coinNotEnough], caller: this } });
                return;
            }
            alert.showSmall(`是否花费${price}${clientCore.ItemsInfo.getItemName(YearSongModel.instance.coinid)}购买所选商品?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_common_recharge_buy({ stage: 1, activityId: 197, idxs: [buyId] })).then((msg: pb.sc_common_recharge_buy) => {
                            alert.showReward(msg.items);
                            YearSongModel.instance.coinCost(price);
                            this.setUI();
                        })
                    }]
                }
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule , [1]);
            BC.addEvent(this, this.btnRule1, Laya.Event.CLICK, this, this.showRule , [2]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getGift);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.btnTry3, Laya.Event.CLICK, this, this.onTryGift);
            BC.addEvent(this, this.btnBuy1, Laya.Event.CLICK, this, this.buyGoods, [1]);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.buyGoods, [2]);
            BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.openOther);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            super.destroy();
        }

    }
}