
namespace clientCore {
    enum ACTION_STATE {
        /**执行事件前 */
        BEFORE_EVENT,
        /**等待事件完成 */
        WAIT_EVENT,
        /**事件完成，等待选择 */
        WAIT_CHOOSE,
        /**选择完毕，执行选择后果，同步后台 */
        AFTER_CHOOSE,
    }

    /**选择阵营节点ID */
    const CHOOSE_ROUTE_ID: number = 5;
    /**真结局节点（其他6个结局都完成才行) */
    const TRUE_ENDING_ID: number = 407;

    /**最后之战开启时间 */
    const FINAL_FIGHT_TIME = '2020-10-08 00:00:00';
    /**中秋话剧开启时间 */
    const OPEN_TIME = '2020-9-30 18:00:00';

    export class OperaManager {
        public testFlg: boolean = false;
        public skipGame: boolean = false;
        public skipFight: boolean = false;
        public skipAni: boolean = false;

        private static _instance: OperaManager;
        private _currRouteId: number = 0;
        private _state: ACTION_STATE = ACTION_STATE.BEFORE_EVENT;
        private _currChoose: number = 0;
        private _srvInfo: pb.sc_mid_autumn_drama_get_info;
        /**缓存结局奖励 */
        private _cacheReward: pb.IItem[];
        /**开场动画是否播放过 */
        public startAniFlg: boolean = false;

        constructor() {
            EventManager.on(globalEvent.MID_OPERA_EVENT_COMPLETE, this, this.onEventComplete);
        }

        static get instance() {
            this._instance = this._instance || new OperaManager()
            return this._instance;
        }

        loadConfig() {
            return Promise.all([
                xls.load(xls.dramaArea),
                xls.load(xls.dramaMap),
                xls.load(xls.dramaBaseData),
                xls.load(xls.dramaRoute),
                xls.load(xls.dramaAward),
                xls.load(xls.rankInfo)
            ])
        }

        get haveInfo() {
            return !_.isUndefined(this._srvInfo);
        }

        checkConfig() {
            let all = xls.get(xls.dramaRoute).getValues();
            for (const o of all) {
                //配了多个子节点，没有配选项的
                if (o.nextId.length > 1 && o.choose.length < 2) {
                    console.warn(`配了多个子节点，没有配选项` + o.id);
                }
                if (o.choose.length > o.choiceEffect.length) {
                    console.warn(`选项数 多于 选项后果数` + o.id);
                }
                if (o.choose.length != o.content.length && o.content.length > 0 && o.id < 400 && o.content.length > 1) {
                    console.warn(`剧情缩略和选项数不匹配` + o.id)
                }
            }
        }

        /**判断是否为选择分支节点 */
        checkIsChooseSideRouteId(id: number) {
            return id == CHOOSE_ROUTE_ID;
        }

        /**当前阵营 1或2， 0为还未选择阵营 */
        get side() {
            //如果没有查询过后台数据，那就是没有阵营
            if (this._currRouteId == 0) {
                return 0;
            }
            //根据当前所在节点判断 100开头是1阵营 200开头是2阵营
            if (this._currRouteId == CHOOSE_ROUTE_ID) {
                return this._currChoose;
            }
            else if (this._currRouteId == TRUE_ENDING_ID) {
                //如果是真结局节点
                return 0;
            }
            else {
                //还没到选择阵营节点，就是没有阵营
                if (this._currRouteId < CHOOSE_ROUTE_ID) {
                    return 0
                }
                else {
                    //如果是死亡或者结局节点，判断父节点是什么阵营
                    if (this._currRouteId > 300)
                        return this.parentRouteId < 200 ? 1 : 2;
                    else
                        return this._currRouteId < 200 ? 1 : 2;
                }
            }
        }

        get remainTime() {
            return this._srvInfo.remainTimes;
        }

        get hot() {
            return this._srvInfo.totalAudicenNum;
        }

        get faovr() {
            return this._srvInfo.curFavorNum;
        }

        get currRouteId() {
            return this._currRouteId;
        }

        get parentRouteId() {
            return _.find(xls.get(xls.dramaRoute).getValues(), o => o.nextId.indexOf(this._currRouteId) > -1).id;
        }

        get curRouteInfo() {
            if (xls.get(xls.dramaRoute).has(this._currRouteId)) {
                return xls.get(xls.dramaRoute).get(this._currRouteId);
            }
            else {
                return null;
            }
        }

