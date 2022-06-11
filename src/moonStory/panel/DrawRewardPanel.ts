namespace moonStory {
    export class DrawRewardPanel extends ui.moonStory.panel.DrawRewardPanelUI {
        private _xlsInfoArr: xls.godTreeCounter[];
        private _model: MoonStoryModel;
        constructor(sign) {
            super();
            this.sideClose = true;
            this.addEventListeners();
            this._model = clientCore.CManager.getModel(sign) as MoonStoryModel;
            this.listReward.renderHandler = new Laya.Handler(this, this.showReward, null, false);
            this.listReward.mouseHandler = new Laya.Handler(this, this.getReward, null, false);
        }

        show() {
            this._xlsInfoArr = xls.get(xls.godTreeCounter).getValues();
            this.listReward.array = this._xlsInfoArr;
            this.txtNum.text = `当前次数：` + this._model.drawCount;
        }

        showReward(cell: ui.moonStory.render.DrawRewardItemUI, index: number) {
            let data: xls.godTreeCounter = cell.dataSource;
            cell.txtNum.text = this._xlsInfoArr[index].counter + "";
            cell.imgGet.visible = util.getBit(this._model.drawCountRewardStatus, index + 1) == 1;
            if (data.suitsAward > 0) {
                cell.imgReward.skin = "moonStory/" + (data.suitsAward) + ".png";
                cell.imgCount.skin = "moonStory/x1.png";
            } else {
                cell.imgReward.skin = "moonStory/" + (data.maleAward[0].v1) + ".png";
                cell.imgCount.skin = "moonStory/x" + data.maleAward[0].v2 + ".png";
            }
            let bgStr = "moonStory/bg_reward0.png";
            if (cell.imgGet.visible == false && this._model.drawCount >= this._xlsInfoArr[index].counter) {
                bgStr = "moonStory/bg_reward1.png";
            }
            cell.imgBg.skin = bgStr;
        }
        getReward(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let item = e.currentTarget as ui.moonStory.render.DrawRewardItemUI;
                let id = this._xlsInfoArr[index].id;
                if (item.imgGet.visible == false && this._model.drawCount >= this._xlsInfoArr[index].counter) {
                    net.sendAndWait(new pb.cs_spirit_tree_get_draw_times_reward({ index: id })).then((data: pb.sc_spirit_tree_get_draw_times_reward) => {
                        alert.showReward(clientCore.GoodsInfo.createArray(data.itms));
                        this._model.drawCountRewardStatus = util.setBit(this._model.drawCountRewardStatus, index + 1, 1);
                        this.listReward.startIndex = this.listReward.startIndex;
                        EventManager.event("MOONSTORY_DRAW_REWARD_BACK");
                    });
                }
                else {
                    if ([1, 3].indexOf(index) > -1) {
                        alert.showSmall("随机获得未拥有的【鲸与海的弦乐】服装部件，若集齐该套装，则兑换为30月华珠", {
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