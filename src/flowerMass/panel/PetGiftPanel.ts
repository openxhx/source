namespace flowerMass {
    /**
     * 花宝赠礼
     */
    export class PetGiftPanel extends ui.flowerMass.panel.PetGiftPanelUI {

        private suit:number = 2110619;
        private ruleId:number = 1240;
        private rewardArr:number[][] = [[145042 , 145051] , [145043 , 145052] , [ 145048, 145057]];

        constructor() {
            super();
            this.addEventListeners();
        }


        show(box: any) {
            clientCore.Logger.sendLog('2021年3月25日活动', '【付费】小花仙集合吧', '打开花宝赠礼面板');
            EventManager.event(CHANGE_TIME, "time_25_19");
            this.initUI();
            box.addChild(this);
        }

        initUI(){
            var vipArr:number[] = [0 , 1 , 3];
            this.imgSuit.skin = `unpack/flowerMass/${this.suit}_${clientCore.LocalInfo.sex}.png`;
            let sex = clientCore.LocalInfo.sex;
            net.sendAndWait(new pb.cs_anniversary_panel({})).then((msg: pb.sc_anniversary_panel) => {
                for(let i= 0 ; i<3 ; i++){
                    if( util.getBit(msg.babyRewardFlag , i+1) > 0){
                        this["imgGot" + (i+1)].visible = true;
                        this["btn" + (i+1)].visible = false;
                    }else{
                        this["imgGot" + (i+1)].visible = false;
                        this["btn" + (i+1)].visible = true;
                        if(clientCore.FlowerPetInfo.petType >= vipArr[i]){
                            this["btn" + (i+1)].skin = "flowerMass/PetGiftPanel/lingqu.png";
                        }else{
                            this["btn" + (i+1)].skin = "flowerMass/PetGiftPanel/chongzhi.png";
                        }
                    }
                }
            });
           
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        /**展示套装详情 */
        private onTryClick() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suit);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this.ruleId);
        }

        private goBuyPanel(){
            clientCore.Logger.sendLog('2021年3月25日活动', '【付费】小花仙集合吧', '点击充值奇妙花宝按钮');
            clientCore.ToolTip.gotoMod(52);
        }

        private getReward(i:number){
            var vipArr:number[] = [0 , 1 , 3];
            if(clientCore.FlowerPetInfo.petType>= vipArr[i-1]){
                net.sendAndWait(new pb.cs_get_anniversary_baby_reward({ babyLev:i })).then((msg: pb.sc_get_anniversary_baby_reward) => {
                    alert.showReward(msg.items);
                    this.initUI();
                });
            }else{
                this.goBuyPanel();
            }
        }


        addEventListeners() {
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.tryBtn, Laya.Event.CLICK, this, this.onTryClick);
            BC.addEvent(this, this.goBuy, Laya.Event.CLICK, this, this.goBuyPanel);
            for(let i:number = 1 ; i<=3 ; i++){
                BC.addEvent(this, this["btn" + i], Laya.Event.CLICK, this, this.getReward , [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            super.destroy();
        }
    }
}