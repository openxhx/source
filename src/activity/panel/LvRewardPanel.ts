namespace activity {
    enum REWARD_STATUS {
        NO_CLAIM,
        GETTED
    }
    export class LvRewardPanel extends ActivityBasePanel<ui.activity.panel.LvRewardPanelUI>{
        private _srvInfo: pb.sc_get_level_activity_status;
        private _lvRwdStatus: REWARD_STATUS[];
        private _lvVipRwdStatus: REWARD_STATUS[];
        /** 有购买资格 */
        private _haveCard: boolean;
        init() {
            this.ui.list.vScrollBarSkin = null;
            this.ui.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.ui.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.addPreLoad(xls.load(xls.levelReward));
            this.addPreLoad(res.load('unpack/activity/lvshowImg.png'));
            this.addPreLoad(net.sendAndWait(new pb.cs_get_level_activity_status()).then((data: pb.sc_get_level_activity_status) => {
                this._srvInfo = data;
                this._haveCard = data.isQuarter == 1;
            }))
        }

        preLoadOver() {
            this._lvRwdStatus = [];
            this._lvVipRwdStatus = [];
            for (let i = 0; i < xls.get(xls.levelReward).length; i++) {
                this._lvRwdStatus.push(util.getBit(this._srvInfo.flag, i + 1));
                this._lvVipRwdStatus.push(util.getBit(this._srvInfo.flag2, i + 1));
            }
            this.show();
        }

        private _first: boolean = true;
        show() {
            this.ui.list.dataSource = this._lvRwdStatus;
            this.ui.list.startIndex = this.ui.list.startIndex;
            if (this._first) {
                let idx = _.findIndex(this._lvRwdStatus, (i) => { return i == REWARD_STATUS.NO_CLAIM });
                idx = idx == -1 ? 0 : idx;
                this.ui.list.scrollTo(idx);
                this._first = false;
            }
        }

        private onListRender(cell: ui.activity.render.LvRewardRenderUI, idx: number) {
            let xlsInfo = xls.get(xls.levelReward).getValues()[idx];
            cell.txtLv.text = `角色到达${xlsInfo.levelLimit}`;
            let rwdGeted = this._lvRwdStatus[idx] == REWARD_STATUS.GETTED;
            let vipGeted = this._lvVipRwdStatus[idx] == REWARD_STATUS.GETTED;
            cell.imgHave.visible = rwdGeted && vipGeted;
            cell.imgGet.visible = !rwdGeted;
            cell.imgVipGet.visible = !vipGeted;
            cell.imgGet.disabled = clientCore.LocalInfo.userLv < xlsInfo.levelLimit;
            let reward = clientCore.LocalInfo.sex == 1 ? xlsInfo.reward : xlsInfo.rewardMale;
            for (let i = 0; i < 3; i++) {
                let rwd = cell.boxReward.getChildAt(i) as Laya.Box;
                if (i < reward.length) {
                    rwd.visible = true;
                    let item = reward[i];
                    (rwd.getChildByName('imgIcon') as Laya.Image).skin = clientCore.ItemsInfo.getItemIconUrl(item.v1);
                    (rwd.getChildByName('txtNum') as Laya.Label).text = item.v2.toString();
                    (rwd.getChildByName('imgHave') as Laya.Label).visible = rwdGeted;
                    BC.addEvent(this, rwd.getChildByName('imgIcon'), Laya.Event.CLICK, this, this.showTips, [rwd, item.v1])
                }
                else {
                    rwd.visible = false;
                }
            }
            //vip奖励
            let rwd = cell.boxReward.getChildAt(3) as Laya.Box;
            let item = xlsInfo.addReward;
            (rwd.getChildByName('imgIcon') as Laya.Image).skin = clientCore.ItemsInfo.getItemIconUrl(item.v1);
            (rwd.getChildByName('txtNum') as Laya.Label).text = item.v2.toString();
            (rwd.getChildByName('imgHave') as Laya.Label).visible = vipGeted;
            BC.addEvent(this, rwd.getChildByName('imgIcon'), Laya.Event.CLICK, this, this.showTips, [rwd, item.v1])
        }

        private showTips(cell: Laya.Box, id: number) {
            clientCore.ToolTip.showTips(cell, { id: id });
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.target instanceof component.HuaButton && e.type == Laya.Event.CLICK) {
                let rwdGeted = this._lvRwdStatus[idx] == REWARD_STATUS.GETTED;
                let vipGeted = this._lvVipRwdStatus[idx] == REWARD_STATUS.GETTED;
                let sendType: number = 1;
                if (this._haveCard) {
                    //能领取季卡奖励的话
                    if (rwdGeted && !vipGeted) {
                        //普通奖励领过了，单独领季卡奖励
                        sendType = 2;
                    }
                    if (!rwdGeted && vipGeted) {
                        //季卡领了，单独领普通奖励
                        sendType = 1;
                    }
                    if (!rwdGeted && !vipGeted) {
                        //都没领过
                        sendType = 3;
                    }
                }
                else {
                    if (rwdGeted) {
                        clientCore.ModuleManager.closeModuleByName('activity');
                        clientCore.ModuleManager.open('flowerPet.FlowerPetModule');
                        return;
                    }
                }
                clientCore.LoadingManager.showSmall();
                net.sendAndWait(new pb.cs_get_level_activity_reward({ index: idx + 1, type: sendType })).then((data: pb.sc_get_level_activity_reward) => {
                    clientCore.LoadingManager.hideSmall(true);
                    let goods = clientCore.GoodsInfo.createArray(data.reward)
                    alert.showReward(goods);
                    if (sendType == 1)
                        this._lvRwdStatus[idx] = REWARD_STATUS.GETTED;
                    else if (sendType == 2)
                        this._lvVipRwdStatus[idx] = REWARD_STATUS.GETTED;
                    else if (sendType == 3) {
                        this._lvRwdStatus[idx] = REWARD_STATUS.GETTED;
                        this._lvVipRwdStatus[idx] = REWARD_STATUS.GETTED;
                    }
                    util.RedPoint.reqRedPointRefresh(3302);
                    this.show();
                }).catch(() => {
                    clientCore.LoadingManager.hideSmall(true);
                });
            }
        }
        removeEvent() {
            BC.removeEvent(this)
        }
    }
}