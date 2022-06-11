

namespace rank {
    /**
     * 排行榜
     */
    export class RankModule extends ui.rank.RankModuleUI {

        private _myRank: RankItem;
        private _currentRankId: number;
        private _person: clientCore.Person;

        private _imgFrame: Laya.Image;
        private _userInfo: pb.IUserBase;

        private _activitySource: pb.sc_get_rabeal_spring_festival_info;

        private _t: time.GTime;
        private _delayT: number;

        private _rewardT: time.GTime;
        private _rewardTab: number;

        private _currentIndex: number;

        constructor() { super(); }

        init(rankId: number = 1): void {
            super.init(rankId);
            this._myRank = new RankItem();
            this._myRank.pos(357, 666);
            this.addChild(this._myRank);

            this._imgFrame = new Laya.Image("rank/sel_frame.png");
            this._imgFrame.pos(-6, -2);

            this.sp.scrollRect = new Laya.Rectangle(0, 0, 325, 442);

            this.list.itemRender = RankItem;
            this.list.renderHandler = Laya.Handler.create(this, this.rankItem, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.rankMouse, null, false);
            this.list.vScrollBarSkin = "";
            this.list.array = null;

            this.addPreLoad(this.getUserInfo());
            this.addPreLoad(this.getActivity());
            this.addPreLoad(xls.load(xls.rankReward));
        }

        initOver(): void {
            this.initTime();
            this.showTabs(this._data);
        }

        addEventListeners(): void {
            for (let i: number = 1; i <= 5; i++) {
                i <= 3 && BC.addEvent(this, this["tab" + i], Laya.Event.CLICK, this, this.showTabs, [i]);
                i <= 4 && BC.addEvent(this, this["family_" + i], Laya.Event.CLICK, this, this.updateReward, [i]);
                BC.addEvent(this, this["reward_" + i], Laya.Event.CLICK, this, this.updateReward, [i]);
            }
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
            BC.addEvent(this, this.imgDetail, Laya.Event.CLICK, this, this.showClothDetail);
        }

        private showClothDetail() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", [2100145, 2100137, 2100154][this._currentRankId - 1]);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            super.destroy();
            this.clearPerson();
            this._t?.dispose();
            this._rewardT?.dispose();
            this._myRank?.destroy();
            this._imgFrame?.destroy();
            this._obj = this._rewardT = this._t = this._myRank = this._imgFrame = null;
        }

        private getUserInfo(): Promise<void> {
            return net.sendAndWait(new pb.cs_get_user_base_info({ uids: [clientCore.LocalInfo.uid] })).then((data: pb.sc_get_user_base_info) => {
                this._userInfo = data.userInfos[0];
            });
        }

        private getActivity(): Promise<void> {
            return net.sendAndWait(new pb.cs_get_rabeal_spring_festival_info()).then((msg: pb.sc_get_rabeal_spring_festival_info) => {
                this._activitySource = msg;
            });
        }

        private async showTabs(rankId: number): Promise<void> {
            if (this._currentRankId == rankId) return;
            let infos: clientCore.RankInfo[] = await clientCore.RankManager.ins.getSrvRank(rankId);
            let myInfo: clientCore.RankInfo = await clientCore.RankManager.ins.getUserRank(rankId, clientCore.LocalInfo.uid);
            if (!infos || !myInfo) {
                alert.showFWords("未能成功获取数据~");
                return;
            }

            let isFamily: boolean = rankId == 3;
            this.box1.visible = !isFamily;
            this.box2.visible = isFamily;

            this._currentRankId = rankId;
            this.imgSelect.x = [366, 548, 726][rankId - 1];
            for (let i: number = 1; i < 4; i++) {
                this["value_" + i].visible = rankId == i;
            }
            this.list.array = infos;
            this.imgBar.visible = this.list.scrollBar.max > 0;
            this._myRank.setMyData(myInfo, this._userInfo, [this._activitySource.suitCnt, this._activitySource.threeStarOrderCnt, this._activitySource.familyActiveValues][rankId - 1]);

            //更新冠军
            let frist: clientCore.RankInfo = infos[0];
            if (frist) {
                if (frist.msg instanceof pb.RankInfo) {
                    this.updatePerson(frist.msg.userBase.sex, frist.msg.userBase.curClothes);
                } else if (frist.msg instanceof pb.FamilyRankInfo) {
                    this.showCloths(frist.msg.chiefId);
                }
            }
            this.imgTitle.skin = pathConfig.getTitlePath(this.getTitleId(rankId));
            //更新标签
            this.updateLabel(rankId);
            //更新奖励
            this.updateReward(1);
            //上榜条件
            this.updateConti(rankId);
        }

        private updateConti(rankId: number): void {
            let data: xls.rankInfo = xls.get(xls.rankInfo).get(rankId);
            switch (rankId) {
                case 1:
                    this.txCon.changeText(`(套装数量≥${data.limitScore}才可上榜)`);
                    break;
                case 2:
                    this.txCon.changeText(`(订单数量≥${data.limitScore}才可上榜)`);
                    break;
                case 3:
                    this.txCon.changeText(`(活跃度≥${data.limitScore}才可上榜)`);
                    break;
            }
        }

        private showCloths(userId: number): void {
            net.sendAndWait(new pb.cs_get_user_base_info({ uids: [userId] })).then((msg: pb.sc_get_user_base_info) => {
                let userBase: pb.IUserBase = msg.userInfos[0];
                this.updatePerson(userBase.sex, userBase.curClothes);
            })
        }

