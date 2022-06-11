namespace amusementPark {
    /**
     * 2020.9.14
     * 花仙游乐园
     * actingTrainee.AmusementParkModule  id176
     */
    export class AmusementParkModule extends ui.amusementPark.AmusementParkModuleUI {
        private _oriBgmUrl: string;
        private _info: pb.sc_park_time_panel;
        private _model: AmusementParkModel;
        private _control: AmusementParkControl;

        private _gamePanel: GamePanel;

        private readonly rankEventId: number = 159;
        private readonly rankId: number = 23;
        private _rankList: clientCore.RankInfo[];
        constructor() {
            super();
        }

        init(data: any) {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new AmusementParkModel(), new AmusementParkControl());
            this._model = clientCore.CManager.getModel(this.sign) as AmusementParkModel;
            this._control = clientCore.CManager.getControl(this.sign) as AmusementParkControl;
            this._control.model = this._model;
            this.panel.hScrollBarSkin = "";
            this._gamePanel = new GamePanel(this.sign);
            if (this.checkRankEvent()) {
                this.addPreLoad(clientCore.RankManager.ins.getSrvRank(this.rankId).then((data) => {
                    this._rankList = data;
                }));
                this.addPreLoad(clientCore.RankManager.ins.getUserRank(this.rankId, clientCore.LocalInfo.uid).then((data) => {
                    this.labRank.text = data?.msg?.ranking == 0 ? '默默无闻' : data?.msg?.ranking.toString();
                    this.labScore.text = "通关数:" + data?.msg?.score;
                }));
            }
            this.addPreLoad(xls.load(xls.park));
            this.addPreLoad(xls.load(xls.moduleOpen));
            this.listRank.renderHandler = new Laya.Handler(this, this.listRender);
            this.listRank.mouseHandler = new Laya.Handler(this, this.listMouse);
            this._oriBgmUrl = core.SoundManager.instance.currBgm;
            core.SoundManager.instance.playBgm('res/music/bgm/lalaLand.mp3', true);
            // let eventTime = xls.get(xls.eventControl).get(114).eventTime;
            // this.boxEvent.visible = clientCore.ServerManager.curServerTime >= util.TimeUtil.formatTimeStrToSec(eventTime.split("_")[0]) && clientCore.ServerManager.curServerTime < util.TimeUtil.formatTimeStrToSec(eventTime.split("_")[1]);
            // if (this.boxEvent.visible) {
            //     this.addPreLoad(net.sendAndWait(new pb.cs_park_time_panel()).then((data: pb.sc_park_time_panel) => {
            //         this._info = data;
            //     }))
            // }
            this.boxEvent.visible = false;
            this.resizeView();
        }

        onPreloadOver() {
            if (this.boxEvent.visible) {
                let limit = clientCore.FlowerPetInfo.petType >= 1 ? 40 : 30;
                this.labLimit.text = this._info.getItemCnt + "/" + limit;
            }
            if (this.boxRank.visible) {
                this.imgHead.skin = clientCore.LocalInfo.headImgUrl;
                this.listRank.visible = this._rankList.length > 0;
                this.listRank.array = this._rankList.slice(0, 3);
            }
        }

        popupOver() {
            if (this._data) {
                this.onClick(parseInt(this._data));
            }
            clientCore.Logger.sendLog('2020年9月14日活动', '【主活动】花仙游乐园', '打开游乐园面板');
        }

        private listRender(cell: ui.amusementPark.item.RankItemUI, idx: number) {
            let data = cell.dataSource as clientCore.RankInfo;
            let rank = data.msg as pb.IRankInfo;
            cell.labName.text = rank.userBase.nick;
            cell.labScore.text = "通关数:" + rank.score;
            cell.imgRank.skin = `amusementPark/top${rank.ranking}.png`;
            cell.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(rank.userBase.headImage);
        }

        private listMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.UserInfoTip.showTips(this.listRank.getCell(idx), this.listRank.getItem(idx).msg.userBase);
            }
        }

        private checkRankEvent() {
            let isOver = clientCore.SystemOpenManager.ins.checkActOver(this.rankEventId);
            this.boxRank.visible = !isOver;
            return !isOver;
        }

        private onMishi(): void {
            // this.destroy();
            clientCore.ToolTip.gotoMod(188);
        }

        private onCanche(): void {
            this.destroy();
            clientCore.ToolTip.gotoMod(229);
        }

        private onClick(index: number): void {
            this._gamePanel.init({ gameId: index });
            clientCore.DialogMgr.ins.open(this._gamePanel);
        }

        private resizeView(): void {
            this.panel.width = Laya.stage.width;
            this.boxView.x = 0;
            this.panel.hScrollBar.setScroll(0, this.boxView.width - this.panel.width, (this.boxView.width - this.panel.width) / 2);
            // this.panel.hScrollBar.value = (this.boxView.width - this.panel.width) / 2;
        }

        private openRank() {
            this.destroy();
            // clientCore.Logger.sendLog('2020年12月18日活动', '【付费】卷角之梦', '点击排行榜按钮');
            clientCore.ModuleManager.open('miniGameRank.MiniGameRankModule', null, { openWhenClose: 'amusementPark.AmusementParkModule' });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnMishi, Laya.Event.CLICK, this, this.onMishi);
            BC.addEvent(this, this.btnRank, Laya.Event.CLICK, this, this.openRank);
            for (let i = 1; i <= 13; i++) {
                BC.addEvent(this, this["btn" + i], Laya.Event.CLICK, this, this.onClick, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            if (this._oriBgmUrl)
                core.SoundManager.instance.playBgm(this._oriBgmUrl);
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            this._gamePanel?.destroy();
            this._gamePanel = null;
            super.destroy();
        }
    }
}