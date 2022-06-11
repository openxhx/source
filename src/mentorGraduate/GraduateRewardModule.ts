namespace mentorGraduate {
    /**
     * mentorClothExchange.MentorClothExchangeModule
     * 导师计划兑换奖励
     * 
     */
    export class GraduateRewardModule extends ui.mentorGraduate.GraduateRewardModuleUI {
        private _growNum: number = 0;
        constructor() {
            super();
        }
        init(d: any) {
            if (d) {
                this.boxStudent.visible = false;
            }
            else {
                this.boxLevel30.visible = false;
            }
            this._growNum = clientCore.MentorManager.teacher.teacherInfo?.growPoint ?? .0;
            this.addPreLoad(xls.load(xls.tutorLevel));
            this.addPreLoad(this.reqGraduateRewardInfo());
            this.listRewardAll.renderHandler = new Laya.Handler(this, this.renderAllReward);
            this.listRewardAll.mouseHandler = new Laya.Handler(this, this.mouseAllReward);

            this.listLevelReward.renderHandler = new Laya.Handler(this, this.renderLevelReward);
            this.listLevelReward.mouseHandler = new Laya.Handler(this, this.getLevelReward);
        }
        async reqGraduateRewardInfo() {
            await net.sendAndWait(new pb.cs_get_education_gifts_info({})).then((data: pb.sc_get_education_gifts_info) => {
                clientCore.MentorManager.applyInfo.graduateRewardInfo = data;
                return Promise.resolve();
            });
        }
        onPreloadOver() {
            let rewardArr = xls.get(xls.tutorLevel).getValues();
            this.listRewardAll.array = rewardArr;
            this.listLevelReward.array = rewardArr;

            let lvInfo = clientCore.MentorConst.parseLvByGrow(this._growNum);
            this.txtProgress.text = "" + lvInfo.currExp + '/' + lvInfo.totalExp;
            this.imgLevel.skin = `mentorGraduate/level_${lvInfo.lv}.png`;
            this.imgProgress.width = 360 * lvInfo.currExp / lvInfo.totalExp;

            this.imgCloth.skin = `mentorGraduate/${clientCore.LocalInfo.sex}.png`

            this.imgHead.skin = clientCore.LocalInfo.headImgUrl;
        }
        private _index: number;
        getLevelReward(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                this._index = index;
                if (this._growNum < this.listLevelReward.array[index].growPoint) {
                    return;
                }
                if (util.get1num(clientCore.MentorManager.applyInfo.graduateRewardInfo.eduGifts) == 3) {
                    alert.showSmall('领取该奖励后，你就将从导师处毕业，脱离师徒关系。是否确定？', { callBack: { caller: this, funArr: [this.sureGetRwd] } })
                }
                else {
                    this.sureGetRwd();
                }
            }
        }
        private sureGetRwd() {
            //领取毕业礼但是等级不足毕业
            if (this._index == 3) {
                let graduateLv: number = xls.get(xls.tutorCommonData).get(1).traineeGraduate;
                if (clientCore.LocalInfo.userLv < graduateLv) {
                    alert.showFWords(`达到${graduateLv}级，才可以领取哦！`);
                    return;
                }
            }

            net.sendAndWait(new pb.cs_get_student_education_gifts({ ids: [this._index + 1] })).then((data: pb.sc_get_student_education_gifts) => {
                clientCore.MentorManager.applyInfo.graduateRewardInfo.eduGifts = data.eduGifts;
                alert.showReward(clientCore.GoodsInfo.createArray(data.items));
                this.listLevelReward.startIndex = this.listLevelReward.startIndex;
            });
        }
        renderLevelReward(cell: ui.mentorGraduate.LevelRewardItemUI, index: number) {
            let info: xls.tutorLevel = this.listLevelReward.array[index];
            cell.imgBg.skin = this._growNum >= info.growPoint ? "mentorGraduate/getBg_1.png" : "mentorGraduate/getBg_2.png";
            cell.imgLevelType.skin = `mentorGraduate/level_${index + 1}.png`;
            cell.imgGet.visible = util.getBit(clientCore.MentorManager.applyInfo.graduateRewardInfo.eduGifts, index + 1) > 0;
            clientCore.GlobalConfig.setRewardUI(cell.itemReward, { id: info.traineeReward[0].v1, cnt: info.traineeReward[0].v2, showName: false });

        }
        renderAllReward(cell: ui.commonUI.item.RewardItemUI, index: number) {
            let info: xls.tutorLevel = this.listRewardAll.array[index];
            clientCore.GlobalConfig.setRewardUI(cell, { id: info.traineeReward[0].v1, cnt: info.traineeReward[0].v2, showName: false });
        }

        mouseAllReward(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let info: xls.tutorLevel = this.listRewardAll.array[index];
            clientCore.ToolTip.showTips(e.target, { id: info.traineeReward[0].v1 });
        }

        onGetAllReward() {
            net.sendAndWait(new pb.cs_get_student_education_gifts({ ids: [1, 2, 3, 4] })).then((data: pb.sc_get_student_education_gifts) => {
                clientCore.MentorManager.applyInfo.graduateRewardInfo.eduGifts = data.eduGifts;
                alert.showReward(clientCore.GoodsInfo.createArray(data.items), "恭喜获得", {
                    callBack: { caller: this, funArr: [this.sureHideReward] },
                    btnType: alert.Btn_Type.SURE_AND_CANCLE,
                    needMask: true,
                    clickMaskClose: true,
                    needClose: true,
                });
            });
        }

        sureHideReward() {
            this.destroy();
            clientCore.MentorManager.openMentorSystem();
        }
        onTryClick() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2100036);
        }
        addEventListeners() {
            BC.addEvent(this, this.btnGetAllReward, Laya.Event.CLICK, this, this.onGetAllReward);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTryClick);
        }
        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}