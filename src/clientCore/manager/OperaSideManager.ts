namespace clientCore {
    /**中秋话剧-阵营系统管理器 */
    export class OperaSideManager {
        private static _instance: OperaSideManager;
        private _panelInfo: pb.sc_camp_map_panel;
        private _moraleNum: { left: number, right: number };
        public testFlg: boolean = true;

        constructor() {
            this._panelInfo = new pb.sc_camp_map_panel();
            this._moraleNum = { left: 0, right: 0 };
        }

        static get instance() {
            this._instance = this._instance || new OperaSideManager();
            return this._instance;
        }


        /**请求地图面板信息 */
        reqPanelInfo() {
            return net.sendAndWait(new pb.cs_camp_map_panel()).then((data: pb.sc_camp_map_panel) => {
                this._panelInfo = data;
            })
        }

        /**请求阵营点数信息 */
        refreshMoraleNum() {
            return net.sendAndWait(new pb.cs_get_morale_num(), true).then((data: pb.sc_get_morale_num) => {
                this._moraleNum.right = data.campOne;
                this._moraleNum.left = data.campTwo;
            })
        }

        /**鼓舞士气 
         * @param idx 0-2
         */
        buyMorale(idx: number, times: number = 1) {
            return net.sendAndWait(new pb.cs_camp_inspiring({ type: idx, times: times })).then((data: pb.sc_camp_inspiring) => {
                alert.showReward(data.items);
                this._moraleNum.right = data.campOne;
                this._moraleNum.left = data.campTwo;
            })
        }

        /**双方士气值 */
        get moraleNum() {
            return this._moraleNum;
        }

        /**当前正在进行的关卡下标 */
        get nowStageIdx() {
            let nowId: number;
            //如果是死亡或者结局节点
            if (clientCore.OperaManager.instance.currRouteId > 300) {
                nowId = clientCore.OperaManager.instance.parentRouteId;
            }
            else {
                nowId = clientCore.OperaManager.instance.currRouteId;
            }
            let configArr = xls.get(xls.dramaMap).getValues();
            return _.findIndex(configArr, o => o.nodes.indexOf(nowId) > -1);
        }

        /**今日已战斗次数 */
        get fightTimes() {
            return this._panelInfo.fightTimes;
        }

        get totalFightTimes() {
            //已购买 + 初始3次
            return this._panelInfo.buyTimes + 3;
        }

        get restFightTimes() {
            return this.totalFightTimes - this.fightTimes;
        }

        /**当前区域进度 */
        get progressNum() {
            return this._panelInfo.donateList[this.currArea - 1];
        }

        /**拉面板的时候 */
        setdonateList(arr: number[]) {
            this._panelInfo.donateList = arr.slice();
        }

        /**当前进行的区域ID 1-4 */
        get currArea() {
            let now = clientCore.ServerManager.curServerTime;
            let id: number = 1;
            let configArr = xls.get(xls.dramaArea).getValues();
            for (let i = 0; i < configArr.length; i++) {
                let config = configArr[i]
                let preconfig = i == 0 ? configArr[0] : configArr[i - 1];
                let side = Math.max(0, clientCore.OperaManager.instance.side - 1);
                let prevStageNeedNum = i == 0 ? 0 : (channel.ChannelControl.ins.isOfficial ? preconfig.officialTarget[side].v2 : preconfig.channelTarget[side].v2);
                let prevStageHaveNum = i == 0 ? 0 : this._panelInfo.donateList[i - 1];
                //判断时间和阵营点数是否满足
                if (now >= util.TimeUtil.formatTimeStrToSec(config.openTime) && prevStageHaveNum >= prevStageNeedNum) {
                    id = config.id;
                }
                else {
                    break;
                }
            }
            return id;
        }

        /**获取扫荡可获得的奖励 */
        getSweepRewardByIdx(idx: number) {
            if (this._panelInfo.mopNum.length >= idx - 1) {
                return this._panelInfo.mopNum[idx];
            }
            return 0;
        }

        /**扫荡关卡 */
        sweepStage(stageId: number) {
            return net.sendAndWait(new pb.cs_camp_mop_up({ sceneId: stageId })).then((data: pb.sc_camp_mop_up) => {
                alert.showReward(data.items);
                this._panelInfo.fightTimes += 1;
            })
        }

        private _okFun: Function;
        buyFightTimes() {
            let config = xls.get(xls.dramaBaseData).get(1).battleCost;
            let price = config.v1 + config.v2 * this._panelInfo.buyTimes;
            price = Math.min(price, config.v3);
            return new Promise((ok) => {
                this._okFun = ok;
                alert.showSmall(`确定花费${price}灵豆购买一次战斗次数吗?`, { callBack: { caller: this, funArr: [this.sureBuyFight, ok] } })
            })
        }

        private sureBuyFight() {
            net.sendAndWait(new pb.cs_buy_battle_times()).then(() => {
                alert.showFWords('购买成功！')
                this._panelInfo.buyTimes += 1;
                this._okFun();
            }).catch(() => {
                this._okFun();
            })
        }

        /** 实名信息 */
        get realNameInfo(): { name: string, address: string, phone: string, height: string, weight: string } {
            let obj
            try {
                obj = JSON.parse(this._panelInfo.userInfo);
            }
            catch (e) {
            }
            return obj;
        }

        /**保存实名信息 */
        setRealNameInfo(name: string, address: string, phone: string, height: string, weight: string) {
            let str = '';
            try {
                str = JSON.stringify({ 'name': name, 'address': address, 'phone': phone, 'height': height, 'weight': weight });
            }
            catch (e) {
            }
            if (!str) {
                alert.showFWords('信息不合法');
                return;
            }
            return net.sendAndWait(new pb.cs_save_camp_user_info({ userInfo: str })).then((data: pb.sc_save_camp_user_info) => {
                alert.showFWords('保存成功');
                this._panelInfo.userInfo = str;
            })
        }
    }
}