        /**判断是否跳过（整个活动中是否跳过） */
        checkRouteJumped(id: number) {
            return this._srvInfo.allJumpNodes.indexOf(id) > -1;
        }

        /**判断是否选过某个选项
         * @param id routeId
         * @param chooseId 选项id 1开始
         */
        checkChooseDone(id: number, chooseId: number) {
            //如果节点没有选项 则选项id是0
            if (xls.get(xls.dramaRoute).get(id).choose.length == 0) {
                chooseId = 0;
            }
            //选择分支节点特殊处理,经过了该节点就认为选过
            if (id == CHOOSE_ROUTE_ID) {
                return this._currRouteId > CHOOSE_ROUTE_ID;
            }
            let str = id + '_' + chooseId;
            return this._srvInfo.chooseNodes.indexOf(str) > -1;
        }

        /**请求话剧进度信息 */
        reqDramaInfo() {
            return net.sendAndWait(new pb.cs_mid_autumn_drama_get_info()).then((data: pb.sc_mid_autumn_drama_get_info) => {
                this._srvInfo = data;
                this._currRouteId = data.curNode;
                if (this.checkHaveAllBranchEnding() && !this.chechHaveTrueEnding()) {
                    //如果两个主角结局都通关了，进行真结局
                    this._currRouteId = TRUE_ENDING_ID;
                }
            })
        }

        /**执行当前节点动作 */
        async actionCurrRoute() {
            this.log('执行节点动作')
            switch (this._state) {
                case ACTION_STATE.BEFORE_EVENT:
                    this.handleEvent();
                    break;
                case ACTION_STATE.WAIT_EVENT:
                    this.handleEvent();
                    break;
                case ACTION_STATE.WAIT_CHOOSE:
                    this.waitChoose();
                    break;
                case ACTION_STATE.AFTER_CHOOSE:
                    await this.waitChooseEffect();
                    this.syncWithServer();
                    break;
                default:
                    break;
            }
        }

        /**判断是否有可以进行的action
         * 主要是解决战斗和交互等需要跳出面板的情况
         */
        checkHasActionTodo() {
            if (this._state == ACTION_STATE.WAIT_CHOOSE) {
                this.actionCurrRoute();
            }
            if (this._currRouteId == CHOOSE_ROUTE_ID) {
                this.actionCurrRoute();
            }
        }

        private onEventComplete(data: number) {
            this.log('事件完成' + `  当前是否等待事件 ${this._state == ACTION_STATE.WAIT_EVENT ? '是' : '否'}`);
            if (this._currRouteId == CHOOSE_ROUTE_ID) {
                //如果是随机选择 选一个人少的
                data = data == 3 ? (this._srvInfo.numA > this._srvInfo.numB ? 2 : 1) : data;
                this._currChoose = data;
                this._state = ACTION_STATE.AFTER_CHOOSE;
            }
            //当前等待事件，且event的值对应则更改状态
            if (this._state == ACTION_STATE.WAIT_EVENT && this.curRouteInfo.event.v2 == data) {
                this._state = ACTION_STATE.WAIT_CHOOSE;
            }
        }

        /**执行当前Route节点事件 */
        private async handleEvent() {
            let info = this.curRouteInfo;
            let eventType = info.event.v1;
            let eventId = info.event.v2;
            switch (eventType) {
                case 1:
                    //配表动画,完了直接下一步
                    await this.playAnimate(eventId);
                    this._state = ACTION_STATE.WAIT_CHOOSE;
                    this.actionCurrRoute();
                    break;
                case 2:
                    //sk动画,完了直接下一步
                    await this.playSkAnimate(eventId);
                    this._state = ACTION_STATE.WAIT_CHOOSE;
                    this.actionCurrRoute();
                    break;
                //动画
                case 3:
                    //交互,需要等待交互完成
                    this.enterModule(eventId == 1 ? 'hitStar.HitStarGameModule' : 'conduit.ConduitGameModule');
                    this._state = ACTION_STATE.WAIT_EVENT;
                    break;
                case 4:
                    //战斗,需要等待战斗完成
                    this.enterFight(eventId);
                    this._state = ACTION_STATE.WAIT_EVENT;
                    break;
                case 5:
                    //花费代币重置
                    this.payToReset(info.id, eventId);
                    break;
                case 6:
                    //结局
                    this._state = ACTION_STATE.WAIT_CHOOSE;
                    this.actionCurrRoute();
                    break;
                default:
                    break;
            }
        }

