namespace restaurant {
    export class RestaurantDetailPanel extends ui.restaurant.panel.RestaurantDetailPanelUI {
        private _model: RestaurantModel;
        private xlsData: util.HashMap<xls.diningLevelUp>;
        private xlsSkin: util.HashMap<xls.diningDecoration>
        private selectSkin: number;
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as RestaurantModel;
            this.listCost.renderHandler = new Laya.Handler(this, this.costRender);
            this.listCost.mouseHandler = new Laya.Handler(this, this.costClick);
            this.listReward.renderHandler = new Laya.Handler(this, this.rewardRender);
            this.skinList.hScrollBarSkin = "";
            this.skinList.renderHandler = new Laya.Handler(this, this.skinRender);
            this.skinList.mouseHandler = new Laya.Handler(this, this.skinSelect);
            this.sideClose = true;
            this.txtCreat.style.font = '汉仪中圆简';
            this.txtCreat.style.fontSize = 24;
            this.txtCreat.style.color = "#805329";
            this.txtPoints.style.font = '汉仪中圆简';
            this.txtPoints.style.fontSize = 24;
            this.txtPoints.style.color = "#805329";
            this.txtMake.style.font = '汉仪中圆简';
            this.txtMake.style.fontSize = 24;
            this.txtMake.style.color = "#805329";
        }

