namespace anniversary {
    export class DrawRewardPanel extends ui.anniversary.panel.DrawRewardPanelUI {
        private _xlsInfoArr: xls.godTreeCounter[];
        private _model: AnniversaryModel;
        constructor(sign) {
            super();
            this.sideClose = true;
            this.addEventListeners();
            this._model = clientCore.CManager.getModel(sign) as AnniversaryModel;
            this.listReward.renderHandler = new Laya.Handler(this, this.showReward, null, false);
            this.listReward.mouseHandler = new Laya.Handler(this, this.getReward, null, false);
        }

        show() {
            this._xlsInfoArr = xls.get(xls.godTreeCounter).getValues();
            this.listReward.array = this._xlsInfoArr;
            this.txtNum.text = `当前次数：` + this._model.drawCount;
        }

        showReward(cell: ui.anniversary.render.DrawRewardItemUI, index: number) {
            let data: xls.godTreeCounter = cell.dataSource;
            cell.txtNum.text = this._xlsInfoArr[index].counter + "";
            cell.imgGet.visible = util.getBit(this._model.drawCountRewardStatus, index + 1) == 1;
            cell.imgReward.skin = "res/rewardIcon/item" + (data.id) + ".png";
            let bgStr = "anniversary/不可领状态.png";
            if (cell.imgGet.visible == false && this._model.drawCount >= this._xlsInfoArr[index].counter) {
                bgStr = "anniversary/可领取状态.png";
            }
            cell.imgBg.skin = bgStr;
        }
        getReward(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let item = e.currentTarget as ui.anniversary.render.DrawRewardItemUI;
                let id = this._xlsInfoArr[index].id;
                if (item.imgGet.visible == false && this._model.drawCount >= this._xlsInfoArr[index].counter) {
                    net.sendAndWait(new pb.cs_spirit_tree_get_draw_times_reward({ index: id })).then((data: pb.sc_spirit_tree_get_draw_times_reward) => {
                        alert.showReward(clientCore.GoodsInfo.createArray(data.itms));
                        this._model.drawCountRewardStatus = util.setBit(this._model.drawCountRewardStatus, index + 1, 1);
                        this.listReward.startIndex = this.listReward.startIndex;
                        EventManager.event("ANNIVERSARY_DRAW_REWARD_BACK");
                    });
                }
                else {
                    if([1,3].indexOf(index) > -1){
                        alert.showSmall("随机获得未拥有的【忆鸾尘】服装部件，若集齐该套装，则兑换为30花语笺",{
                            callBack: null,
                            btnType: alert.Btn_Type.ONLY_SURE,
                            needMask: true,
                            clickMaskClose: true,
                            needClose: true,
                        });
                        return;
                    }
                    let xlsInfo = this._xlsInfoArr[index];
                    let rewardArr: xls.pair[] = clientCore.LocalInfo.sex == 1 ? xlsInfo.femaleAward : xlsInfo.maleAward;
                    clientCore.ModuleManager.open("panelCommon.RewardShowModule", { reward: clientCore.GoodsInfo.createArray(rewardArr), info: "" });
                }
            }
        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        onClose() {
            clientCore.DialogMgr.ins.close(this);
        }
        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}