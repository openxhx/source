namespace nightShop {
    /**
     * 2021.08.27
     * nightShop.NightShopModule
     * 夜市灯如昼
     */
    export class NightShopModule extends ui.nightShop.NightShopModuleUI {
        public petItem0: clientCore.Bone;
        public petItem1: clientCore.Bone;
        private petIndex: number = 0;
        private talkIndex: number = 0;
        private buyPanel: NightShopBuyModule;
        private shopTalkIndex: number;
        private scaleArr: number[] = [0.4, 0.4, 0.4, 0.4, 0.25, 0.3, 0.25, 0.20];
        public petId: number[][] = [[1, 1], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5]];
        private talkPos: xls.pair[] = [
            { v1: 399, v2: 463 },
            { v1: 138, v2: 285 },
            { v1: 521, v2: 195 },
            { v1: 1059, v2: 491 },
            { v1: 889, v2: 306 },
            { v1: 979, v2: 168 }
        ];

        init(d: any) {
            this.addPreLoad(xls.load(xls.activityshop));
            this.addPreLoad(xls.load(xls.dialog));
            this.addPreLoad(xls.load(xls.babypresent));
            this.addPreLoad(net.sendAndWait(new pb.cs_night_market_shine_info()).then((msg: pb.sc_night_market_shine_info) => {
                let model = NightShopModel.instance;
                model.petState = msg.hua;
                model.shopState = msg.task;
                model.shopState2 = msg.task2;
                model.refreshShopState();
            }));
        }

        initOver(): void {
            this.showPet();
            this.petTalk.visible = false;
            this.setShopTalk();
        }

        setShopTalk() {
            let i: number = Math.floor(Math.random() * 6);
            while (i == this.shopTalkIndex) {
                i = Math.floor(Math.random() * 6);
            }
            this.shopTalkIndex = i;
            if (NightShopModel.instance.shopStateArr[this.shopTalkIndex] == 0 || NightShopModel.instance.checkPet() == 0) {
                this.talkBubble.skin = `nightShop/icon_end.png`;
            } else {
                this.talkBubble.skin = `nightShop/bubble${this.shopTalkIndex}.png`;
            }
            this.talkBubble.x = this.talkPos[i].v1;
            this.talkBubble.y = this.talkPos[i].v2;
        }

        /**初始化花宝 */
        private showPet() {
            this.petIndex = Math.floor(Math.random() * 7);
            let i: number = Math.floor(Math.random() * 7);
            while (i == this.petIndex) {
                i = Math.floor(Math.random() * 7);
            }
            this.petIndex = i;
            this.petTalk.visible = false;
            if (this.petItem0) {
                this.petItem0.dispose();
                this.petItem1.dispose();
            }
            this.petItem0 = clientCore.BoneMgr.ins.play(pathConfig.getflowerPetRes(this.petId[this.petIndex + 1][0], this.petId[this.petIndex + 1][1]), "fly", true, this, { addChildAtIndex: 2 });
            this.petItem1 = clientCore.BoneMgr.ins.play(pathConfig.getflowerPetRes(this.petId[this.petIndex][0], this.petId[this.petIndex][1]), "fly", true, this, { addChildAtIndex: 2 });
            this.petItem0.x = 550;
            this.petItem0.y = 750;
            this.petItem1.x = this.petItem0.x - 110;
            this.petItem0.y = this.petItem0.y + 110;
            this.petItem0.scaleX = -this.scaleArr[this.petIndex];
            this.petItem0.scaleY = this.scaleArr[this.petIndex];
            this.petItem1.scaleX = -this.scaleArr[this.petIndex + 1];
            this.petItem1.scaleY = this.scaleArr[this.petIndex + 1];
            this.petHeart1.x =  this.petItem0.x-100;
            this.petHeart1.y = this.petItem0.y-150;
            this.petHeart0.x =  this.petItem1.x-100;
            this.petHeart0.y = this.petItem1.y-150;
            for(let j=0 ; j<3 ; j++){
                this["heart" + j].skin = NightShopModel.instance.petState[this.petIndex] >= 10*(j+1) ? `nightShop/heart_1.png`:`nightShop/heart_0.png`;
                this["heart" + (3+j)].skin = NightShopModel.instance.petState[this.petIndex+1] >= 10*(j+1) ? `nightShop/heart_1.png`:`nightShop/heart_0.png`;
            }
        }

        private onFrame() {
            this.shopTalkIndex++;
            if (this.shopTalkIndex > 150) {
                this.shopTalkIndex = 0;
                this.setShopTalk();
            }
            this.petItem0.x += 0.6;
            this.petItem0.y -= 1;
            this.petItem1.x = this.petItem0.x - 150;
            this.petItem1.y = this.petItem0.y + 150;
            this.petHeart1.x =  this.petItem0.x-100;
            this.petHeart1.y = this.petItem0.y-150;
            this.petHeart0.x =  this.petItem1.x-100;
            this.petHeart0.y = this.petItem1.y-150;
            if (this.petItem0.y < 200) {
                this.talkIndex++;
                if (this.talkIndex >= xls.get(xls.dialog).length) {
                    this.talkIndex = 0;
                }
                this.showPet();
            } else {
                let talkIdx = 0;
                let txtIdx = 0;
                if (this.petItem0.y < 350) {
                    talkIdx = 1;
                    txtIdx = 4;
                } else if (this.petItem0.y < 450) {
                    talkIdx = 0;
                    txtIdx = 3;
                } else if (this.petItem0.y < 550) {
                    talkIdx = 1;
                    txtIdx = 2;
                } else if (this.petItem0.y < 650) {
                    this.petTalk.visible = true;
                    talkIdx = 0;
                    txtIdx = 1;
                }
                this.petTxt.text = xls.get(xls.dialog).get(this.talkIndex + 1)['dial_' + txtIdx];
                this.petTalk.x = this['petItem' + talkIdx].x - 100;
                this.petTalk.y = this['petItem' + talkIdx].y - 200;
            }
        }

        private onShopClick(i: number) {
            if (NightShopModel.instance.shopStateArr[i] == 0 || NightShopModel.instance.checkPet() == 0) {
                alert.showFWords("本店已打烊~");
                return;
            }
            if (!this.buyPanel) this.buyPanel = new NightShopBuyModule();
            this.buyPanel.setData(i);
            clientCore.DialogMgr.ins.open(this.buyPanel);
        }

        private onRule() {
            alert.showRuleByID(1205);
        }

        /**奖励总览 */
        private preReward() {
            clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", NightShopModel.instance.creatRewardDetial());
        }

        addEventListeners() {
            Laya.timer.loop(33, this, this.onFrame);
            for (let i: number = 0; i < 6; i++) {
                BC.addEvent(this, this["shop_" + i], Laya.Event.CLICK, this, this.onShopClick, [i]);
            }
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnDetial, Laya.Event.CLICK, this, this.preReward);
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            Laya.timer.clear(this, this.onFrame);
            this.petItem0?.dispose();
            this.petItem1?.dispose();
            this.buyPanel?.clear();
            this.petId = this.scaleArr = this.talkPos = this.petItem0 = this.petItem1 = this.buyPanel = null;
            super.destroy();
        }
    }
}