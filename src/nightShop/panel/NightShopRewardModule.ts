namespace nightShop {
    /**
     * 2021.08.27
     * nightShop.NightShopRewardModule
     * 夜市灯如昼奖励
     */
    export class NightShopRewardModule extends ui.nightShop.NightShopRewardUI {
        private info: any[];
        private talkStr: string[] = ["吃饱了呢，要不给其他小伙伴买些吃的吧", "", "呐,人家有礼物要送给你哦", "唔,困了呢,主人我们回家吧？"];
        private talkStr1: string[] = ["唔，真好吃", "是我喜欢的味道呢！", "唔，真是开心的一天！", "从来没尝过的味道呢！",
            "嗯，吃完感觉自己更有活力了！", "还可以再来一份吗？", "下次还要一起来逛街！", "唔，好怀念的味道！"];
        public petId: number[][] = [[1, 1], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5]];

        constructor() {
            super();
            this.sideClose = false;
        }

        public setData(idx: any[]) {
            this.info = idx;
            this.setPanel();
        }

        private setPanel() {
            this.homeBtn.visible = false;
            this.arrowIcon.visible = false;
            this.addTxt.visible = false;
            this.petShow.visible = true;
            this.petShow.skin = `nightShop/pet_${this.info[1]}.png`;
            if (this.info[0] == 0) {
                this.talkTxt.text = this.talkStr[0];
                BC.addEvent(this, this, Laya.Event.CLICK, this, this.onClose);
            } else if (this.info[0] == 1) {
                this.arrowIcon.visible = true;
                this.addTxt.visible = true;
                this.addTxt.text = "好感度+" + this.info[2];
                this.talkTxt.text = this.talkStr1[this.info[1]];
                BC.addEvent(this, this, Laya.Event.CLICK, this, this.onClose);
            } else if (this.info[0] == 2) {
                this.talkTxt.text = this.talkStr[2];
                this.petShow.visible = false;
                let petItem: clientCore.Bone = clientCore.BoneMgr.ins.play(pathConfig.getflowerPetRes(this.petId[this.info[1]][0], this.petId[this.info[1]][1]), "gift", false, this);
                petItem.y = 519;
                petItem.x = 519;
                petItem.scaleX = 0.7;
                petItem.scaleY = 0.7;
                petItem.once(Laya.Event.COMPLETE, this, () => {
                    petItem.dispose();
                    let reward = this.info[2].item;
                    alert.showReward(reward);
                    this.onClose();
                })
            } else {
                this.talkTxt.text = this.talkStr[3];
                this.homeBtn.visible = true;
                BC.addEvent(this, this.homeBtn, Laya.Event.CLICK, this, this.onClose);
            }
        }

        onClose() {
            BC.removeEvent(this);
            clientCore.DialogMgr.ins.close(this, false);
        }

        clear() {
            this.petId = this.talkStr = this.talkStr1 = this.info = null;
        }
    }
}