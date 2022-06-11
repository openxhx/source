namespace appreciate {
    export enum ITEM_TYPE {
        /** 装饰 */
        ZHUANGSHI = 1,
        /** 相框 */
        XIANGKUANG,
        /**底图 */
        DITU,
        /**背景秀 */
        BEIJINGXIU,
        /**舞台 */
        WUTAI,
        /**坐骑 */
        ZUOQI
    }
    export enum ITEM_NAME {
        /**玩家 */
        ROLE = "role",
        /**其他玩家--邀请 */
        ROLE2 = "role2",
        /**底图 */
        DITU = "bg",
        /**背景秀 */
        BEIJINGXIU = "show",
        /** 装饰 */
        ZHUANGSHI = "decorate",
        /** 相框 */
        XIANGKUANG = "photoFrame",
        /** 舞台 */
        WUTAI = "stage"
    }
    export class ShowData {
        id: number;
        type: number;
        name: string;
        PropsUnlock: number;
        vipLimit?: number;
        zoomOutLimit?: number;
        zoomInLimit?: number;
        posData?: { width: number, height: number, x: number, y: number };
        dynamic?:number;
        coordinate?:xls.pair;
        side?:number
    }
    export class AppreciateModel implements clientCore.BaseModel {
        private _bgDataList: xls.collocation[];
        private _showDataList: ShowData[];
        private _decorateDataList: xls.collocation[];
        private _photoFrameDataList: xls.collocation[];
        private _stageDataList: ShowData[];
        private _riderDataList: ShowData[];

        constructor() {
        }

        public getCollocation(type: number): ShowData[] {
            if (type == ITEM_TYPE.DITU) {
                this._bgDataList = this._bgDataList || this.getCollocationBy(type);
                return this._bgDataList;
            } else if (type == ITEM_TYPE.BEIJINGXIU) {
                if (!this._showDataList) {
                    this._showDataList = this._showDataList || this.getCollocationBy(type);
                    let arr = this.getBgshowBy(clientCore.CLOTH_TYPE.Bg)
                    for (let i = 0; i < arr.length; i++) {
                        let data: xls.bgshow = arr[i];
                        if (clientCore.ItemsInfo.checkHaveItem(data.id)) {
                            let posData = { width: 0, height: 0, x: 0, y: 0 };
                            if (data.showParameters && data.showParameters.length > 0) {
                                posData = { width: data.showParameters[0], height: data.showParameters[1], x: data.showParameters[2], y: data.showParameters[3] };
                            }
                            this._showDataList.push({ id: data.id, type: type, name: data.name, PropsUnlock: 1, posData: posData });
                        }
                    }
                }
                return this._showDataList;
            } else if (type == ITEM_TYPE.ZHUANGSHI) {
                this._decorateDataList = this._decorateDataList || this.getCollocationBy(type);
                return this._decorateDataList;
            } else if (type == ITEM_TYPE.XIANGKUANG) {
                this._photoFrameDataList = this._photoFrameDataList || this.getCollocationBy(type);
                return this._photoFrameDataList;
            } else if (type == ITEM_TYPE.WUTAI) {
                if (!this._stageDataList) {
                    this._stageDataList = this._stageDataList || this.getCollocationBy(type);
                    let arr = this.getBgshowBy(clientCore.CLOTH_TYPE.Stage);
                    for (let i = 0; i < arr.length; i++) {
                        let data: xls.bgshow = arr[i];
                        if (clientCore.ItemsInfo.checkHaveItem(data.id)) {
                            let posData = { width: 0, height: 0, x: 0, y: 0 };
                            if (data.showParameters && data.showParameters.length > 0) {
                                posData = { width: data.showParameters[0], height: data.showParameters[1], x: data.showParameters[2], y: data.showParameters[3] };
                            }
                            this._stageDataList.push({ id: data.id, type: type, name: data.name, PropsUnlock: 1, posData: posData });
                        }
                    }
                }
                return this._stageDataList;
            } else if (type == ITEM_TYPE.ZUOQI) {
                if (!this._riderDataList) {
                    this._riderDataList = this.getCollocationBy(type);
                    let arr = this.getBgshowBy(clientCore.CLOTH_TYPE.Rider);
                    for (let i = 0; i < arr.length; i++) {
                        let data: xls.bgshow = arr[i];
                        if (clientCore.ItemsInfo.checkHaveItem(data.id)) {
                            this._riderDataList.push({ id: data.id, type: type, name: data.name, PropsUnlock: 1 });
                        }
                    }
                }
                return this._riderDataList;
            }
            return [];
        }

        public getShowDataById(id: number): ShowData {
            let arr: ShowData[] = this.getCollocation(ITEM_TYPE.BEIJINGXIU);
            return _.find(arr, (element: ShowData) => { return element.id == id; })
        }

        public getStageDataById(id: number): ShowData {
            let arr: ShowData[] = this.getCollocation(ITEM_TYPE.WUTAI);
            return _.find(arr, (element: ShowData) => { return element.id == id; })
        }

        private getCollocationBy(type: number): xls.collocation[] {
            return _.filter(xls.get(xls.collocation).getValues(), (element: xls.collocation) => { return element.type == type; });
        }

        private getBgshowBy(type: number): xls.bgshow[] {
            return _.filter(xls.get(xls.bgshow).getValues(), (element: xls.bgshow) => { return element.clothKind == type; });
        }

        dispose(): void {
            this._bgDataList = null;
            this._showDataList = null;
            this._decorateDataList = null;
            this._photoFrameDataList = null;
            this._stageDataList = null;
        }
    }
}