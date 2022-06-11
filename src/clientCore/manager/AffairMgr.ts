namespace clientCore {
    /**
     * 约会数据
     */
    export class AffairMgr {

        private _dateMap: util.HashMap<xls.date[]>;

        private _srvDateMap: util.HashMap<Object>;

        public currentSel: number = -1; //缓存当前的章节选择 为了从战斗或其他的模块返回

        /** 数据缓存是打开了*/
        private _isOpen: boolean = false;

        constructor() { }

        public async setup() {
            if (!this._isOpen) {
                this._isOpen = true;
                this._dateMap = new util.HashMap<xls.date[]>();
                this._srvDateMap = new util.HashMap<Object>();
                await xls.load(xls.date);
                await xls.load(xls.dateStage);
                //解析数据
                this.parseData();
                //监听章节变化
                net.listen(pb.sc_engagement_notify, this, this.synSrvMap);
            }
        }

        private parseData(): void {
            let _array: xls.date[] = xls.get(xls.date).getValues();
            _.forEach(_array, (element: xls.date) => {
                let _map: xls.date[] = this._dateMap.get(element.roleId);
                if (!_map) {
                    _map = [];
                    this._dateMap.add(element.roleId, _map);
                }
                _map.push(element);
            });
        }

        /**
         * 请求服务器约会数据
         * @param roleId 
         */
        reqDateInfo(roleId: number): Promise<void> {
            return new Promise((suc) => {
                if (this._srvDateMap.get(roleId)) {
                    suc();
                } else {
                    net.sendAndWait(new pb.cs_get_engagement_info({ roleId: roleId })).then((msg: pb.sc_get_engagement_info) => {
                        _.forEach(msg.engageInfo, (element: pb.Engagement) => { this.updateSrvMap(roleId, element) })
                        suc();
                    })
                }
            })
        }

        /**
         * 检查副本是否解锁了
         * @param roleId 
         * @param copyId 
         */
        checkChaperUnlock(roleId: number, copyId: number): boolean {
            let obj: Object = this._srvDateMap.get(roleId);
            return obj && obj[copyId] != null;
        }

        /**
         * 通过角色id获取约会副本数据
         * @param roleId 
         */
        getDateInfo(roleId: number): xls.date[] {
            return this._dateMap.get(roleId);
        }

        /**
         * 获取服务器某个玩家的某个章节信息
         * @param roleId 
         * @param copyId 
         */
        getSrvDateInfo(roleId: number, copyId: number): AffairInfo {
            let obj: Object = this._srvDateMap.get(roleId);
            if (obj) {
                return obj[copyId];
            }
            return null;
        }

        /**
         * 判断玩家的某个副本的某一步骤是否完成了
         * @param roleId 
         * @param copyId 
         * @param stageId 
         */
        checkStageComplete(roleId: number, copyId: number, stageId: number): boolean {
            let obj: Object = this._srvDateMap.get(roleId);
            if (obj) {
                let info: AffairInfo = obj[copyId];
                if (info && info.checkPass(stageId)) {
                    return true;
                }
            }
            return false;
        }

        /**
         * 获取步骤的状态  0-未通过 1-正在进行 2-已通过
         * @param roleId 
         * @param copyId 
         * @param stageId 
         */
        getStageStatus(roleId: number, copyId: number, stageId: number): number {
            let obj: Object = this._srvDateMap.get(roleId);
            if (obj) {
                let info: AffairInfo = obj[copyId];
                if (info) {
                    if (info.checkPass(stageId)) {
                        return 2;
                    } else if (info.currentStageId == stageId) {
                        return 1;
                    }
                }
            }
            return 0;
        }

        /**
         * 更新章节数据
         * @param roleId 
         * @param info 
         */
        private updateSrvMap(roleId: number, info: pb.IEngagement): void {
            let obj: Object = this._srvDateMap.get(roleId);
            if (!obj) {
                obj = {};
                this._srvDateMap.add(roleId, obj);
            }
            let data: AffairInfo = obj[info.id];
            data && data.clear();
            data = AffairInfo.create();
            data.copyId = info.id;
            data.currentStageId = info.nextId;
            data.passMap = info.awardList;
            data.isOver = info.nextId == 0;
            info.stageId != 0 && this.findPassStages(info.stageId, data);
            obj[info.id] = null;
            obj[info.id] = data;
        }

        /**
         * 收到服务器的通知
         * @param info 
         */
        private synSrvMap(msg: pb.sc_engagement_notify): void {
            let date: xls.date = xls.get(xls.date).get(msg.engageInfo.id);
            this.updateSrvMap(date.roleId, msg.engageInfo);
            EventManager.event(globalEvent.AFFAIR_UPDATE);
        }

        /**
         * 递归查找已完成的关卡
         * @param data 
         */
        private findPassStages(id: number, data: AffairInfo): void {
            data.passMap.push(id);
            function find(stageId: number): void {
                let xlsData: xls.dateStage = xls.get(xls.dateStage).get(stageId);
                if (xlsData && xlsData.require != 0) {
                    data.passMap.push(xlsData.require);
                    find(xlsData.require);
                }
            }
            // 开始查找
            find(id);
        }

        private static _ins: AffairMgr;
        public static get ins(): AffairMgr {
            return this._ins || (this._ins = new AffairMgr());
        }
    }

    export class AffairInfo {
        /** 章节ID*/
        copyId: number;
        /** 当前所在的关卡 如果是0 则表示该副本的所有关卡都已经完成辽*/
        currentStageId: number;
        /** 已经完成的关卡集合*/
        passMap: Array<number>;
        /** 副本是否完成了*/
        isOver: boolean;

        constructor() { }

        checkPass(stageId: number): boolean {
            return this.passMap.indexOf(stageId) != -1;
        }

        clear(): void {
            this.passMap && (this.passMap.length = 0);
            this.passMap = null;
            Laya.Pool.recover("AffairInfo", this);
        }

        static create(): AffairInfo {
            return Laya.Pool.getItemByClass("AffairInfo", AffairInfo);
        }
    }
}