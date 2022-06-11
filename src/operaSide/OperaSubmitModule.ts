namespace operaSide {
    /**
     * 中秋话剧提交物资面板
     * operaSide.OperaSubmitModule
     */
    export class OperaSubmitModule extends ui.operaSide.OperaSubmitModuleUI {
        private _rewardFlg: number[];
        private _submitItemId: number;
        private _onceSubmitNum: number;
        constructor() {
            super();
            this.imgLeft.visible = this.side == 2;
            this.imgRight.visible = this.side == 1;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.list.dataSource = [1, 1, 1];
            this.itemSubmit.num.value = '';
        }

        get side() {
            return clientCore.OperaManager.instance.side;
        }

        onPreloadOver() {
            this.updateView();
        }

        private updateConfig() {
            this._onceSubmitNum = xls.get(xls.dramaBaseData).get(1).donateNum;
            let config = xls.get(xls.dramaArea).get(clientCore.OperaSideManager.instance.currArea);
            let side = Math.max(0, this.side - 1);
            let target = channel.ChannelControl.ins.isOfficial ? config.officialTarget[side] : config.channelTarget[side];
            this._submitItemId = target.v1;
            this.itemSubmit.ico.skin = clientCore.ItemsInfo.getItemIconUrl(target.v1);
            this.itemSubmit.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(target.v1);
            this.txtTitle.text = `每组至少提交${this._onceSubmitNum}个\n累计提交：`;
            this.txtHave.text = clientCore.ItemsInfo.getItemNum(this._submitItemId).toString();
            clientCore.ToolTip.addTips(this.itemSubmit, { id: this._submitItemId });
            this.imgTalk.skin = `operaSide/nan${this.side}.png`
        }

        private updateView() {
            net.sendAndWait(new pb.cs_submit_panel()).then((data: pb.sc_submit_panel) => {
                if (!this._closed) {
                    clientCore.OperaSideManager.instance.setdonateList(data.donateList);
                    this.txtSubmit.text = data.personalNum.toString();
                    this._rewardFlg = data.flag.slice();
                    this.list.startIndex = this.list.startIndex;
                    let nowPoint = clientCore.OperaSideManager.instance.progressNum;
                    let nowArea = clientCore.OperaSideManager.instance.currArea;
                    let nowAreaInfo = xls.get(xls.dramaArea).get(nowArea);
                    let side = Math.max(0, this.side - 1);
                    let totalPoint = channel.ChannelControl.ins.isOfficial ? nowAreaInfo.officialTarget[side].v2 : nowAreaInfo.channelTarget[side].v2;
                    this.imgProgress.width = Math.min(1, nowPoint / totalPoint) * 412;
                    this.txtProgress.text = nowPoint + '/' + totalPoint;
                    this.updateConfig();
                }
            })
        }

        private onListRender(cell: ui.operaSide.render.OperaSubmitRenderUI, idx: number) {
            let config = xls.get(xls.dramaArea).get(clientCore.OperaSideManager.instance.currArea);
            let side = this.side - 1;
            let target = channel.ChannelControl.ins.isOfficial ? config.officialTarget[side] : config.channelTarget[side];
            cell.txtInfo.text = `提交${clientCore.ItemsInfo.getItemName(target.v1)}达到${config.target[side]['v' + (idx + 1)]}份`;
            let rwdArr: xls.pair[] = config['reward' + (idx + 1)];
            cell.list.dataSource = _.map(rwdArr, (o) => {
                return {
                    ico: { skin: clientCore.ItemsInfo.getItemIconUrl(o.v1) },
                    imgBg: { skin: clientCore.ItemsInfo.getItemIconBg(o.v1) },
                    num: { value: o.v2.toString() }
                }
            });
            cell.list.mouseHandler = new Laya.Handler(this, this.onTaskRewardMouse, [rwdArr]);
            if (this._rewardFlg?.length) {
                cell.btnGet.disabled = this._rewardFlg[idx] == 0;
                cell.btnGet.visible = this._rewardFlg[idx] != 2;
                cell.imgGet.visible = this._rewardFlg[idx] == 2;
            }
        }

        private onTaskRewardMouse(rwd: xls.pair[], e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(e.target, { id: rwd[idx].v1 })
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && e.target.name == 'btnGet') {
                net.sendAndWait(new pb.cs_get_camp_submit_reward({ type: idx + 1 })).then((data: pb.sc_get_camp_submit_reward) => {
                    alert.showReward(data.items);
                    this._rewardFlg[idx] = 2;
                    this.list.startIndex = this.list.startIndex;
                }).catch(() => {
                    if (!this._closed)
                        this.updateConfig()
                })
            }
        }

        private onClose() {
            this.destroy();
            clientCore.ModuleManager.open('operaSide.OperaMapModule');
        }

        private onSubmit() {
            let submitNum = Math.floor(clientCore.ItemsInfo.getItemNum(this._submitItemId) / this._onceSubmitNum);
            if (submitNum == 0) {
                alert.showFWords(`物资不足，每组至少提交${this._onceSubmitNum}个`)
                return;
            }
            net.sendAndWait(new pb.cs_submit_materials()).then((data: pb.sc_submit_materials) => {
                alert.showFWords('物资提交成功!')
                this.updateView();
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.onSubmit);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            clientCore.ToolTip.removeTips(this.itemSubmit);
        }
    }
}