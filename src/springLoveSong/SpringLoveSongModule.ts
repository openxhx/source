namespace springLoveSong {
    export const PERSON_SCLAE = 0.4;
    /**
     * 春日恋曲
     * 2021.3.12
     * springLoveSong.SpringLoveSongModule
     */
    export class SpringLoveSongModule extends ui.springLoveSong.SpringLoveSongModuleUI {
        private _model: SpringLoveSongModel;
        private _control: SpringLoveSongControl;
        private curView: number;
        private chooseFramePanel: SpringChooseFramePanel;
        init() {
            this.sign = clientCore.CManager.regSign(new SpringLoveSongModel(), new SpringLoveSongControl());
            this._model = clientCore.CManager.getModel(this.sign) as SpringLoveSongModel;
            this._control = clientCore.CManager.getControl(this.sign) as SpringLoveSongControl;
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            // this.giftId = clientCore.LocalInfo.sex == 1 ? 141551 : 141562;
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(this._control.getLimitInfo());
            this.addPreLoad(this._control.getShowInfo());
            this.addPreLoad(this._control.getAllShow(true));
        }

        onPreloadOver() {
            this.chooseFramePanel = new SpringChooseFramePanel();
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            if (clientCore.FlowerPetInfo.petType == 3) {
                this.imgGou.y = 80;
                this.buySuit2Cost = 220;
            } else if (clientCore.FlowerPetInfo.petType > 0) {
                this.imgGou.y = 50;
                this.buySuit2Cost = 269;
            } else {
                this.imgGou.y = 20;
                this.buySuit2Cost = 360;
            }
            this.labOriginal.text = "360";
            this.labQimiao.text = "269";
            this.labShanyao.text = "220";
            this.buySuit1Cost = 199;
            this.limitTime = util.TimeUtil.formatTimeStrToSec('2021-3-12 08:00:00');
            if (clientCore.ServerManager.curServerTime < this.limitTime) {
                Laya.timer.loop(1000, this, this.onTime);
                this.imgLimit.visible = true;
            } else {
                this.imgLimit.visible = false;
            }
            //self person
            this._selfPersonMale = new clientCore.Person(2);
            this._selfPersonFemale = new clientCore.Person(1);
            this._selfPersonMale.scale(PERSON_SCLAE, PERSON_SCLAE);
            this.imgSelf.addChild(this._selfPersonMale);
            this._selfPersonFemale.scale(PERSON_SCLAE, PERSON_SCLAE);
            this.imgSelf.addChild(this._selfPersonFemale);
            //other person
            this._oppoPersonMale = new clientCore.Person(2);
            this._oppoPersonFemale = new clientCore.Person(1);
            this._oppoPersonMale.scale(-PERSON_SCLAE, PERSON_SCLAE);
            this.imgOth.addChild(this._oppoPersonMale);
            this._oppoPersonFemale.scale(-PERSON_SCLAE, PERSON_SCLAE);
            this.imgOth.addChild(this._oppoPersonFemale);
            this.openView(1);
        }

        private openView(idx: 1 | 2) {
            if (this.curView == idx) return;
            this.curView = idx;
            this.di_1.skin = this.curView == 1 ? "springLoveSong/xuan_zhong.png" : "springLoveSong/wei_xuan_zhong.png";
            this.name_1.skin = this.curView == 1 ? "springLoveSong/crlq_1.png" : "springLoveSong/crlq_0.png";
            this.boxDi1.visible = this.boxView1.visible = this.curView == 1;
            this.di_2.skin = this.curView == 2 ? "springLoveSong/xuan_zhong.png" : "springLoveSong/wei_xuan_zhong.png";
            this.name_2.skin = this.curView == 2 ? "springLoveSong/lyxb_1.png" : "springLoveSong/lyxb_0.png";
            this.boxDi2.visible = this.boxView2.visible = this.curView == 2;
            if (idx == 1) {
                clientCore.Logger.sendLog('2021年3月12日活动', '【付费】春日恋曲·直购部分', '打开活动面板');
                this.openLoveSong();
                this.curBook = 0;
            } else {
                clientCore.Logger.sendLog('2021年3月12日活动', '【付费】春日恋曲·恋语相簿', '打开活动面板');
                this.openLoveBook(2);
            }
        }



        //#region 春日恋曲
        private readonly leftSuit: number = 2110311;
        private readonly rightSuit: number = 2100291;
        private giftId: number = 3800054;
        private buySuit1Cost: number;
        private buySuit2Cost: number;
        private limitTime: number;
        private async openLoveSong() {
            this.boxLimit.visible = false;
            let isGot1 = clientCore.SuitsInfo.getSuitInfo(2110311).allGet;
            await this._control.getLimitInfo();
            this.boxLimit.visible = clientCore.ServerManager.curServerTime >= this.limitTime && !isGot1;
            this.btnBuyOff.disabled = this._model.limitCnt <= 0;
            this.labLimit.text = "" + this._model.limitCnt;
            this.setLoveSongUI();
        }

        private onTime() {
            if (clientCore.ServerManager.curServerTime >= this.limitTime) {
                Laya.timer.clear(this, this.onTime);
                this.imgLimit.visible = false;
                this.boxLimit.visible = true;
            }
        }

        private setLoveSongUI() {
            //左边的套装
            let isGotLeft = clientCore.SuitsInfo.getSuitInfo(this.leftSuit).allGet;
            this.boxLimit.visible = !isGotLeft && clientCore.ServerManager.curServerTime >= this.limitTime;
            this.imgGotLeft.visible = isGotLeft;
            //右边的套装
            let isGotRight = clientCore.SuitsInfo.getSuitInfo(this.rightSuit).allGet;
            this.boxBuy.visible = !isGotRight;
            this.imgGotRight.visible = isGotRight;
            //赠品
            let isGotGift = clientCore.ItemsInfo.checkHaveItem(this.giftId);
            this.btnGet.visible = !isGotGift && isGotLeft && isGotRight;
            this.imgGotGift.visible = isGotGift;
        }

        /**购买套装 */
        private buySuit(type: number) {
            let cost = type == 1 ? this.buySuit1Cost : this.buySuit2Cost;
            if (!this.checkMoney(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID, cost)) return;
            alert.showSmall(`确定花费${cost}灵豆购买所选商品吗？`, {
                callBack: {
                    caller: this, funArr: [() => { this.buy(type); }]
                }
            })
        }

        /**检查余额 */
        private checkMoney(costId: number, costValue: number) {
            let has = clientCore.ItemsInfo.getItemNum(costId);
            if (has < costValue) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                return false;
            }
            return true;
        }

        /**实际购买 */
        private async buy(type: number) {
            let suitId = type == 1 ? this.leftSuit : this.rightSuit;
            this._control.buySuit(suitId, Laya.Handler.create(this, this.setLoveSongUI));
        }

        /**试穿套装 */
        private trySuit(type: number) {
            let suitId = type == 1 ? this.leftSuit : this.rightSuit;
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', suitId);
        }

        /**检查限量套装数量 */
        private async checkLimitCnt() {
            if (!this.boxView1.visible || this._model.limitCnt <= 0 || clientCore.ServerManager.curServerTime < this.limitTime) return;
            await this._control.getLimitInfo();
            this.btnBuyOff.disabled = this._model.limitCnt <= 0;
            this.labLimit.text = "" + this._model.limitCnt;
            if (this._model.limitCnt <= 0) {
                clientCore.DialogMgr.ins.closeAllDialog();
            }
        }

        /**跳转花宝小屋 */
        private goHuabaoHouse() {
            // clientCore.Logger.sendLog('2021年2月26日活动', '【付费】光阴的回廊', '元夜灯宵点击升级闪耀花宝按钮');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("flowerPet.FlowerPetModule");
        }
        //#endregion

        //#region 恋语相簿
        private curBook: number;
        private curShowPhoto: pb.IshowInfo;
        private curIndex: number;
        private _selfPersonMale: clientCore.Person;
        private _selfPersonFemale: clientCore.Person;
        private _oppoPersonMale: clientCore.Person;
        private _oppoPersonFemale: clientCore.Person;
        private openLoveBook(type: 0 | 1 | 2) {
            if (this.curBook == type) return;
            if (type == 0) type = this.curBook == 1 ? 2 : 1;
            this.curBook = type;
            this.boxSelf.visible = type == 1;
            this.boxAll.visible = type == 2;
            if (type == 1) {
                this.showSelfBook();
            } else {
                this.showAllBook();
            }
        }

        /**我的相簿 */
        private showSelfBook() {
            this.btnChange.skin = "springLoveSong/btn_change_self.png";
            this.diImage.skin = this._model.tempBg == 1 ? "unpack/springLoveSong/pu_tong.png" : "unpack/springLoveSong/qi_miao.png";
            this.labProgress.text = this._model.wishNum + "/50";
            let isGetChenghao = clientCore.TitleManager.ins.get(3500034) != null;
            this.btnGetChenghao.visible = this._model.wishNum >= 50 && !isGetChenghao;
            this.imgGotChenghao.visible = isGetChenghao;
            this.labLike.text = "" + this._model.wishNum;
            this._selfPersonMale.visible = clientCore.LocalInfo.sex == 2;
            this._selfPersonFemale.visible = clientCore.LocalInfo.sex == 1;
            let personSelf = clientCore.LocalInfo.sex == 1 ? this._selfPersonFemale : this._selfPersonMale;
            personSelf.downAllCloth();
            personSelf.upByIdArr(this._model.userClothesList.length > 0 ? this._model.userClothesList : clientCore.LocalInfo.wearingClothIdArr);
            this.labNameSelf.text = clientCore.LocalInfo.userInfo.nick;
            if (this._model.friendClothesList.length > 0) {
                let friend = clientCore.FriendManager.instance.getFriendInfoById(this._model.friendUid);
                this._oppoPersonMale.visible = friend.userBaseInfo.sex == 2;
                this._oppoPersonFemale.visible = friend.userBaseInfo.sex == 1;
                let personOth = friend.userBaseInfo.sex == 1 ? this._oppoPersonFemale : this._oppoPersonMale;
                personOth.downAllCloth();
                personOth.upByIdArr(this._model.friendClothesList);
                this.labNameOth.text = friend.userBaseInfo.nick;
            } else {
                this._oppoPersonFemale.visible = this._oppoPersonMale.visible = false;
                this.labNameOth.text = "";
            }
        }

        /**更新我的相簿 */
        private updataSelf() {
            if (!this.boxSelf.visible) return;
            this.showSelfBook();
        }

        /**所有相簿 */
        private showAllBook() {
            this.btnChange.skin = "springLoveSong/btn_change_all.png";
            let isGetSuit1 = clientCore.SuitsInfo.getSuitInfo(this.leftSuit).allGet;
            let isGetSuit2 = clientCore.SuitsInfo.getSuitInfo(this.rightSuit).allGet;
            this.btnGoBuy.visible = !isGetSuit1 && !isGetSuit2;
            this.imgGotSuit.visible = isGetSuit1 || isGetSuit2;
            this.labProgress.text = "可领取";
            if (this._model.allShow.length > 0) {
                this.curIndex = 0;
                this.curShowPhoto = this._model.allShow[0];
                this.showCurShow();
            } else {
                this._selfPersonFemale.visible = this._selfPersonMale.visible = false;
                this._oppoPersonMale.visible = this._oppoPersonFemale.visible = false;
                this.labNameSelf.text = this.labNameOth.text = "";
            }
        }

        /**点赞当前形象 */
        private likeCurPhoto() {
            if (!this.curShowPhoto) return;
            if (this.curShowPhoto.flag == 1) return;
            this._control.clickLike(this.curShowPhoto.uid, Laya.Handler.create(this, () => {
                this.curShowPhoto.flag = 1;
                this.btnLike.disabled = true;
            }));
        }

        /**编辑照片 */
        private editPhoto() {
            if (!this.imgGotSuit.visible) {
                alert.showFWords("未满足条件");
                return;
            }
            if (this._model.changeFlag == 0) {
                alert.showFWords("明天再来~");
                return;
            }
            this.chooseFramePanel.show(this.sign);
        }

        /**切换形象 */
        private changeCurShow(flag: number) {
            if (this._model.allShow.length == 0) return;
            if (this.curIndex == 0 && flag < 0) return;
            if (this.curIndex == this._model.allShow.length - 1 && flag > 0) return;
            this.curIndex += flag;
            this.curShowPhoto = this._model.allShow[this.curIndex];
            this.showCurShow();
            if (this.curIndex == this._model.allShow.length - 5 && this._model.allShow.length < this._model.maxShowCnt) {
                this._control.getAllShow();
            }
        }

        /**展示形象 */
        private showCurShow() {
            this.diImage.skin = this.curShowPhoto.bgShow == 1 ? "unpack/springLoveSong/pu_tong.png" : "unpack/springLoveSong/qi_miao.png";
            let self = this.curShowPhoto.userSexy == 1 ? this._selfPersonFemale : this._selfPersonMale;
            let other = this.curShowPhoto.friendSexy == 1 ? this._oppoPersonFemale : this._oppoPersonMale;
            self.downAllCloth();
            other.downAllCloth();
            self.upByIdArr(this.curShowPhoto.userClotheList);
            other.upByIdArr(this.curShowPhoto.friendClotheList);
            this.labNameSelf.text = this.curShowPhoto.userName;
            this.labNameOth.text = this.curShowPhoto.friendName;
            this._selfPersonMale.visible = this.curShowPhoto.userSexy == 2;
            this._selfPersonFemale.visible = this.curShowPhoto.userSexy == 1;
            this._oppoPersonFemale.visible = this.curShowPhoto.friendSexy == 1;
            this._oppoPersonMale.visible = this.curShowPhoto.friendSexy == 2;
            this.btnLike.disabled = this.curShowPhoto.flag == 1;
        }
        //#endregion

        /**领取额外奖励和称号奖励 */
        private getExReward(type: number) {
            this._control.getTitle(type, Laya.Handler.create(this, () => {
                if (type == 1) {
                    this.setLoveSongUI();
                    util.RedPoint.reqRedPointRefresh(24303);
                } else {
                    this.imgGotChenghao.visible = true;
                    this.btnGetChenghao.visible = false;
                    util.RedPoint.reqRedPointRefresh(24304);
                }
            }))
        }

        /**帮助说明 */
        private showRule() {
            // clientCore.Logger.sendLog('2021年3月5日活动', '【付费】春日勋章', '点击活动说明按钮');
            if (this.curView == 1) alert.showRuleByID(1134);
            else alert.showRuleByID(1100);
        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnView1, Laya.Event.CLICK, this, this.openView, [1]);
            BC.addEvent(this, this.btnView2, Laya.Event.CLICK, this, this.openView, [2]);
            //春日恋曲
            BC.addEvent(this, this.btnTryLeft, Laya.Event.CLICK, this, this.trySuit, [1]);
            BC.addEvent(this, this.btnTryRight, Laya.Event.CLICK, this, this.trySuit, [2]);
            BC.addEvent(this, this.btnBuyOff, Laya.Event.CLICK, this, this.buySuit, [1]);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buySuit, [2]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getExReward, [1]);
            BC.addEvent(this, this.btnUp, Laya.Event.CLICK, this, this.goHuabaoHouse);
            Laya.timer.loop(3000, this, this.checkLimitCnt);
            //恋语相簿
            BC.addEvent(this, this.btnChange, Laya.Event.CLICK, this, this.openLoveBook, [0]);
            BC.addEvent(this, this.btnGoBuy, Laya.Event.CLICK, this, this.openView, [1]);
            BC.addEvent(this, this.btnTakePicture, Laya.Event.CLICK, this, this.editPhoto);
            BC.addEvent(this, this.btnLike, Laya.Event.CLICK, this, this.likeCurPhoto);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.changeCurShow, [1]);
            BC.addEvent(this, this.btnPre, Laya.Event.CLICK, this, this.changeCurShow, [-1]);
            BC.addEvent(this, this.btnEdit, Laya.Event.CLICK, this, this.editPhoto);
            BC.addEvent(this, this.btnGetChenghao, Laya.Event.CLICK, this, this.getExReward, [2]);
            EventManager.on("UPDATA_SELF_PHOTO", this, this.updataSelf);
        }

        removeEventListeners() {
            Laya.timer.clear(this, this.checkLimitCnt);
            BC.removeEvent(this);
            EventManager.off("UPDATA_SELF_PHOTO", this, this.updataSelf);
        }

        public destroy() {
            super.destroy();
            this._selfPersonMale?.destroy();
            this._oppoPersonFemale?.destroy();
            this._selfPersonFemale?.destroy();
            this._oppoPersonMale?.destroy();
            clientCore.UIManager.releaseCoinBox();
        }
    }
}