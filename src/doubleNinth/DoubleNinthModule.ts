namespace doubleNinth {
    /**
     * 重阳节茱萸小店
     * doubleNinth.DoubleNinthModule
     * 2021.10.15
     */
    export class DoubleNinthModule extends ui.doubleNinth.DoubleNinthModuleUI {
        private ruleId: number = 1215;//规则
        /**头环状态 */
        private storeInfo: number;
        /**当前要制作的头环 */
        private storeNum: number;
        private moneyId: number = 9900253;//代币id
        private skeleton: clientCore.Bone;

        init() {
            this.addPreLoad(xls.load(xls.activityshop));
            this.addPreLoad(xls.load(xls.dialog));
            this.addPreLoad(this.getStoreInfo());
        }

        onPreloadOver() {
            this.ruleId = clientCore.LocalInfo.age >= 18 ? 1215 : 1216;
            clientCore.UIManager.setMoneyIds([this.moneyId]);
            clientCore.UIManager.showCoinBox();
            this.upDataStore();
            clientCore.Logger.sendLog('2021年10月15日活动', '【主活动】重阳节茱萸小店', '打开主活动面板');
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnGoHome, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGift, Laya.Event.CLICK, this, this.goGift);
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.onMake);
            for (let i = 0; i < 8; i++) {
                if (i < 3) BC.addEvent(this, this["imgStuff" + i], Laya.Event.CLICK, this, this.showTips, [i]);
                BC.addEvent(this, this['imgstore' + i], Laya.Event.CLICK, this, this.onStore, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.skeleton?.dispose();
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
        }

        private getStoreInfo() {
            return net.sendAndWait(new pb.cs_chongyang_zhuyu_store_info()).then((data: pb.sc_chongyang_zhuyu_store_info) => {
                this.storeInfo = data.flag;
            });
        }

        /**更新货柜 */
        private upDataStore() {
            if (!this.checkAllFinish()) {
                for (let i = 1; i <= 8; i++) {
                    let state = 0;
                    if (util.getBit(this.storeInfo, i) == 0) {
                        if (i > 1 && util.getBit(this.storeInfo, i - 1) == 0) {
                            state = 2;
                        }
                    }
                    else {
                        state = 1;
                    }
                    this.setStoreInfo(i - 1, state);
                }
            }
        }

        //检查是否全部完成
        private checkAllFinish(): boolean {
            if (util.get1num(this.storeInfo) == 8) {//全部完成，明天再来
                this.needStuff.visible = false;
                this.imgmr.visible = true;
                for (let i = 0; i < 8; i++) {
                    this.setStoreInfo(i, 3);
                }
                return true;
            }
            return false;
        }

        private setStoreInfo(idx: number, state: number) {
            this['imgstore' + idx].skin = `doubleNinth/state${state}.png`;
            this['imgstore' + idx].mouseEnabled = state == 0;
        }

        /**规则说明 */
        private onRule(): void {
            alert.showRuleByID(this.ruleId);
        }

        /**跳转到礼盒 */
        private goGift(): void {
            this.destroy();
            clientCore.ModuleManager.open('doubleNinth.SartShopModule');
        }

        /**点击货柜按钮 */
        private onStore(idx: number) {
            this.storeNum = idx;
            let cfg = xls.get(xls.activityshop).get(idx + 1);
            this.needStuff.visible = true;
            let canMake = true;
            for (let i = 0; i < 3; i++) {
                this['imgStuff' + i].visible = this['labStuff' + i].visible = this['diStuff' + i].visible = i < cfg.meterial.length;
                if (i < cfg.meterial.length) {
                    let has = clientCore.ItemsInfo.getItemNum(cfg.meterial[i].v1);
                    let need = cfg.meterial[i].v2;
                    canMake = canMake && has >= need;
                    this['labStuff' + i].text = `${has}/${need}`;
                    this['imgStuff' + i].skin = `${clientCore.ItemsInfo.getItemIconUrl(cfg.meterial[i].v1)}`;
                    this['labStuff' + i].color = has >= need ? "#0ef404" : "#f3152f";
                }
            }
            this.btnMake.disabled = !canMake;
        }

        /**制作 */
        private onMake(): void {
            this.btnMake.disabled = true;
            this.mouseEnabled = false;
            this.needStuff.visible = false;
            net.sendAndWait(new pb.cs_chongyang_zhuyu_store_task({ index: this.storeNum })).then((Item: pb.sc_chongyang_zhuyu_store_task) => {
                this.storeInfo = util.setBit(this.storeInfo, this.storeNum + 1, 1);
                this.setStoreInfo(this.storeNum, 1);
                var talk = Math.ceil((this.storeNum + 1) / 2);
                this.checkAllFinish();
                let npc = Math.floor(Math.random() * 8);
                this.skeleton?.dispose();
                this.labNPC.text = xls.get(xls.dialog).get(npc + 1)["dial_" + talk];
                this.skeleton = clientCore.BoneMgr.ins.play(`res/animate/doubleNinth/NPC${npc + 1}.sk`, 0, false, this.imgNPC);
                this.skeleton.once(Laya.Event.COMPLETE, this, () => {
                    this.npcBox.visible = false;
                    alert.showReward(Item.item);
                    this.skeleton?.dispose();
                    this.skeleton = null;
                    if (this.storeNum < 7) {
                        this.storeNum++;
                        this.setStoreInfo(this.storeNum, 0);
                        this.onStore(this.storeNum);
                    }
                    this.mouseEnabled = true;
                });
                this.npcBox.visible = true;
            });
        }

        /**展示道具tips */
        private showTips(idx: number) {
            let mtr = xls.get(xls.activityshop).get(this.storeNum + 1).meterial[idx].v1;
            clientCore.ToolTip.showTips(this["imgStuff" + idx], { id: mtr });
            if (idx == 0) clientCore.Logger.sendLog('2021年10月15日活动', '【主活动】重阳节茱萸小店', '点击前往茱萸叶的获得途径');
            if (idx == 1) clientCore.Logger.sendLog('2021年10月15日活动', '【主活动】重阳节茱萸小店', '点击前往茱萸果的获得途径');
        }
    }
}