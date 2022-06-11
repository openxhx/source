namespace mysteryGiftEvent {
    export class MysteryGiftEventModule extends ui.mysteryGiftEvent.MysteryGiftEventModuleUI {
        private mtrArr: xls.pair[];
        private _ani: clientCore.Bone;
        init(d: { type: number, param: number }) {
            super.init(d);
            this.sideClose = true;
            this.addPreLoad(xls.load(xls.park));
        }

        onPreloadOver() {
            let data: { type: number, param: number } = this._data;
            this.event1.visible = data.type == 1;
            this.event2.visible = data.type == 2;
            this.event3.visible = data.type == 3;
            if (data.type == 1) {
                this.mtrArr = [
                    { v1: 700009, v2: 15 },
                    { v1: 700003, v2: 30 },
                    { v1: 700020, v2: 1 },
                    { v1: 700011, v2: 10 },
                    { v1: 710003, v2: 30 },
                    { v1: 730008, v2: 2 },
                    { v1: 730001, v2: 2 },
                    { v1: 700021, v2: 1 }
                ];
                let cost = this.mtrArr[data.param];
                this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(cost.v1);
                this.labCost.text = clientCore.ItemsInfo.getItemNum(cost.v1) + "/" + cost.v2;
                let name = clientCore.ItemsInfo.getItemName(cost.v1);
                this.labTalk.text = `我想给家乡的小幽灵\n带些${name},\n你能给我${cost.v2}个${name}吗?`;
                this._ani = clientCore.BoneMgr.ins.play('unpack/mysteryGiftEvent/xiaoyouling.sk', 0, true, this.boxAni);
                this._ani.pos(183, 364);
            } else if (data.type == 2) {
                this.labGame.text = `如果你能帮我\n${xls.get(xls.park).get(data.param).Stat},\n那我可以给你这个礼包哦~`
                this._ani = clientCore.BoneMgr.ins.play('unpack/mysteryGiftEvent/xiaoyouling.sk', 1, true, this.boxAni);
                this._ani.pos(188, 114);
            }
            this.labChangeTimes.text = "今日剩余：" + (3 - clientCore.MysteryGiftManager.ins.changeTimes) + "/3";
        }

        /**提交材料 */
        private SubmitMtr() {
            let data = this._data;
            let cost = this.mtrArr[data.param];
            let have = clientCore.ItemsInfo.getItemNum(cost.v1);
            if (have < cost.v2) {
                alert.mtrNotEnough([cost], Laya.Handler.create(this, this.SureSubmit));
            } else {
                this.SureSubmit();
            }
        }

        private SureSubmit() {
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_mystical_gift_exchange()).then((msg: pb.sc_mystical_gift_exchange) => {
                alert.showReward(msg.item);
                this.mouseEnabled = true;
                this.destroy();
            }).catch(() => {
                this.mouseEnabled = true;
            })
        }

        /**一键完成 */
        private OverEvent() {
            let have = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID);
            if (have < 200) {
                alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                    alert.AlertLeafEnough.showAlert(200 - have);
                }));
                return;
            }
            alert.showSmall("确定花费200神叶一键完成吗?", {
                callBack: {
                    caller: this, funArr: [() => {
                        this.mouseEnabled = false;
                        net.sendAndWait(new pb.cs_mystical_gift_buy()).then((msg: pb.sc_mystical_gift_buy) => {
                            alert.showReward(msg.item);
                            this.mouseEnabled = true;
                            this.destroy();
                        }).catch(() => {
                            this.mouseEnabled = true;
                        })
                    }]
                }
            })
        }

        /**跳转小游戏 */
        private GoGame() {
            let gameId = Math.floor(this._data.param / 100);
            clientCore.ToolTip.gotoMod(176, gameId.toString());
        }

        /**打小怪 */
        private async GoFight() {
            clientCore.LoadingManager.showSmall();
            await clientCore.SceneManager.ins.register();
            clientCore.LoadingManager.hideSmall(true);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.SceneManager.ins.battleLayout(6, 60102);
        }

        /**调整阵容 */
        private CreatTeam() {
            let newData: { type: number, param: number } = _.cloneDeep(this._data);
            this.destroy();
            clientCore.ModuleManager.open('battleArray.BattleArrayModule', null, { openWhenClose: "mysteryGiftEvent.MysteryGiftEventModule", openData: newData });
        }

        /**道具提示 */
        private showTips() {
            let cost = this.mtrArr[this._data.param];
            clientCore.ToolTip.showTips(this.imgCost, { id: cost.v1 });
        }

        /**更换事件 */
        private async ChangeEvent() {
            if (clientCore.MysteryGiftManager.ins.changeTimes >= 3) return;
            this._data = await clientCore.MysteryGiftManager.ins.ChangeEvent();
            this.labChangeTimes.text = "今日剩余：" + (3 - clientCore.MysteryGiftManager.ins.changeTimes) + "/3";
            this._ani?.dispose();
            this.onPreloadOver();
            this.removeEventListeners();
            this.addEventListeners();
        }

        addEventListeners() {
            let data: { type: number, param: number } = this._data;
            if (data.type == 1) {
                BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.SubmitMtr);
                BC.addEvent(this, this.imgCost, Laya.Event.CLICK, this, this.showTips);
            } else if (data.type == 2) {
                BC.addEvent(this, this.btnOver2, Laya.Event.CLICK, this, this.OverEvent);
                BC.addEvent(this, this.btnFinish, Laya.Event.CLICK, this, this.GoGame);
            } else {
                BC.addEvent(this, this.btnOver3, Laya.Event.CLICK, this, this.OverEvent);
                BC.addEvent(this, this.btnFight, Laya.Event.CLICK, this, this.GoFight);
                BC.addEvent(this, this.btnTeam, Laya.Event.CLICK, this, this.CreatTeam);
            }
            BC.addEvent(this, this.btnChange, Laya.Event.CLICK, this, this.ChangeEvent);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._ani?.dispose();
            this._ani = this.mtrArr = null;
            super.destroy();
        }
    }
}