        private playAnimate(aniId: number) {
            if (aniId == 0)
                return Promise.resolve();
            if (this.skipAni) {
                return new Promise((ok) => {
                    let str = `节点` + this._currRouteId + (this._state == ACTION_STATE.AFTER_CHOOSE ? '结束动画' : '开始动画')
                    alert.showSmall(str + ' id:' + aniId, { callBack: { caller: this, funArr: [ok] }, btnType: alert.Btn_Type.ONLY_SURE, needClose: false })
                })
            }
            return new Promise((ok) => {
                let canSkip = this.checkRouteJumped(this._currRouteId);
                AnimateMovieManager.setParam({ selectArr: [], forceSkipOpt: canSkip ? 1 : 2 ,bgAlpha: 1});
                AnimateMovieManager.showAnimateMovie(aniId, null, null);
                EventManager.once(globalEvent.ANIMATE_MOVIE_PLAY_OVER, this, ok);
            })
        }

        private playSkAnimate(aniId: number) {
            return new Promise((ok) => {
                alert.showSmall('动画' + aniId, { callBack: { caller: this, funArr: [ok] } })
            })
        }

        private enterModule(modStr: string) {
            if (this.skipGame) {
                alert.showSmall('交互', {
                    callBack: {
                        caller: this, funArr: [() => {
                            EventManager.event(globalEvent.MID_OPERA_EVENT_COMPLETE);
                            this.actionCurrRoute();
                        }]
                    }, btnType: alert.Btn_Type.ONLY_SURE, needClose: false
                })
                return;
            }
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open(modStr, null, { openWhenClose: 'operaSide.OperaMapModule' });
        }

        /**
         * 弹出选项面板 等待选择结果
         * @param info 
         */
        private async waitChoose() {
            //每次选择前 清空上次状态
            this._currChoose = 0;
            //选阵营节点特殊处理(因为选择阵营面板是全屏的，不能用await来包装，只能通过事件来回调完成选择)
            if (this._currRouteId == CHOOSE_ROUTE_ID) {
                //还没有选择,前往选择
                if (this._currChoose == 0) {
                    clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.ModuleManager.open('operaSide.OperaSideSelectModule');
                }
            }
            else {
                //有选项内容，弹出选项面板
                if (this.curRouteInfo.choose.length > 0) {
                    this.log('开始选择');
                    this._currChoose = await this.openSelectPanel(this._currRouteId);
                }
                //选择完成，改变state执行
                this._state = ACTION_STATE.AFTER_CHOOSE;
                this.actionCurrRoute();
            }
        }

        /**
         * 等待选择结果 
         * @return 从1开始
        */
        private async openSelectPanel(id: number): Promise<number> {
            let mod = await clientCore.ModuleManager.open('operaSelect.OperaSelectModule', id);
            return new Promise((ok) => {
                mod.once(Laya.Event.COMPLETE, this, (choose: number) => {
                    ok(choose)
                })
            })
        }

        /**
         * 等待选项后果动画
         * @param info 
         * @param choose 
         */
        private async waitChooseEffect() {
            let chooseEffect = this.curRouteInfo.choiceEffect[Math.max(0, this._currChoose - 1)];
            if (chooseEffect) {
                this.log('选项后果动画')
                await this.playAnimate(chooseEffect.v1);
            }
        }

        private async enterFight(stageId: number) {
            if (this.skipFight) {
                alert.showSmall('战斗' + stageId, {
                    callBack: {
                        caller: this, funArr: [() => {
                            EventManager.event(globalEvent.MID_OPERA_EVENT_COMPLETE);
                            this.actionCurrRoute();
                        }]
                    }, btnType: alert.Btn_Type.ONLY_SURE, needClose: false
                })
                return;
            }
            EventManager.event(globalEvent.MID_OPERA_ENTERFIGHT, stageId);
        }

        private async payToReset(routeId: number, needCoin: number) {
            this.alertPayOk(routeId, needCoin).then(() => {
                if (clientCore.ItemsInfo.getItemLackNum({ itemID: 9900071, itemNum: needCoin }) > 0) {
                    alert.showFWords('道具不足')
                }
                else {
                    this._state = ACTION_STATE.WAIT_CHOOSE;
                    this.actionCurrRoute();
                }
            }).catch(() => {
                this._state = ACTION_STATE.WAIT_EVENT;
            })
        }

