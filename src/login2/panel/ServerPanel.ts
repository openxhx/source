namespace login2.panel {
    /**
     * 服务器列表
     */
    export class ServerPanel extends ui.login2.panel.ServerPanelUI {


        private _xlsData: util.HashMap<xls.serverName>;
        private _curSrv: pb.IonlineInfo;
        private _allSrv: pb.IonlineInfo[];
        private _lastId: number;
        private _serverIdMap: util.HashMap<number>;
        private _firstId: number;

        constructor() {
            super();
            this.reList.renderHandler = Laya.Handler.create(this, this.recommandRender, null, false);
            this.reList.selectHandler = Laya.Handler.create(this, this.recommandSelect, null, false);
            this.serverList.vScrollBarSkin = "";
            this.serverList.renderHandler = Laya.Handler.create(this, this.serverRender, null, false);
            this.serverList.selectHandler = Laya.Handler.create(this, this.serverSelect, null, false);
            this.serverList.scrollBar.elasticBackTime = 200;
            this.serverList.scrollBar.elasticDistance = 200;
            this._serverIdMap = new util.HashMap();
        }

        public show(array: pb.IonlineInfo[]): void {
            clientCore.DialogMgr.ins.open(this);
            this._xlsData = xls.get(xls.serverName);
            this._firstId = array[0].id;
            this.updateView(array);
        }

        private onInputOver() {
            let targetId = this.txtInput.text
            let idx = _.findIndex(this._allSrv, (o) => { return o.id == parseInt(targetId) });
            if (idx > -1) {
                this.serverList.dataSource = [this._allSrv[idx]];
                this.selectRender(this._allSrv[idx], idx);
            }
            else {
                this.serverList.array = this._allSrv;
                let ran = _.random(0, this._allSrv.length - 1, false);
                this.selectRender(this._allSrv[ran], idx);
            }
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.txtInput, Laya.Event.INPUT, this, this.onInputOver);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy(): void {
            this._curSrv = this._xlsData = null;
            super.destroy();
        }

        private hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        private onSure(): void {
            EventManager.event(globalEvent.SELECT_ONE_SERVER, this._curSrv);
            this.hide();
        }

        // status 1-4 空闲 推荐 火热 爆满
        private updateView(array: pb.IonlineInfo[]): void {
            this._allSrv = [];
            //扩大4倍
            for (let i = 0; i < 4; i++) {
                this._allSrv = this._allSrv.concat(_.cloneDeep(array));
            }
            for (let i = 0; i < this._allSrv.length; i++) {
                this._allSrv[i]['fakeId'] = this.getFakeServerId(i);
            }
            //多复制的隐藏服去掉
            let hiddenSrv = _.find(this._allSrv, o => o.id == 19999);
            if (hiddenSrv) {
                _.remove(this._allSrv, o => o.id == 19999)
                this._allSrv.push(hiddenSrv);
            }
            this._lastId = parseInt(window.localStorage.getItem('history_server_id'));
            this.serverList.array = _.shuffle(this._allSrv);
            // this.serverList.array = this._allSrv;
            this.reList.array = _.concat(_.filter(this._allSrv, (element) => { return element['fakeId'] == this._lastId; }), _.filter(this._allSrv, (element) => { return element['fakeId'] != this._lastId; }));
            this.serverList.selectedIndex = _.random(0, array.length - 1, false);
        }

        /** 当前选择渲染*/
        private selectRender(info: pb.IonlineInfo, idx: number): void {
            this.curServer.imgBG.skin = "selectServer/rect2.png";
            this.itemRender(this.curServer, info, idx, true);
            this._curSrv = info;
        }

        /** 推荐服务器渲染 */
        private recommandRender(item: ui.login2.item.ServerItemUI, index: number): void {
            let info: pb.IonlineInfo = item.dataSource;
            item.imgBG.skin = "selectServer/rect3.png";
            this.itemRender(item, info, index);
        }

        private recommandSelect(index: number): void {
            if (index == -1) return;
            this.selectRender(this.reList.array[index], index);
            this.serverList.selectedIndex = -1;
        }

        /** 全部服务器渲染*/
        private serverRender(item: ui.login2.item.ServerItemUI, index: number): void {
            let info: pb.IonlineInfo = item.dataSource;
            item.imgBG.skin = index == this.serverList.selectedIndex ? "selectServer/rect4.png" : "selectServer/rect1.png";
            this.itemRender(item, info, index);
        }

        private serverSelect(index: number): void {
            if (index == -1) return;
            this.selectRender(this.serverList.array[index], index);
            this.reList.selectedIndex = -1;
        }

        private itemRender(item: ui.login2.item.ServerItemUI, info: pb.IonlineInfo, index: number, isCur?: boolean): void {
            if (!item || !info) return;
            if (!this._xlsData) return;
            let excelId = info['fakeId'];
            if (info.id == 19999) {
                excelId = 9999;
            }
            let name = this._xlsData.has(excelId % 10000) ? this._xlsData.get(excelId % 10000).serverName : this._xlsData.get(excelId % 600)?.serverName;
            item.txID.changeText(excelId + "");
            item.txName.text = name ? name : ' ';
            let isBoom: boolean = info.status == 4;
            item.imgBm.visible = isBoom;
            item.imgCir.skin = isBoom ? "selectServer/yuan_new.png" : "selectServer/yuan_new_!.png";
            item.imgHistory.visible = !isCur && this._lastId == excelId;
        }

        private getFakeServerId(idx: number) {
            if (!this._serverIdMap.has(idx)) {
                this._serverIdMap.add(idx, this._firstId + this._serverIdMap.length);
            }
            return this._serverIdMap.get(idx);
        }
    }
}