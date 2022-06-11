namespace diningCar {
    /**
     * 花仙早餐车
     * diningCar.DiningCarModule
     * 2021.1.22
     */

    export class DiningCarModule extends ui.diningCar.DiningCarModuleUI {
        /**活动id */
        private readonly eventId = 113;
        /**总营业额id */
        private readonly totalId = 9900127;
        /**体力id */
        private readonly tiliId = 9900125;
        /**当前营业额 */
        private readonly curId = 9900126;
        /**面板信息 */
        private curInfo: pb.sc_get_flower_fairy_breakfast_car_info;
        /**阶段奖励信息 */
        private stageReward: xls.commonAward[];
        /**等待服务器返回，防止连点 */
        private waitMsg: boolean;

        /**兑换体力面板 */
        private exchangePanel: DiningCarExPanel;
        /**阶段总览 */
        private stagesPanel: DiningCarStagePanel;
        /**属性升级面板 */
        private upgradePanel: DiningCarUpgradePanel;
        /**特殊商店面板 */
        private shopPanel: DiningCarShopPanel;
        /**经营接待顾客相关参数 */
        private custom: { maxCnt: number, waitTime: number[], time: number, customerCd: number };
        /**经营机器数据 */
        private machines: MachineInfo[];
        /**经营消耗 */
        private curCost: number;
        init(d: any) {
            super.init(d);
            this.addPreLoad(xls.load(xls.diningCar));
            this.addPreLoad(xls.load(xls.diningCarMachine));
            this.addPreLoad(xls.load(xls.diningCarMaterials));
            this.addPreLoad(xls.load(xls.diningCarTask));
            this.addPreLoad(xls.load(xls.diningCarUpgrade));
            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(net.sendAndWait(new pb.cs_get_flower_fairy_breakfast_car_info()).then((data: pb.sc_get_flower_fairy_breakfast_car_info) => {
                this.curInfo = data;
            }));
            clientCore.UIManager.setMoneyIds([this.tiliId, this.curId, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.rewardRender);
            this.list.selectHandler = new Laya.Handler(this, this.rewardSelect);
        }

        onPreloadOver() {
            this.ani1.play(0, true);
            this.stageReward = _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == this.eventId });
            this.initView();
            this.updataStageInfo();
            this.creatSellInfo();
            clientCore.Logger.sendLog('2021年1月22日活动', '【主活动】花仙餐车', '打开活动面板');
        }

        private initView() {
            this.boxFree.visible = this.curInfo.dHealth == 0;
            this.btnMore.visible = this.curInfo.dHealth == 1;
            this.labScore.text = "" + clientCore.ItemsInfo.getItemNum(this.totalId);
        }

        /**阶段信息奖励 */
        private updataStageInfo() {
            let info;
            if (this.curInfo.stage == 0) {
                info = this.stageReward[this.curInfo.stage];
            } else {
                info = xls.get(xls.commonAward).get(this.curInfo.stage + 1)
            }
            if (!info) {
                info = this.stageReward[this.stageReward.length - 1];
                this.labGot.visible = true;
                this.btnGet.visible = false;
            } else {
                this.labGot.visible = false;
                this.btnGet.visible = true;
                this.btnGet.disabled = clientCore.ItemsInfo.getItemNum(this.totalId) < info.num.v2;
            }
            let reward = clientCore.LocalInfo.sex == 1 ? info.femaleAward : info.maleAward;
            this.list.array = reward;
            this.list.spaceX = reward.length;
            this.labTarget.text = "" + info.num.v2;
        }

        private rewardSelect(index: number) {
            if (index < 0) return;
            let reward: xls.pair = this.list.array[index];
            if (reward) {
                clientCore.ToolTip.showTips(this.list.cells[index], { id: reward.v1 });
            }
            this.list.selectedIndex = -1;
        }

        private rewardRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: false });
        }

        /**查看排行榜 */
        private onRank() {
            // clientCore.Logger.sendLog('2020年12月18日活动', '【付费】卷角之梦', '点击排行榜按钮');
            clientCore.ModuleManager.open('diningCar.DiningCarRankModule');
        }

        /**领取奖励
         * @param type 1店主体力 2阶段奖励
         */
        private getRewad(type: number) {
            if (this.waitMsg) return;
            this.waitMsg = true;
            net.sendAndWait(new pb.cs_get_breakfast_car_reward({ type: type })).then((data: pb.sc_get_breakfast_car_reward) => {
                alert.showReward(data.items);
                if (type == 2) {
                    this.curInfo.stage = data.stage;
                    this.updataStageInfo();
                    util.RedPoint.reqRedPointRefresh(22701);
                } else {
                    this.curInfo.dHealth = 1;
                    this.initView();
                    util.RedPoint.reqRedPointRefresh(22702);
                }
                // util.RedPoint.reqRedPointRefresh(21402);
                this.waitMsg = false;
            }).catch(() => {
                this.waitMsg = false;
            })
        }

        /**材料兑换兑换 */
        private openExchange() {
            if (!this.exchangePanel) this.exchangePanel = new DiningCarExPanel();
            this.exchangePanel.show();
        }

        /**特殊商店 */
        private openShop() {
            if (!this.shopPanel) this.shopPanel = new DiningCarShopPanel(this.curInfo.buyItems);
            this.shopPanel.show();
        }

        /**升级属性 */
        private openUpgrade() {
            if (!this.upgradePanel) this.upgradePanel = new DiningCarUpgradePanel(this.curInfo.allLevel);
            this.upgradePanel.show();
        }

        /**开始营业 */
        private startSell() {
            if (clientCore.ItemsInfo.getItemNum(this.tiliId) < this.curCost) {
                alert.showFWords("体力不足！");
                return;
            }
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open('diningCarSell.DiningCarSellModule', { custom: this.custom, machines: this.machines });
        }

        /**帮助说明 */
        private onRule() {
            clientCore.Logger.sendLog('2021年1月22日活动', '【主活动】花仙餐车', '打开规则说明');
            alert.showRuleByID(1124);
        }

        /**查看所有阶段信息 */
        private openDetail() {
            if (!this.stagesPanel) this.stagesPanel = new DiningCarStagePanel(this.stageReward);
            this.stagesPanel.show(this.curInfo.stage);
        }

        /**餐车属性升级 */
        private onUpgrade(id: number, level: number) {
            let carConfig = xls.get(xls.diningCar).get(1);
            let config = xls.get(xls.diningCarUpgrade).get(id);
            let index = _.findIndex(xls.get(xls.diningCarUpgrade).getValues(), (o) => { return o.id == id });
            this.curInfo.allLevel[index] = level;
            if (config.parameter[0].v1 == 5) {//顾客最大人数
                this.custom.maxCnt = carConfig.customerLimit + level * config.parameter[0].v3;
            } else if (config.parameter[0].v1 == 1) {//顾客等待时间
                this.custom.waitTime = [carConfig.customerWaitTime1 + level * config.parameter[0].v3, carConfig.customerWaitTime2 + level * config.parameter[0].v3];
            } else if (config.parameter[0].v1 == 6) {//机器数量
                for (let i = 0; i < config.parameter.length; i++) {
                    this.machines[config.parameter[i].v2 - 1].cnt = xls.get(xls.diningCarMachine).get(config.parameter[i].v2).facilityNum + level * config.parameter[i].v3;
                }
            } else if (config.parameter[0].v1 == 7) {//制作数量
                for (let i = 0; i < config.parameter.length; i++) {
                    this.machines[config.parameter[i].v2 - 1].makeCnt = xls.get(xls.diningCarMachine).get(config.parameter[i].v2).num + level * config.parameter[i].v3;
                    this.machines[config.parameter[i].v2 - 1].curCnt = this.machines[config.parameter[i].v2 - 1].makeCnt;
                }
            } else if (config.parameter[0].v1 == 8) {//制作时间
                for (let i = 0; i < config.parameter.length; i++) {
                    this.machines[config.parameter[i].v2 - 1].makeTime = xls.get(xls.diningCarMachine).get(config.parameter[i].v2).time - level * config.parameter[i].v3;
                }
            } else if (config.parameter[0].v1 == 3) {//体力消耗
                this.curCost = carConfig.costPower - level * config.parameter[0].v3;
                this.labCost.text = "x" + this.curCost;
            }
        }

        /**生成经营相关属性 */
        private creatSellInfo() {
            let carConfig = xls.get(xls.diningCar).get(1);
            let machineConfig = xls.get(xls.diningCarMachine).getValues();
            //顾客最大人数 升级任务类型5
            let index = _.findIndex(xls.get(xls.diningCarUpgrade).getValues(), (o) => { return o.parameter[0].v1 == 5 });
            let config = xls.get(xls.diningCarUpgrade).getValues()[index];
            let level = this.curInfo.allLevel[index];
            let maxCustomer = carConfig.customerLimit + level * config.parameter[0].v3;
            //顾客等待时间 升级任务类型1
            index = _.findIndex(xls.get(xls.diningCarUpgrade).getValues(), (o) => { return o.parameter[0].v1 == 1 });
            config = xls.get(xls.diningCarUpgrade).getValues()[index];
            level = this.curInfo.allLevel[index];
            let waitTime = [carConfig.customerWaitTime1 + level * config.parameter[0].v3, carConfig.customerWaitTime2 + level * config.parameter[0].v3];
            //每次经营的时间
            let time = carConfig.roundTimeLimit;
            //顾客之间的cd
            let cd = carConfig.appearInterval;
            //经营信息
            this.custom = { maxCnt: maxCustomer, waitTime: waitTime, time: time, customerCd: cd };
            //经营消耗 升级任务类型3
            index = _.findIndex(xls.get(xls.diningCarUpgrade).getValues(), (o) => { return o.parameter[0].v1 == 3 });
            config = xls.get(xls.diningCarUpgrade).getValues()[index];
            level = this.curInfo.allLevel[index];
            this.curCost = carConfig.costPower - level * config.parameter[0].v3;
            this.labCost.text = "x" + this.curCost;
            //机器信息
            this.machines = [];
            for (let i: number = 0; i < machineConfig.length; i++) {
                let info = new MachineInfo();
                let config = machineConfig[i];
                info.id = config.id;
                info.in_out = config.produce;
                info.cnt = config.facilityNum;
                info.makeTime = config.time;
                info.makeCnt = config.num;
                if (info.id == 7) {//搅拌机数量和时间可升级 升级任务id201，206
                    let idx = _.findIndex(xls.get(xls.diningCarUpgrade).getValues(), (o) => { return o.id == 201 });
                    let con = xls.get(xls.diningCarUpgrade).getValues()[idx];
                    level = this.curInfo.allLevel[idx];
                    info.cnt += level * con.parameter[0].v3;
                    idx = _.findIndex(xls.get(xls.diningCarUpgrade).getValues(), (o) => { return o.id == 206 });
                    con = xls.get(xls.diningCarUpgrade).getValues()[idx];
                    level = this.curInfo.allLevel[idx];
                    info.makeTime -= level * con.parameter[0].v3;
                } else if (info.id == 11 || info.id == 12 || info.id == 13) {//面包、甜甜圈、蛋糕 制作数量和时间可升级 升级任务id202，204
                    let idx = _.findIndex(xls.get(xls.diningCarUpgrade).getValues(), (o) => { return o.id == 202 });
                    let con = xls.get(xls.diningCarUpgrade).getValues()[idx];
                    level = this.curInfo.allLevel[idx];
                    info.makeCnt += level * con.parameter[info.id - 11].v3;
                    idx = _.findIndex(xls.get(xls.diningCarUpgrade).getValues(), (o) => { return o.id == 204 });
                    con = xls.get(xls.diningCarUpgrade).getValues()[idx];
                    level = this.curInfo.allLevel[idx];
                    info.makeTime -= level * con.parameter[info.id - 11].v3;
                } else if (info.id == 3 || info.id == 4 || info.id == 5 || info.id == 6) {//草莓、鸡蛋、生菜 制作数量和时间可升级 升级任务id203，205
                    let idx = _.findIndex(xls.get(xls.diningCarUpgrade).getValues(), (o) => { return o.id == 203 });
                    let con = xls.get(xls.diningCarUpgrade).getValues()[idx];
                    level = this.curInfo.allLevel[idx];
                    info.makeCnt += level * con.parameter[info.id - 3].v3;
                    idx = _.findIndex(xls.get(xls.diningCarUpgrade).getValues(), (o) => { return o.id == 205 });
                    con = xls.get(xls.diningCarUpgrade).getValues()[idx];
                    level = this.curInfo.allLevel[idx];
                    info.makeTime -= level * con.parameter[info.id - 3].v3;
                }
                info.curCnt = config.default == 1 ? info.makeCnt : 0;
                this.machines.push(info);
            }
        }

        private openHelp() {
            clientCore.Logger.sendLog('2021年1月22日活动', '【主活动】花仙餐车', '打开玩法说明');
            clientCore.ModuleManager.open("diningCarRule.DiningCarRuleModule", 0);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnMore, Laya.Event.CLICK, this, this.openExchange);
            BC.addEvent(this, this.boxFree, Laya.Event.CLICK, this, this.getRewad, [1]);
            BC.addEvent(this, this.btnRank, Laya.Event.CLICK, this, this.onRank);
            BC.addEvent(this, this.btnShop, Laya.Event.CLICK, this, this.openShop);
            BC.addEvent(this, this.btnUpgrade, Laya.Event.CLICK, this, this.openUpgrade);
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.startSell);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getRewad, [2]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.openDetail);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.openHelp);
            EventManager.on("DINING_CAT_UPGRADE", this, this.onUpgrade);
            EventManager.on("DINING_CAR_SELL_START", this, this.startSell);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("DINING_CAT_UPGRADE", this, this.onUpgrade);
            EventManager.off("DINING_CAR_SELL_START", this, this.startSell);
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
    class MachineInfo {
        /**机器id */
        id: number;
        /**机器数量 */
        cnt: number;
        /**输入产出 */
        in_out: xls.pair[];
        /**制作时间 */
        makeTime: number;
        /**制作数量 */
        makeCnt: number;
        /**当前持有的产物数量 */
        curCnt: number;
    }
}