namespace spiritTreeAccReward {
    /**
     * 青鸟之舟
     * 花间采蝶 2021-1-8-----2021-2-4
     * spiritTreeAccReward.SpiritTreeAccRewardModule
     * 
     */
    export class SpiritTreeAccRewardModule extends ui.spiritTreeAccReward.SpiritTreeAccRewardModuleUI {
        private _xlsInfoArr: xls.godTreeCounter[];
        private _accumulateDrawInfo: pb.Isc_spirit_tree_get_draw_times_info;
        constructor() {
            super();
        }
        init() {
            this.addPreLoad(xls.load(xls.godTreeCounter));
            this.addPreLoad(this.checkAccumulateDrawInfo());
        }
        async checkAccumulateDrawInfo() {
            this._accumulateDrawInfo = await net.sendAndWait(new pb.cs_spirit_tree_get_draw_times_info({}));
        }
        onPreloadOver() {
            this._xlsInfoArr = xls.get(xls.godTreeCounter).getValues();
            this.listReward.renderHandler = new Laya.Handler(this, this.showReward, null, false);
            this.listReward.mouseHandler = new Laya.Handler(this, this.getReward, null, false);
            this.listReward.array = this._xlsInfoArr;
            this.txtNum.text = `当前浇灌：` + this._accumulateDrawInfo.totalTimes;
        }
        showReward(cell: ui.spiritTreeAccReward.render.AccRewardItemUI, index: number) {
            cell.txtNum.text = this._xlsInfoArr[index].counter + "次";
            cell.imgGet.visible = util.getBit(this._accumulateDrawInfo.totalTimesRewardStatus, index + 1) == 1;
            let reward = this._xlsInfoArr[index].suitsAward ? this._xlsInfoArr[index].suitsAward : clientCore.LocalInfo.sex == 1 ? this._xlsInfoArr[index].femaleAward[0].v1 : this._xlsInfoArr[index].maleAward[0].v1;
            cell.imgReward.skin = `spiritTreeAccReward/${reward}.png`;
            let bgStr = "spiritTreeAccReward/bukeling.png";
            if (cell.imgGet.visible == false && this._accumulateDrawInfo.totalTimes >= this._xlsInfoArr[index].counter) {
                bgStr = "spiritTreeAccReward/kelingqu.png";
            }
            cell.imgBg.skin = bgStr;
            let xlsInfo = this._xlsInfoArr[index];
            let rewardArr: xls.pair[] = clientCore.LocalInfo.sex == 1 ? xlsInfo.femaleAward : xlsInfo.maleAward;
            cell.txCnt.changeText(`x${xlsInfo.suitsAward != 0 ? 1 : rewardArr[0].v2}`);
        }
        getReward(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let item = e.currentTarget as ui.spiritTreeAccReward.render.AccRewardItemUI;
                let id = this._xlsInfoArr[index].id;
                if (item.imgGet.visible == false && this._accumulateDrawInfo.totalTimes >= this._xlsInfoArr[index].counter) {
                    net.sendAndWait(new pb.cs_spirit_tree_get_draw_times_reward({ index: id })).then((data: pb.sc_spirit_tree_get_draw_times_reward) => {
                        alert.showReward(clientCore.GoodsInfo.createArray(data.itms));
                        this._accumulateDrawInfo.totalTimesRewardStatus = util.setBit(this._accumulateDrawInfo.totalTimesRewardStatus, index + 1, 1);
                        this.listReward.startIndex = this.listReward.startIndex;
                    });
                }
                else {
                    if (this._xlsInfoArr[index].suitsAward) {
                        alert.showSmall("随机获得未拥有的【花间休憩】服装部件，若集齐该套装，则兑换为相应数量的水晶石", {
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
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }
        destroy() {
            super.destroy();
        }
    }
}