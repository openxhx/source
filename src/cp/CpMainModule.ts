namespace cp {
    import CpMgr = clientCore.CpManager;
    import CP_STATU = clientCore.CP_STATU;

    const SCALE = 0.6;
    export class CpMainModule extends ui.cp.CpMainModuleUI {
        private _selfPerson: clientCore.Person;
        private _cpPerson: clientCore.Person;
        private _cpMessage: clientCore.Bone;

        private _applyListPanel: CpApplyListPanel;
        private _changeRingPanel: CpChangeRingPanel;
        private _selectRingPanel: CpSelectRingPanel;
        private _sendListPanel: CpSendListPanel;
        private _letterPanel: CpLetterPanel;
        private _divorcePanel: CpDivorcePanel;
        private _divorceAlert: CpDivorceAlert;
        private _cpSuccesAlert: CpSuccesAlertPanel;
        private _cpTitlePanel: CpTitlePanel;
        private _cpBridePanel: CpBridePanel;
        private CANCLE_TIME: number;

        init(d: any) {
            super.init(d);
            this._selfPerson = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
            this._selfPerson.scale(-SCALE, SCALE);
            this._selfPerson.pos(470, 376);
            this.addChildAt(this._selfPerson, 1);
            this.addPreLoad(xls.load(xls.cpRing));
            this.addPreLoad(xls.load(xls.friendLevel));
            this.addPreLoad(xls.load(xls.cpShop));
            this.addPreLoad(CpMgr.instance.refreshCpUserInfo());
            this.addPreLoad(clientCore.ModuleManager.loadatlas('cp/title'))
            this.addPreLoad(clientCore.ModuleManager.loadatlas('cp/bride'))
            clientCore.MaskManager.alpha = 0.3;
            this._cpMessage = clientCore.BoneMgr.ins.play('res/animate/cpRing/envelope.sk', 0, true, this.btnMessage);
            this._cpMessage.pos(112.5, 132.5);
            this.btnBride.skin = clientCore.LocalInfo.sex == 2 ? 'cp/chu_fa__nan.png' : 'cp/chu_fa__nu.png';
        }

        onPreloadOver() {
            this.CANCLE_TIME = xls.get(xls.cpCommonDate).get(1).cancelCdTime;
            this.updateView();
            if (CpMgr.instance.selfWeddingInfo?.weddingInfo) {
                if (clientCore.ServerManager.curServerTime > CpMgr.instance.selfWeddingInfo.weddingInfo.startTime + 3600)
                    this.btnWedding.gray = true;
            }
        }

        popupOver() {
            this.displayDivorceAlert();
            if (this._data == 'bride') {
                this.onBride()
            }
        }

        updateView() {
            this.btnTitle.visible = CpMgr.instance.haveCp();
            let cpInfo = CpMgr.instance.cpInfo;
            this.boxNoCp.visible = !(cpInfo instanceof pb.CpInfo);
            this.btnMessage.visible = !(cpInfo instanceof pb.CpInfo) || (cpInfo && cpInfo.status == CP_STATU.APPLYING);//没有cp或者等待回复状态
            this.boxWaitCp.visible = cpInfo && cpInfo.status == CP_STATU.APPLYING;
            this.boxHaveCp.visible = cpInfo && cpInfo.status != CP_STATU.APPLYING;
            //判断是否需要删除一下person,(没有cp,或者正在申请中)
            if (!cpInfo || cpInfo.status == CP_STATU.APPLYING) {
                this._cpPerson?.destroy();
                this._cpPerson = null;
            }
            if (cpInfo) {
                this.txtNick.text = cpInfo.userBase.nick;
                this.txtTime.text = util.TimeUtil.analysicYear(cpInfo.applyTime).split(' ')[0];
                this.imgRing.skin = clientCore.ItemsInfo.getItemIconUrl(CpMgr.instance.currRingId);
                let friendInfo = clientCore.FriendManager.instance.getFriendInfoById(cpInfo.coupleId);
                this.txtNum.text = friendInfo ? friendInfo.friendShip.toString() : `无数据${cpInfo.coupleId}`;
                this.txtPair.text = CpMgr.instance.cpRank.toString();
            }
            else {
                //如果没有cp信息(被强制解约)，关闭解约弹窗
                this._divorceAlert?.onClose();
                this._divorcePanel?.onClose();
            }
            //CP角色展现
            let needShowPerson = cpInfo && cpInfo.status != CP_STATU.APPLYING;
            if (needShowPerson) {
                let userbase = cpInfo.userBase;
                if (!this._cpPerson) {
                    this._cpPerson = new clientCore.Person(userbase.sex, userbase.curClothes);
                    this._cpPerson.scale(SCALE, SCALE);
                    this._cpPerson.pos(850, 376);
                    this.addChildAt(this._cpPerson, 1);
                }
                else {
                    this._cpPerson?.replaceByIdArr(userbase.curClothes);
                }
            }
            else {
                this._cpPerson?.destroy();
                this._cpPerson = null;
            }
            //如果等待中，开始倒计时判断
            if (this.boxWaitCp.visible) {
                Laya.timer.clear(this, this.onTimer);
                Laya.timer.loop(1, this, this.onTimer);
                this.onTimer();
            }
            else {
                Laya.timer.clear(this, this.onTimer);
            }
            this.onApplyListChange();
            this.btnWedding.gray = false;
            if (CpMgr.instance.selfWeddingInfo?.weddingInfo) {
                if (clientCore.ServerManager.curServerTime > CpMgr.instance.selfWeddingInfo.weddingInfo.startTime + 3600)
                    this.btnWedding.gray = true;
            }
        }

        private onTimer() {
            let cpInfo = CpMgr.instance.cpInfo;
            if (this.boxWaitCp.visible && cpInfo) {
                let diffTime = clientCore.ServerManager.curServerTime - cpInfo.applyTime;
                this.boxCancle.visible = diffTime >= this.CANCLE_TIME;
                this.boxWaitCancle.visible = diffTime < this.CANCLE_TIME;
                this.txtWaitTime.text = util.StringUtils.getTime(this.CANCLE_TIME - diffTime, '{hour}:{min}:{sec}');
                //如果可以取消了，去掉倒计时
                if (diffTime >= this.CANCLE_TIME) {
                    Laya.timer.clear(this, this.onTimer);
                }
            }
        }

        private onMessage() {
            this._applyListPanel = this._applyListPanel || new CpApplyListPanel();
            this._applyListPanel.show();
            this._applyListPanel.on(Laya.Event.CHANGED, this, this.onOpenApply);
        }

        private onOpenApply(info: pb.ICpInfo) {
            this._applyListPanel?.onClose();
            this._letterPanel = this._letterPanel || new CpLetterPanel();
            this._letterPanel.offAll();
            this._letterPanel.show('notice', info.userBase.nick, info.toolId);
            //确认了就关闭申请列表面板
            this._letterPanel.on(Laya.Event.START, this, () => {
                clientCore.CpManager.instance.replyCp(info.coupleId, 1);
            })
            this._letterPanel.on(Laya.Event.END, this, () => {
                clientCore.CpManager.instance.replyCp(info.coupleId, 2);
            })
        }

        private onDivorce() {
            this._divorcePanel = this._divorcePanel || new CpDivorcePanel();
            this._divorcePanel.show();
        }

        private async onWedding() {
            if (CpMgr.instance.selfWeddingInfo?.weddingInfo) {
                if (clientCore.ServerManager.curServerTime > CpMgr.instance.selfWeddingInfo.weddingInfo.startTime + 3600)
                    alert.showFWords('你已经举行过结缘礼了');
                else
                    clientCore.ModuleManager.open('wedding.WeddingWaitModule');
            }
            else
                clientCore.ModuleManager.open('wedding.WeddingAppointmentModule')
        }

        private onRank() {
            clientCore.ModuleManager.open('cpRank.CpRankModule');
        }


        private _tmpUid: number;
        private _tmpRing: number;
        private async onCp(step: number = 0) {
            if (step >= 0) {
                let funArr = [this.cpStep1, this.cpStep2, this.cpStep3];
                for (let i = step; i < funArr.length; i++) {
                    let fun = funArr[i];
                    try {
                        await fun.call(this);
                        step++;
                    } catch (error) {
                        this.onCp(step - 1);
                        break;
                    }
                }
                //全部确定了
                if (step == funArr.length) {
                    CpMgr.instance.applyCp(this._tmpUid, this._tmpRing);
                }
            }
        }

        /**1： 选择要邀请的对象 */
        private cpStep1(): Promise<number> {
            return new Promise((ok, fail) => {
                this._sendListPanel = this._sendListPanel || new CpSendListPanel();
                this._sendListPanel.show();
                this._sendListPanel.on(Laya.Event.START, this, (data: number) => {
                    this._tmpUid = data;
                    ok();
                })
                this._sendListPanel.on(Laya.Event.END, this, () => {
                    fail('没选择结缘对象')
                })
            })
        }

        /**2：选择邀请用的戒指 */
        private cpStep2(): Promise<number> {
            return new Promise((ok, fail) => {
                this._selectRingPanel = this._selectRingPanel || new CpSelectRingPanel();
                this._selectRingPanel.show();
                this._selectRingPanel.on(Laya.Event.START, this, (data: number) => {
                    this._tmpRing = data;
                    ok();
                })
                this._selectRingPanel.on(Laya.Event.END, this, () => {
                    fail('没选择要用的戒指')
                })
            })
        }

        /**最后的确认界面 */
        private cpStep3(): Promise<boolean> {
            return new Promise((ok, fail) => {
                this._letterPanel = this._letterPanel || new CpLetterPanel();
                this._letterPanel.offAll();
                this._letterPanel.show('apply', '', this._tmpRing);
                this._letterPanel.on(Laya.Event.START, this, (data: number) => {
                    ok();
                })
                this._letterPanel.on(Laya.Event.END, this, () => {
                    fail('取消了')
                })
            })
        }

        private onCancle() {
            CpMgr.instance.cancleApplyCp();
        }

        private onChangeRing() {
            this._changeRingPanel = this._changeRingPanel || new CpChangeRingPanel();
            this._changeRingPanel.show();
            this._changeRingPanel.on(Laya.Event.CHANGED, this, (ringId: number) => {
                this.imgRing.skin = clientCore.ItemsInfo.getItemIconUrl(ringId);
            })
        }

        private onShop() {
            clientCore.ModuleManager.open('cpShop.CpShopModule');
        }

        private onTask() {
            clientCore.ModuleManager.open('cpTask.CpTaskModule');
        }

        private onApplyListChange() {
            if (this._cpMessage) {
                this._cpMessage.visible = CpMgr.instance.applyList.length > 0;
                this.imgMessage.visible = !this._cpMessage.visible;
            }
        }

        /**弹出解约通知 */
        private displayDivorceAlert() {
            let divorceInfo = CpMgr.instance.getDivorceAlert();
            if (divorceInfo) {
                this._divorceAlert = this._divorceAlert || new CpDivorceAlert();
                this._divorceAlert.show(divorceInfo);
                //当前开着解约面板的话 给他关了
                this._divorcePanel?.onClose();
            }
        }

        private diplayCpInitAlert() {
            this._cpSuccesAlert = this._cpSuccesAlert || new CpSuccesAlertPanel();
            if (CpMgr.instance.cpInfo)
                this._cpSuccesAlert.show(CpMgr.instance.cpInfo.userBase.nick);
        }

        private onDetail() {
            alert.showRuleByID(11);
        }

        private onTitle() {
            this._cpTitlePanel = this._cpTitlePanel || new CpTitlePanel();
            this._cpTitlePanel.show();
        }

        private onBride() {
            this._cpBridePanel = this._cpBridePanel || new CpBridePanel();
            this._cpBridePanel.show();
            this._cpBridePanel.on(Laya.Event.COMPLETE, this, this.onShop);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnMessage, Laya.Event.CLICK, this, this.onMessage);
            BC.addEvent(this, this.btnDivorce, Laya.Event.CLICK, this, this.onDivorce);
            BC.addEvent(this, this.btnWedding, Laya.Event.CLICK, this, this.onWedding);
            BC.addEvent(this, this.btnRank, Laya.Event.CLICK, this, this.onRank);
            BC.addEvent(this, this.btnCp, Laya.Event.CLICK, this, this.onCp, [0]);
            BC.addEvent(this, this.btnCancle, Laya.Event.CLICK, this, this.onCancle);
            BC.addEvent(this, this.btnShop, Laya.Event.CLICK, this, this.onShop);
            BC.addEvent(this, this.btnTask, Laya.Event.CLICK, this, this.onTask);
            BC.addEvent(this, this.imgRing, Laya.Event.CLICK, this, this.onChangeRing);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnTitle, Laya.Event.CLICK, this, this.onTitle);
            BC.addEvent(this, this.btnBride, Laya.Event.CLICK, this, this.onBride);
            BC.addEvent(this, EventManager, globalEvent.CP_INFO_UPDATE, this, this.updateView);
            BC.addEvent(this, EventManager, globalEvent.CP_APPLY_LIST_UPDATE, this, this.onApplyListChange);
            BC.addEvent(this, EventManager, globalEvent.CP_DIVORCE_ALERT, this, this.displayDivorceAlert);
            BC.addEvent(this, EventManager, globalEvent.CP_RELATION_INIT_ALERT, this, this.diplayCpInitAlert);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTimer);
        }

        destroy() {
            super.destroy();
            clientCore.MaskManager.alpha = 0.7;
            this._cpMessage?.dispose();
            this._applyListPanel?.destroy();
            this._changeRingPanel?.destroy();
            this._selectRingPanel?.destroy();
            this._sendListPanel?.destroy();
            this._letterPanel?.destroy();
            this._divorceAlert?.destroy();
            this._divorcePanel?.destroy();
            this._cpPerson?.destroy();
            this._selfPerson?.destroy();
            this._cpSuccesAlert?.destroy();
            this._cpTitlePanel?.destroy();
        }
    }
}