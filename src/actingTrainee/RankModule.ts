namespace actingTrainee {
    /**
     * 2020.9.14
     * 演剧练习生-排行榜界面
     * actingTrainee.RankModule
     */
    export class RankModule extends ui.actingTrainee.RankModuleUI {
        private _t: time.GTime;
        private _delayT: number;
        private _currentIndex: number;
        private _isShowTip: Boolean = false;

        private _model: ActingTraineeModel;
        private _control: ActingTraineeControl;

        init(data?: any) {
            super.init(data);

            this.sign = clientCore.CManager.regSign(new ActingTraineeModel(), new ActingTraineeControl());
            this._control = clientCore.CManager.getControl(this.sign) as ActingTraineeControl;
            this._model = clientCore.CManager.getModel(this.sign) as ActingTraineeModel;

            this.addPreLoad(xls.load(xls.rankInfo));

            this.listRank.itemRender = RankItem;
            this.listRank.renderHandler = new Laya.Handler(this, this.onTaskRender);
            this.listRank.mouseHandler = new Laya.Handler(this, this.onTaskMouse);
            this.listRank.array = null;
        }

        async onPreloadOver() {
            let infos: clientCore.RankInfo[] = await clientCore.RankManager.ins.getSrvRank(this._model.rank_Id, 0, 99);
            let myInfo: clientCore.RankInfo = await clientCore.RankManager.ins.getUserRank(this._model.rank_Id, clientCore.LocalInfo.uid);
            if (!infos || !myInfo) {
                alert.showFWords("未能成功获取数据~");
                return;
            }
            this.imgGirl.visible = clientCore.LocalInfo.sex == 1;
            this.imgBoy.visible = clientCore.LocalInfo.sex != 1;

            this.labMyValue.text = this._model.tokenNum + '';
            this.labMyRanl.text = myInfo.msg.ranking > 0 ? myInfo.msg.ranking + '' : "默默无闻";

            this.listRank.array = infos;

            for (let i = 0; i < 3; i++) {
                let info: clientCore.RankInfo = infos[i];
                let item = this["imgRoleTop" + (i + 1)];
                if (info && info.msg instanceof pb.RankInfo) {
                    item.skin = clientCore.ItemsInfo.getItemIconUrl(info.msg.userBase.headImage);
                    item.visible = true;
                    BC.addEvent(this, item, Laya.Event.CLICK, this, this.showRoleTips, [item, info.msg.userBase]);
                } else {
                    item.visible = false;
                }
            }

            this.initTime();
        }

        private initTime(): void {
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.updateTime);
            this._delayT = this._model.checkActivity();
            this.updateTime();
            this._t.start();
        }

        private updateTime(): void {
            this._delayT--;
            if (this._delayT <= 0) {
                this.labTime.text = "已截止";
                this._t.stop();
                return;
            }
            this.labTime.text = util.StringUtils.getDateStr2(this._delayT);
        }

        private onTaskRender(item: RankItem, index: number) {
            item.setData(this.listRank.array[index]);
        }

        private onTaskMouse(e: Laya.Event, index: number) {
            if (e.type != Laya.Event.CLICK) return;
            if (index == this._currentIndex && this._isShowTip) {
                this._isShowTip = false;
                clientCore.UserInfoTip.hideTips();
                return;
            }
            let item: Laya.Box = this.listRank.getCell(this._currentIndex);
            if (item) {
                item["imgSelect"].visible = false;
            }
            this._currentIndex = index;
            item = this.listRank.getCell(index);
            if (item) {
                item["imgSelect"].visible = true;
            }

            let data: clientCore.RankInfo = this.listRank.array[index];
            if (data.msg instanceof pb.RankInfo) this.showRoleTips(item, data.msg.userBase);
            this._isShowTip = true;
        }

        private showRoleTips(item: any, data: any): void {
            clientCore.UserInfoTip.showTips(item, data);
        }

        close() {
            this.destroy();
            clientCore.ModuleManager.open("actingTrainee.ActingTraineeModule");
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId2);
        }

        private onTry2(): void {
            alert.showPreviewModule([this._model.beijingxiu_id, this._model.wutai_id]);
        }

        private onOpenAuditionInfo(index: number): void {
            this.destroy();
            clientCore.ModuleManager.open("actingTrainee.AuditionInfoModule", { type: index }, { openWhenClose: "actingTrainee.RankModule" });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTry2);
            BC.addEvent(this, this.btnAudition1, Laya.Event.CLICK, this, this.onOpenAuditionInfo, [0]);
            BC.addEvent(this, this.btnAudition2, Laya.Event.CLICK, this, this.onOpenAuditionInfo, [1]);
            BC.addEvent(this, this.btnAudition3, Laya.Event.CLICK, this, this.onOpenAuditionInfo, [2]);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            this._t?.dispose();
            this._t = null;
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}