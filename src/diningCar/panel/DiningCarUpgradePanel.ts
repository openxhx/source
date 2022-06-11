namespace diningCar {
    export class DiningCarUpgradePanel extends ui.diningCar.panel.DiningCarUpgradeUI {
        private curPage: number;
        /**收益类 */
        private type1: xls.diningCarUpgrade[];
        /**效率类 */
        private type2: xls.diningCarUpgrade[];
        /**当前等级信息 */
        private curLevel: number[];

        private waitMsg: boolean;
        constructor(levelInfo: number[]) {
            super();
            this.sideClose = true;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.type1 = _.filter(xls.get(xls.diningCarUpgrade).getValues(), (o) => { return o.type == 1 });
            this.type2 = _.filter(xls.get(xls.diningCarUpgrade).getValues(), (o) => { return o.type == 2 });
            this.curLevel = levelInfo;
            this.setPage(1);
        }

        public show() {
            clientCore.Logger.sendLog('2021年1月22日活动', '【主活动】花仙餐车', '打开餐车升级弹窗');
            this.list.refresh();
            clientCore.DialogMgr.ins.open(this);
        }

        private listRender(item: ui.diningCar.render.DiningCarUpItemUI) {
            let config: xls.diningCarUpgrade = item.dataSource;
            item.labDes.text = config.description;
            let index = 0;
            if (config.type == 1) {
                index = this.type1.indexOf(config);
            } else {
                index = this.type2.indexOf(config) + this.type1.length;
            }
            let level = this.curLevel[index];
            let carConfig = xls.get(xls.diningCar).get(1);
            let machineConfig = xls.get(xls.diningCarMachine);
            switch (config.parameter[0].v1) {
                case 1://顾客等待时间增加
                    item.labCur.text = `当前等候时间：单品${carConfig.customerWaitTime1 + level * config.parameter[0].v3}秒/套餐${carConfig.customerWaitTime2 + level * config.parameter[0].v3}秒`;
                    break;
                case 2://小费增加
                    item.labCur.text = `当前小费：${level * config.parameter[0].v3}`;
                    break;
                case 3://经营消耗减少
                    item.labCur.text = `当前消耗：${carConfig.costPower - level * config.parameter[0].v3}体力`;
                    break;
                case 4://免费体力提高
                    item.labCur.text = `当前额度：${carConfig.freePower + level * config.parameter[0].v3}体力`;
                    break;
                case 5://顾客最大人数
                    item.labCur.text = `当前上限：${carConfig.customerLimit + level * config.parameter[0].v3}人`;
                    break;
                case 6://增加机器个数
                    item.labCur.text = `当前个数：${machineConfig.get(config.parameter[0].v2).facilityNum + level * config.parameter[0].v3}个`;
                    break;
                case 7://每批制作个数增加
                    let des7 = "当前制作个数：";
                    for (let i = 0; i < 1; i++) {
                        let maching = machineConfig.get(config.parameter[i].v2);
                        des7 += (maching.num + level * config.parameter[i].v3) + "个;"
                    }
                    item.labCur.text = des7;
                    break;
                case 8://每批制作时间减少
                    let des8 = "当前制作时间：";
                    for (let i = 0; i < 1; i++) {
                        let maching = machineConfig.get(config.parameter[i].v2);
                        des8 += (maching.time - level * config.parameter[i].v3) + "秒;"
                    }
                    item.labCur.text = des8;
                    break;
            }
            item.img_di.skin = level == config.levelLimit ? "unpack/diningCar/di_zhizhang.png" : "unpack/diningCar/di_zhizhang1.png";
            item.boxUp.visible = level < config.levelLimit;
            item.labMax.visible = !item.boxUp.visible;
            if (level < config.levelLimit) {
                item.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(config.upgradeCost[level].v1);
                item.labCost.text = "" + config.upgradeCost[level].v2;
                BC.addEvent(this, item.btnUpgrade, Laya.Event.CLICK, this, this.upgrade, [config.id, config.upgradeCost[level].v2]);
            }
        }

        private setPage(page: number) {
            if (this.curPage == page) return;
            this.curPage = page;
            this.list.array = this["type" + this.curPage];
            this.list.spaceY = this["type" + this.curPage].length;
            this.list.startIndex = 0;
            this.list.scrollBar.value = 0;
            this.di_tag1.skin = this.curPage == 1 ? "diningCar/clip_l_w_1.png" : "diningCar/clip_l_w_2.png";
            this.di_tag2.skin = this.curPage == 2 ? "diningCar/clip_l_w_1.png" : "diningCar/clip_l_w_2.png";
            this.name_shouyi.y = this.curPage == 1 ? 22 : 36;
            this.name_xiaolv.y = this.curPage == 2 ? 22 : 36;
        }

        private upgrade(id: number, cost: number) {
            if (cost > clientCore.ItemsInfo.getItemNum(9900126)) {
                alert.showFWords("代币数量不足");
                return;
            }
            if (this.waitMsg) return;
            this.waitMsg = true;
            net.sendAndWait(new pb.cs_breakfast_car_upgrade({ id: id })).then((msg: pb.sc_breakfast_car_upgrade) => {
                alert.showFWords("升级成功");
                let index = _.findIndex(xls.get(xls.diningCarUpgrade).getValues(), (o) => { return o.id == id });
                this.curLevel[index] = msg.level;
                this.list.refresh();
                EventManager.event("DINING_CAT_UPGRADE", [id, msg.level]);
                this.waitMsg = false;
            }).catch(() => {
                this.waitMsg = false;
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.di_tag1, Laya.Event.CLICK, this, this.setPage, [1]);
            BC.addEvent(this, this.di_tag2, Laya.Event.CLICK, this, this.setPage, [2]);
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}