        show() {
            clientCore.UIManager.setMoneyIds([9900066, clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.xlsData = xls.get(xls.diningLevelUp);
            this.xlsSkin = xls.get(xls.diningDecoration);
            this.selectSkin = this._model.curSkin;
            this.setLevelInfo();
            this.setSkinInfo();
            this.showTabView(1);
            clientCore.DialogMgr.ins.open(this);
        }

        private showTabView(idx: number) {
            if (idx == 1 && this.boxLvlup.visible) {
                this.boxSkin.visible = false;
                return;
            }
            if (idx == 2 && this.boxSkin.visible) {
                this.boxLvlup.visible = false;
                return;
            }
            if (idx == 1) {
                this.bgType1.skin = "restaurant/xing_zhuang_2.png";
                this.imgType1.skin = "restaurant/type_lvlup_1.png";
                this.bgType2.skin = "restaurant/xing_zhuang_1.png";
                this.imgType2.skin = "restaurant/type_skin_2.png";
                this.boxLvlup.visible = true;
                this.boxSkin.visible = false;
            } else if (idx == 2) {
                this.bgType1.skin = "restaurant/xing_zhuang_1.png";
                this.imgType1.skin = "restaurant/type_lvlup_2.png";
                this.bgType2.skin = "restaurant/xing_zhuang_2.png";
                this.imgType2.skin = "restaurant/type_skin_1.png";
                this.boxLvlup.visible = false;
                this.boxSkin.visible = true;
            }
        }
        /**等级信息UI */
        private setLevelInfo() {
            let cur = this.xlsData.get(this._model.curLevel);
            if (this.xlsData.has(cur.level + 1)) {
                let next = this.xlsData.get(cur.level + 1);
                this.txtLevel.text = "" + cur.level;
                if (this._model.curPoint < cur.upgradIntegral) {
                    this.txtPoints.innerHTML = "<font color='#dc143c'>" + this._model.curPoint + "</font>/" + cur.upgradIntegral;
                } else {
                    this.txtPoints.innerHTML = this._model.curPoint + "/" + cur.upgradIntegral;
                }
                if (this._model.curCreatNum < cur.upgradMenu) {
                    this.txtCreat.innerHTML = "<font color='#dc143c'>" + this._model.curCreatNum + "</font>/" + cur.upgradMenu;
                } else {
                    this.txtCreat.innerHTML = this._model.curCreatNum + "/" + cur.upgradMenu;
                }
                if (this._model.curMakeNum < cur.upgradDishes) {
                    this.txtMake.innerHTML = "<font color='#dc143c'>" + this._model.curMakeNum + "</font>/" + cur.upgradDishes;
                } else {
                    this.txtMake.innerHTML = this._model.curMakeNum + "/" + cur.upgradDishes;
                }
                this.listCost.repeatX = cur.upgradCost.length;
                this.listCost.array = cur.upgradCost;
                let reward = [];
                for (let i: number = 0; i < cur.upgradAaward.length; i++) {
                    reward.push(cur.upgradAaward[i].v1);
                }
                if (next.stockpot > cur.stockpot) reward.push(2);
                if (next.exhibition > cur.exhibition) reward.push(3);
                if (next.seat > cur.seat) reward.push(4);
                if (next.cloth > cur.cloth) reward.push(5);
                this.listReward.repeatX = reward.length;
                this.listReward.array = reward;
            } else {
                this.txtLevel.text = "" + cur.level;
                this.txtPoints.innerHTML = "已满级";
                this.txtCreat.innerHTML = "" + this._model.curCreatNum;
                this.txtMake.innerHTML = "" + this._model.curMakeNum;
                this.listCost.array = [];
                this.listReward.array = [];
            }
            this.btnLvlup.disabled = !this._model.checkCanLevelUp();
            this.btnLvlup.onRedChange(!this.btnLvlup.disabled);
        }

        /**皮肤信息UI */
        private setSkinInfo() {
            if (!this.skinList.dataSource) {
                let arr = this.xlsSkin.getValues();
                let a = new xls.diningDecoration();
                a.id = 0;
                arr.push(a);
                this.skinList.array = arr;
            } else {
                this.skinList.refresh();
            }
        }

        private costRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: true });
            // let have = clientCore.ItemsInfo.getItemNum(reward.v1);
            // item.num.value = this.getNumToAbc(have, reward.v2) + "/" + reward.v2;
        }

        private costClick(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let reward: xls.pair = this.listCost.array[idx];
                if (reward) {
                    clientCore.ToolTip.showTips(this.listCost.cells[idx], { id: reward.v1 });
                    return;
                };
            }
        }

        private getNumToAbc(has: number, need: number) {
            let arr: string[];
            if (has >= need) {
                arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
            } else {
                arr = ["k", "l", "m", "n", "o", "p", "q", "r", "s", "t"];
            }
            let str = has.toString();
            let res = "";
            for (let i: number = 0; i < str.length; i++) {
                res += arr[Number(str[i])];
            }
            return res;
        }

        private rewardRender(item: ui.restaurant.render.LvlupRewardRenderUI) {
            let type: number = item.dataSource;
            switch (type) {
                case 2://锅
                    item.icon.skin = "restaurant/reward_wok.png";
                    item.labDes.text = "解锁烹饪锅";
                    break;
                case 3://列菜口
                    item.icon.skin = "restaurant/reward_food.png";
                    item.labDes.text = "解锁菜品位";
                    break;
                case 4://座位
                    item.icon.skin = "restaurant/reward_table.png";
                    item.labDes.text = "解锁新座位";
                    break;
                case 5://套装
                    item.icon.skin = "restaurant/reward_suit.png";
                    item.labDes.text = "解锁新套装";
                    break;
                default://调料包、表情包
                    item.icon.skin = clientCore.ItemsInfo.getItemIconUrl(type);
                    item.labDes.text = clientCore.ItemsInfo.getItemName(type);
                    break;
            }
        }

        /**餐厅升级 */
        private levelUp() {
            if (!this._model.checkCanLevelUp()) {
                alert.showFWords("升级条件不足~");
                return;
            }
            net.sendAndWait(new pb.cs_upgrade_restaurant_level()).then((msg: pb.sc_upgrade_restaurant_level) => {
                alert.showReward(msg.items);
                this._model.curLevel++;
                this._model.curPoint = 0;
                this.setLevelInfo();
                this.btnLvlup.onRedChange(false);
                EventManager.event("ON_RESTAURANT_LEVEL_UP");
            });
        }

        /**主题 */
        private skinRender(item: ui.restaurant.render.RestaurantSkinRenderUI) {
            let data: xls.diningDecoration = item.dataSource;
            item.icon.skin = "res/restaurantSkin/icon/" + data.id + ".png";
            if (data.id == 0) {
                item.imgTip.visible = item.imgSelect.visible = item.imgFloweret.visible = item.imgLock.visible = false;
                return;
            }
            item.imgTip.visible = data.id == this._model.curSkin;
            item.imgSelect.visible = data.id == this.selectSkin;
            if (data.id == this._model.curSkin) {
                item.txtTip.text = "当前";
            }
            item.imgFloweret.visible = data.unlock.v1 == 2;
            item.imgLock.visible = this._model.haveSkin.indexOf(data.id) < 0;
            if (item.imgLock.visible) {
                if (data.unlock.v1 == 1) {
                    item.txtLock.text = "餐厅" + data.unlock.v2 + "级解锁";
                } else if (data.unlock.v1 == 2) {
                    item.txtLock.text = "奇妙花宝解锁";
                } else if (data.unlock.v1 == 3) {
                    item.txtLock.text = "商店神叶购买";
                } else if (data.unlock.v1 == 4) {
                    item.txtLock.text = "商店灵豆购买";
                }
            }
        }

        private skinSelect(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data: xls.diningDecoration = this.skinList.getCell(idx).dataSource;
                if (data.id == 0 || data.id == this.selectSkin) return;
                this.selectSkin = data.id;
                this.btnChange.gray = this.selectSkin == this._model.curSkin;
                this.skinList.refresh();
            }
        }

        /**切换主题 */
        private changeSkin() {
            if (!this.selectSkin || this.selectSkin == this._model.curSkin) return;
            net.sendAndWait(new pb.cs_change_restaurant_theme({ id: this.selectSkin })).then((msg: pb.sc_change_restaurant_theme) => {
                this._model.curSkin = this.selectSkin;
                this.selectSkin = 0;
                this.skinList.refresh();
                EventManager.event("ON_RESTAURANT_SKIN_CHANGE");
                alert.showFWords("已更换餐厅主题~");
            });
        }

        private closeClick() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnLvlup, Laya.Event.CLICK, this, this.levelUp);
            BC.addEvent(this, this.btnChange, Laya.Event.CLICK, this, this.changeSkin);
            BC.addEvent(this, this.bgType1, Laya.Event.CLICK, this, this.showTabView, [1]);
            BC.addEvent(this, this.bgType2, Laya.Event.CLICK, this, this.showTabView, [2]);

        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroyData() {
            this.listCost.renderHandler.recover();
            this.listCost.mouseHandler.recover();
            this.listCost.destroyChildren();
            this.listReward.renderHandler.recover();
            this.listReward.destroyChildren();
            this.skinList.renderHandler.recover();
            this.skinList.mouseHandler.recover();
            this.xlsData = this.xlsSkin = this._model = null;
            this.destroy();
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            this.selectSkin = 0;
            super.destroy();
        }
    }
}