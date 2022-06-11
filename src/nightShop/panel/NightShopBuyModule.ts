namespace nightShop {
    /**
     * 2021.08.27
     * nightShop.NightShopBuyModule
     * 夜市灯如昼购买
     */
    export class NightShopBuyModule extends ui.nightShop.NightShopBuyModuleUI {
        private shopIndex: number; //选中6个商店中一个
        private selectIndex: number = -1; //选中三个商品中的一个

        private rewardPanel: NightShopRewardModule;
        private shopInfoArr: xls.activityshop[];
        private petId: number[] = [1, 2, 3, 41, 42, 43, 44, 45];
        private trigerPos: number[] = [494, 698, 901];
        private boxPos: number[] = [473, 680, 885];
        private boxPos1: number[] = [456, 665, 863];
        private talkStr: string[] = ["嗨~您要买 些什么水果呢？", "吃碗麻辣烫， 人生又充满希望！", "第一次喝咖啡 的小可爱,可以加点 奶或者糖哦~",
            "咳，被你发现 啦~别告诉露莎和 露娜仙女哦~", "黄瓜清新，鱼子 酱鲜美，培根咸鲜， 各有各的好~", "吃的了 多少就买多大份， 别勉强哦~", "哎呀，提前收工，打烊哦~"]

        constructor() {
            super();
            this.sideClose = false;
        }

        public setData(idx: number) {
            this.shopIndex = idx;
            this.setClickArea();
            this.icon_npc.skin = `unpack/nightShop/npc_${this.shopIndex}.png`;
            if (NightShopModel.instance.shopStateArr[this.shopIndex] == 0) {
                this.talkTxt.text = this.talkStr[6];
            } else {
                this.talkTxt.text = this.talkStr[this.shopIndex];
            }
            for (let i = 0; i < 3; i++) {
                this["food" + i].skin = `nightShop/food_${this.shopIndex * 3 + i}.png`
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.buyBtn, Laya.Event.CLICK, this, this.onBuyClick);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.needIcon0, Laya.Event.CLICK, this, this.onShowMaterial, [0]);
            BC.addEvent(this, this.needIcon1, Laya.Event.CLICK, this, this.onShowMaterial, [1]);
        }

        private onShowMaterial(index: number): void {
            let xmlInfo: xls.activityshop = this.shopInfoArr[this.shopIndex * 3 + this.selectIndex];
            clientCore.ToolTip.showTips(this[`needIcon${index}`], { id: xmlInfo.meterial[index].v1 });
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onRule() {
            alert.showRuleByID(1205);
        }

        initOver(): void {
            this.shopInfoArr = xls.get(xls.activityshop).getValues();
            this.selectItem(0);
            this.refreshItemNum();
        }

        protected setClickArea() {
            for (let i: number = 0; i < 3; i++) {
                let trigger = new Laya.Sprite();
                trigger.width = 100;
                trigger.height = 100;
                trigger.graphics.clear();
                trigger.graphics.drawRect(0, 0, trigger.width, trigger.height, "#000000");
                trigger.alpha = 0;
                this.addChild(trigger);
                trigger.x = this.trigerPos[i];
                trigger.y = 258;
                BC.addEvent(this, trigger, Laya.Event.CLICK, this, this.onItemClick, [i]);
            }
        }

        private selectItem(i: number) {
            if (i != this.selectIndex) {
                this.selectIndex = i;
                this.showShop();
                if (this["leftTxt" + this.selectIndex].text == "已售罄") {
                    this.buyBtn.disabled = true;
                } else {
                    this.buyBtn.disabled = false;
                }
            }
        }

        private showShop() {
            let xmlInfo: xls.activityshop = this.shopInfoArr[this.shopIndex * 3 + this.selectIndex];
            for (let i: number = 0; i < xmlInfo.meterial.length; i++) {
                this["needIcon" + i].skin = clientCore.ItemsInfo.getItemIconUrl(xmlInfo.meterial[i].v1);
                this["needTxt" + i].text = clientCore.ItemsInfo.getItemNum(xmlInfo.meterial[i].v1) + "/" + xmlInfo.meterial[i].v2;
            }
            for (let i: number = 0; i < 3; i++) {
                this[`box${i}`].skin = this.selectIndex == i ? `nightShop/highLight1.png` : `nightShop/highLight0.png`;
                this[`box${i}`].x = this.selectIndex == i ? this.boxPos1[i] : this.boxPos[i];
                this[`box${i}`].y = this.selectIndex == i ? 245 : 262;
                this["food" + i].scaleX = this.selectIndex == i ? 1.1 : 1;
                this["food" + i].scaleY = this.selectIndex == i ? 1.1 : 1;
            }
        }

        private refreshItemNum(): void {
            let model = NightShopModel.instance;
            for (var i: number = 0; i < 3; i++) {
                if (model.getNumberBit(this.shopIndex * 3 + i + 1) < 3) {
                    this["leftTxt" + i].text = "库存" + (3 - model.getNumberBit(this.shopIndex * 3 + i + 1));
                } else {
                    this["leftTxt" + i].text = "已售罄";
                }

            }
            if (this["leftTxt" + this.selectIndex].text == "已售罄") {
                this.buyBtn.disabled = true;
            } else {
                this.buyBtn.disabled = false;
            }
        }

        private onItemClick(i: number) {
            this.selectItem(i);
        }

        private onBuyClick() {
            let model = NightShopModel.instance;
            let xmlInfo: xls.activityshop = this.shopInfoArr[this.shopIndex * 3 + this.selectIndex];
            let arr: any[];
            if (!this.rewardPanel) this.rewardPanel = new NightShopRewardModule();
            for (var i: number = 0; i < model.petState.length; i++) {
                if (model.petState[i] < 30) {
                    break;
                }
            }
            // if (i == model.petState.length) {
            //     arr = [[3, this.petId.indexOf(xmlInfo.id_baby)]];
            //     this.rewardPanel.setData(arr);
            //     clientCore.DialogMgr.ins.open(this.rewardPanel);
            // } else if (model.petState[this.petId.indexOf(xmlInfo.id_baby)] >= 30) {
            //     arr = [0, this.petId.indexOf(xmlInfo.id_baby)];
            //     this.rewardPanel.setData(arr);
            //     clientCore.DialogMgr.ins.open(this.rewardPanel);
            // } else {
            //     if (clientCore.ItemsInfo.getItemNum(xmlInfo.meterial[0].v1) < xmlInfo.meterial[0].v2 || clientCore.ItemsInfo.getItemNum(xmlInfo.meterial[1].v1) < xmlInfo.meterial[1].v2) {
            //         alert.showFWords("购买所需材料不足~");
            //         return;
            //     }
            //     net.sendAndWait(new pb.cs_night_market_shine_exchange({ index: this.shopIndex * 3 + this.selectIndex + 1 })).then((msg: pb.sc_night_market_shine_exchange) => {
            //         if (msg != null && msg.item.length > 0) {
            //             arr = [2, this.petId.indexOf(xmlInfo.id_baby), msg];
            //         } else {
            //             arr = [1, this.petId.indexOf(xmlInfo.id_baby), xmlInfo.friendliness];
            //         }
            //         this.rewardPanel.setData(arr);
            //         clientCore.DialogMgr.ins.open(this.rewardPanel, false);
            //     });
            //     net.sendAndWait(new pb.cs_night_market_shine_info()).then((msg: pb.sc_night_market_shine_info) => {
            //         let model = NightShopModel.instance;
            //         model.petState = msg.hua;
            //         model.shopState = msg.task;
            //         model.shopState2 = msg.task2;
            //         this.refreshItemNum();
            //         this.showShop();
            //         model.refreshShopState();
            //         if (NightShopModel.instance.shopStateArr[this.shopIndex] == 0) {
            //             this.talkTxt.text = this.talkStr[6];
            //         } 
            //     });
            // }
        }



        removeEventListeners() {
            BC.removeEvent(this);
        }

        clear() {
            this.rewardPanel?.clear();
        }
    }
}