        private alertPayOk(routeId: number, needCoin: number) {
            let itemName = clientCore.ItemsInfo.getItemName(9900071);
            return new Promise((ok, rej) => {
                alert.showSmall(`已死亡，是否花费${needCoin}${itemName}重置回到上一个选择分支点？`, { needClose: false, callBack: { caller: this, funArr: [ok, rej] } })
            })
        }

        log(str: string) {
            console.log(`OPERA route:${this._currRouteId} |` + str);
        }

        /**
         * 推进进度 -同步后台
         */
        private async syncWithServer() {
            //计算好感度 
            this._srvInfo.curFavorNum += (this.curRouteInfo.choiceEffect.length > 0 ? this.curRouteInfo.choiceEffect[Math.max(0, this._currChoose - 1)].v2 : 0);
            let nextId = this.getNextRouteId();
            await this.waitCacheReward();
            if (nextId == 1) {
                //当下一个节点是起始节点时，说明到达了结局，重置
                this.recordChoose();
                this._currRouteId = nextId;
                this._srvInfo.allJumpNodes.push(this._currRouteId);
                this._srvInfo.curFavorNum = 0;
                this._state = ACTION_STATE.BEFORE_EVENT;
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.ModuleManager.open('operaDrama.OperaDramaModule', true);
            }
            else {
                this.log('完成节点，同步后台 选项' + this._currChoose);
                return net.sendAndWait(new pb.cs_promote_mid_autumn_drama_step({ nextId: nextId, choose: this._currChoose })).then((data: pb.sc_promote_mid_autumn_drama_step) => {
                    this._srvInfo.allJumpNodes.push(this._currRouteId);
                    this.recordChoose();
                    this._cacheReward = data.itmsFinish;
                    this._currRouteId = nextId;
                    //这里之所以弹奖励要用await，主要是处理前往死亡节点问题
                    this.waitReward(data.itms).then(() => {
                        this.handleAfterSync();
                    })
                    EventManager.event(globalEvent.MID_OPERA_PROGRESS_UPDATE);
                }).catch(() => {
                    //如果有问题，重置到初始状态
                    this._state = ACTION_STATE.BEFORE_EVENT;
                })
            }
        }

        private waitReward(rwd: pb.IItem[]) {
            if (rwd?.length) {
                return new Promise((ok) => {
                    alert.showReward(rwd, '', { callBack: { caller: this, funArr: [ok] } });
                })
            }
            else {
                return Promise.resolve();
            }
        }

        private waitCacheReward() {
            if (this._cacheReward?.length) {
                return new Promise((ok) => {
                    alert.showReward(this._cacheReward, '', { callBack: { caller: this, funArr: [ok] } });
                    this._cacheReward = null;
                })
            }
            else {
                return Promise.resolve();
            }
        }

        /**
         * 记录选择过的选项
         */
        private recordChoose() {
            this._srvInfo.chooseNodes.push(this._currRouteId + '_' + this._currChoose);
        }

        /**
         * 有一些节点需要立即执行下一个，
         * 结局：结局完成需要直接重置到初始节点
         * 死亡节点：立即弹出重置面板 
         */
        private handleAfterSync() {
            this._state = ACTION_STATE.BEFORE_EVENT;
            /**如果是结局或者死亡节点，还有分之前节点 需要立即执行下一个节点 */
            if (this._currRouteId > 300 || this._currRouteId <= CHOOSE_ROUTE_ID) {
                this.actionCurrRoute();
                return;
            }
        }

        /**
         * 获取下一个节点ID
         */
        private getNextRouteId() {
            if (this.checkHaveAllBranchEnding() && !this.chechHaveTrueEnding()) {
                //如果两个主角结局都通关了，进行真结局
                return TRUE_ENDING_ID;
            }
            //当前是结局节点 直接回到初始
            if (this.nowEndRoute()) {
                return 1;
            }
            //下一步就是结局了
            else if (_.findIndex(this.curRouteInfo.nextId, nextId => nextId > 400) > -1) {
                //根据当前好感度找结局
                let endArr = _.filter(xls.get(xls.dramaRoute).getValues(), info => this.curRouteInfo.nextId.indexOf(info.id) > -1);
                endArr = _.sortBy(endArr, o => o.event.v2).reverse();
                for (const o of endArr) {
                    if (this.faovr >= o.event.v2) {
                        return o.id;
                    }
                }
            }
            else {
                //其他节点 就按选择找
                if (this.curRouteInfo.nextId[this._currChoose - 1]) {
                    return this.curRouteInfo.nextId[this._currChoose - 1];
                }
                else {
                    return this.curRouteInfo.nextId[0]
                }
            }
        }