        private _obj: Object = {};
        /**
         * 获得冠军专属奖励 一定是称号 位置一定是在第一名奖励的第一个位置 策划说的
         * 出问题记得找策划yo^_^
         * @param rankId 
         */
        private getTitleId(rankId: number): number {
            // let id: number = this._obj[rankId];
            // if (!id) {
            //     let array: xls.rankReward[] = xls.get(xls.rankReward).getValues();
            //     let len: number = array.length;
            //     for (let i: number = 0; i < len; i++) {
            //         let ele: xls.rankReward = array[i];
            //         if (ele && ele.rankId == rankId) {
            //             let rewards: xls.pair[] = clientCore.LocalInfo.sex == 1 ? ele.femaleReward : ele.maleReward;
            //             id = rewards[0].v1;
            //             this._obj[rankId] = id;
            //             break;
            //         }
            //     }
            // }
            let id: number = channel.ChannelControl.ins.isOfficial ? 3500004 : 3500005;
            return id;
        }

        private updateLabel(rankId: number): void {
            let isFamily: boolean = rankId == 3;
            this.tx_w_nick.visible = !isFamily;
            if (isFamily) {
                this.tx_w_rank.x = 428;
                this.tx_w_family.x = 595;
            } else {
                this.tx_w_rank.x = 392;
                this.tx_w_family.x = 678;
            }
        }

        private updatePerson(sex: number, cloths: number[]): void {
            if (!this._person || this._person.sex != sex) {
                this.clearPerson();
                this._person = new clientCore.Person(sex);
                this._person.scale(0.4, 0.4);
                this._person.pos(167, 221);
                this.sp.addChild(this._person);
            }
            this._person.replaceByIdArr(cloths);
        }

        private initTime(): void {
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.updateTime);
            this._delayT = clientCore.RankManager.ins.checkActivity();
            this.updateTime();
            this._t.start();
        }

        private updateTime(): void {
            let diff: number = this._delayT--;
            let isOpen: boolean = diff > 0;
            this.timeView.boxOpen.visible = isOpen;
            this.timeView.boxClose.visible = !isOpen;
            if (diff <= 0) {
                diff = clientCore.RankManager.ins.checkHide();
                if (diff <= 0) { //不展示了 直接退出
                    this.destroy();
                    return;
                }
            }
            let d: number = Math.floor(diff / 86400);
            diff -= (d * 86400);
            let h = Math.floor(diff / 3600);
            if (isOpen) {
                let m = Math.floor((diff - h * 3600) / 60);
                this.timeView.txDay.changeText(d + "");
                this.timeView.txHour.changeText(h + "");
                this.timeView.txMin.changeText(m + "");
            } else {
                this.timeView.txCloseDay.changeText(d + "");
                this.timeView.txCloseHour.changeText(h + "");
            }
        }

        /** 清理人模*/
        private clearPerson(): void {
            this._person && this._person.destroy();
            this._person = null;
        }

        private rankItem(item: RankItem, index: number): void {
            item.setData(this.list.array[index]);
        }

        private rankMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            if (index == this._currentIndex) {
                this._currentIndex = -1;
                this._imgFrame.removeSelf();
                clientCore.UserInfoTip.hideTips();
                return;
            }
            this._currentIndex = index;
            let item: Laya.Box = this.list.getCell(index);
            let data: clientCore.RankInfo = this.list.array[index];
            item?.addChild(this._imgFrame);
            if (data.msg instanceof pb.RankInfo) clientCore.UserInfoTip.showTips(item, data.msg.userBase);
        }

        private onScrollChange(): void {
            this.imgBar.y = this.list.scrollBar.max <= 0 ? 204 : (204 + 378 * this.list.scrollBar.value / this.list.scrollBar.max);
        }

        private updateReward(tab: number): void {
            let isFamily: boolean = this._currentRankId == 3;
            isFamily ? this.ani2.gotoAndStop(tab - 1) : this.ani1.gotoAndStop(tab - 1);
            this.imgReward.skin = pathConfig.getRankReward(this._currentRankId, tab, clientCore.LocalInfo.sex);
            this.setRewardPos(tab);
            this._rewardTab = tab;
            this._rewardT?.dispose();
            let limit: number = isFamily ? 4 : 5;
            this._rewardT = time.GTimeManager.ins.getTime(globalEvent.TIME_ONCE, 10000, this, this.updateReward, [this._rewardTab >= limit ? 1 : this._rewardTab + 1]);
            this._rewardT.start();
            this.checkShowDetailBtn();
        }

        private checkShowDetailBtn() {
            this.imgDetail.visible = ((this._currentRankId == 1 && this._rewardTab == 1) ||
                (this._currentRankId == 2 && this._rewardTab == 4) ||
                (this._currentRankId == 3 && this._rewardTab == 2));
        }

        private setRewardPos(tab: number): void {
            let sex: number = clientCore.LocalInfo.sex;
            let x: number = 1143;
            let y: number = 447;

            switch (this._currentRankId) {
                case 1:
                    if (tab == 2) {
                        x = sex == 1 ? 1132 : 1127;
                        sex == 2 && (y = 444);
                    }
                    break;
                case 2:
                    if (tab == 4) {
                        x = sex == 1 ? 1195 : 1171;
                        y = sex == 1 ? 447 : 447;
                    } else if (tab == 5) {
                        x = sex == 1 ? 1195 : 1113;
                        y = sex == 1 ? 475 : 469;
                    } else if (tab == 2) {
                        x = 1157;
                    } else if (tab == 3) {
                        x = 1151;
                    }
                    break;
                case 3:
                    if (tab == 2 || tab == 3) {
                        x = 1152;
                    }
                    break;
            }
            this.imgReward.pos(x, y);
        }
    }
}