        /**如果是结局或者死亡节点 需要立即执行下一个节点 */
        nowImmediateRoute() {
            return this._currRouteId > 300;
        }

        /**当前是否为结局节点 */
        nowEndRoute() {
            return this._currRouteId > 400;
        }

        /**
         * 测试用直接跳节点
         * @param id 
         * @param favor 好感度
         */
        jumpTo(id: number, favor: number) {
            this._currRouteId = id;
            this._srvInfo.curFavorNum = favor;
            this._state = ACTION_STATE.BEFORE_EVENT;
            net.send(new pb.cs_quick_mid_drama_jump({ favorNum: favor, nodeId: id }));
        }

        /**
         * 判断某个角色是否已打出任意结局
         * @param roleId 1左 2右 3真结局
         */
        checkHaveEndByRoleId(roleId: number) {
            if (roleId == 3) {
                return this.checkRouteJumped(TRUE_ENDING_ID);
            }
            else {
                return _.findIndex(this.getEndingIdByRoleId(roleId), id => this.checkRouteJumped(id)) > -1;
            }
        }

        /**两个主角的结局是否都打完了 */
        checkHaveAllBranchEnding() {
            let role1 = _.filter(this.getEndingIdByRoleId(1), id => this.checkRouteJumped(id)).length == 3;
            let role2 = _.filter(this.getEndingIdByRoleId(2), id => this.checkRouteJumped(id)).length == 3;
            return role1 && role2;
        }

        /**判断是否打过真结局 */
        chechHaveTrueEnding() {
            return this.checkRouteJumped(TRUE_ENDING_ID);
        }

        /**根据角色id返回对应的结局ID
         * @param roleId 1左 2右 3真结局
         */
        getEndingIdByRoleId(roleId: number) {
            if (roleId == 3) {
                return [TRUE_ENDING_ID];
            }
            else if (roleId == 1) {
                return [401, 402, 403];
            }
            else {
                return [404, 405, 406]
            }
        }

        /**是否需要看入场动画 */
        get needPlayStartAni() {
            //从来没玩过没玩过，根据标记判断(有可能本次游戏看过动画了)
            if (this._currRouteId == 1 && this._srvInfo.allJumpNodes.length == 0) {
                return !this.startAniFlg;
            }
            else {
                return false;
            }
        }

        /**
         * 判断结局奖励是否已领取
         * @param idx 奖励领取标记  1-3热度奖励 4-9结局奖励 10真相结局奖励 11全通结局奖励  12抽奖集齐后领取奖励
         */
        hasRewardCliamed(idx: number) {
            // 1-7结局奖励 8全通结局奖励  9-11热度奖励 
            return util.getBit(this._srvInfo.rewardFlag, idx) == 1;
        }

        /**
         * 领取奖励
         * @param idx 奖励领取标记  1-3热度奖励 4-9结局奖励 10真相结局奖励 11全通结局奖励 12抽奖集齐后领取奖励
         */
        getRewardByIdx(idx: number) {
            return net.sendAndWait(new pb.cs_get_mid_autumn_drama_award({ index: idx })).then((data: pb.sc_get_mid_autumn_drama_award) => {
                alert.showReward(data.itms);
                this._srvInfo.rewardFlag = util.setBit(this._srvInfo.rewardFlag, idx, 1);
            })
        }

        /**距离中秋话剧上映还有多久 */
        static timeToOperaStart() {
            let now = clientCore.ServerManager.curServerTime;
            let target = util.TimeUtil.formatTimeStrToSec(OPEN_TIME);
            return Math.max(target - now, 0);
        }

        /**距离最后之战开启还有多久 */
        static get timeToFinalFight() {
            let now = clientCore.ServerManager.curServerTime;
            let target = util.TimeUtil.formatTimeStrToSec(FINAL_FIGHT_TIME);
            return Math.max(target - now, 0);
        }

        /**最后之战是否结束（排行榜截止） */
        static get isFinalFightEnd() {
            let rankInfo = xls.get(xls.rankInfo).get(11);
            let now = clientCore.ServerManager.curServerTime;
            let target = util.TimeUtil.formatTimeStrToSec(rankInfo.closeTime);
            return now >= target;
        }
    }
}