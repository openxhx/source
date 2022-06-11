namespace zongziEat {
    /**
     * 小花仙端午之约
     * zongziEat.ZongziEatModule
     * 2022.5.27
     */
    export class ZongziEatModule extends ui.zongziEat.ZongziEatModuleUI {
        private rewardPanel: RewardPanel;
        private curPoint: number;
        private curZongziNum: number;
        private suitId: number;
        private riceCount: number;
        private beanCount: number;
        private leavesCount: number;
        private canMake: number;
        private makeCnt: number;
        init() {
            this.addPreLoad(xls.load(xls.collocationActivity));
            this.addPreLoad(this.getEventInfo());
            this.addPreLoad(res.load("unpack/zongziEat/zongzi.png"));
            this.addPreLoad(res.load("unpack/zongziEat/zongzi.sk"));
            this.imgSuit.skin = `unpack/zongziEat/suit_${clientCore.LocalInfo.sex}.png`;
        }

        private getEventInfo() {
            return net.sendAndWait(new pb.cs_dragon_boat_festival_meet()).then((msg: pb.sc_dragon_boat_festival_meet) => {
                this.rewardPanel = new RewardPanel();
                this.rewardPanel.rewardFlag = msg.itemBit;
                this.rewardPanel.curPoint = this.curPoint = msg.point;
                this.curZongziNum = msg.zongziNum;
            })
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2022年5月27日活动', '【主活动】粽子试吃大赛', '打开主活动面板');
            this.suitId = 2110669;
            this.riceCount = clientCore.ItemsInfo.getItemNum(9900042);
            this.beanCount = clientCore.ItemsInfo.getItemNum(9900043);
            this.leavesCount = clientCore.ItemsInfo.getItemNum(9900044);
            this.canMake = this.makeCnt = Math.min(this.riceCount, this.beanCount, this.leavesCount);
            this.setMtrInfo();
            this.setZongziInfo();
            this.labPoint.text = "" + this.curPoint;
        }

        popupOver(){
            this.aniRole.play("idle", true);
        }

        private showRule() {
            alert.showRuleByID(1244);
        }

        private showSuit() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suitId);
        }

        private goGame() {
            if (this.curZongziNum <= 0) {
                alert.showFWords("请先制作粽子~");
                return;
            }
            clientCore.Logger.sendLog('2022年5月27日活动', '【主活动】粽子试吃大赛', '点击前往参赛按钮');
            this.destroy();
            clientCore.ModuleManager.open("zongziEatGame.ZongziEatGameModule");
        }

        private showReward() {
            clientCore.Logger.sendLog('2022年5月27日活动', '【主活动】粽子试吃大赛', '点击积分奖励按钮');
            clientCore.DialogMgr.ins.open(this.rewardPanel);
        }

        private showMake() {
            if (this.canMake <= 0) {
                this.addMaterial();
                return;
            }
            this.boxBase.visible = false;
            this.setMakeInfo();
            this.boxMake.visible = true;
        }

        private hideMake() {
            this.boxMake.visible = false;
            this.setMtrInfo();
            this.boxBase.visible = true;
        }

        private setMtrInfo() {
            this.labCount1.text = "" + this.riceCount;
            this.labCount2.text = "" + this.beanCount;
            this.labCount3.text = "" + this.leavesCount;
        }

        private setMakeInfo() {
            this.labNeed1.text = this.makeCnt + "/" + this.riceCount;
            this.labNeed2.text = this.makeCnt + "/" + this.beanCount;
            this.labNeed3.text = this.makeCnt + "/" + this.leavesCount;
            this.labNumber.text = "" + this.makeCnt;
        }

        private addMaterial() {
            clientCore.Logger.sendLog('2022年5月27日活动', '【主活动】粽子试吃大赛', '点击3种材料的加号按钮');
            alert.showSmall("前往完成订单获取材料", { needClose: true, needMask: true, clickMaskClose: false, btnType: 1, callBack: { caller: this, funArr: [this.goOrder] } })
        }

        /**前往订单 */
        private goOrder() {
            // clientCore.Logger.sendLog('2022年3月25日活动', '【主活动】小花仙两周年庆典', '打开立牌拍照面板');
            this.destroy();
            clientCore.ToolTip.gotoMod(13);
        }

        private setCount(flag: number) {
            this.makeCnt = _.clamp(this.makeCnt + flag, 1, this.canMake);
            this.setMakeInfo();
        }

        private sureMake() {
            clientCore.Logger.sendLog('2022年5月27日活动', '【主活动】粽子试吃大赛', '点击制作粽子按钮');
            this.btnSure.disabled = true;
            net.sendAndWait(new pb.cs_dragon_boat_festival_make_zongzi({ num: this.makeCnt })).then((msg: pb.sc_dragon_boat_festival_make_zongzi) => {
                this.aniRole.once(Laya.Event.STOPPED, this, () => {
                    alert.showFWords("制作成功！");
                    this.curZongziNum += this.makeCnt;
                    this.setZongziInfo();
                    this.canMake -= this.makeCnt;
                    this.riceCount -= this.makeCnt;
                    this.beanCount -= this.makeCnt;
                    this.leavesCount -= this.makeCnt;
                    this.makeCnt = this.canMake;
                    if (this.canMake <= 0) this.hideMake();
                    else this.setMakeInfo();
                    this.btnSure.disabled = false;
                    this.aniRole.play("idle",true,true);
                })
                this.aniRole.play("made",false,true);
            })
        }

        private setZongziInfo() {
            this.labCount.text = "" + this.curZongziNum;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.showSuit);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.goGame);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.showReward);
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.showMake);
            BC.addEvent(this, this.btnAdd1, Laya.Event.CLICK, this, this.addMaterial);
            BC.addEvent(this, this.btnAdd2, Laya.Event.CLICK, this, this.addMaterial);
            BC.addEvent(this, this.btnAdd3, Laya.Event.CLICK, this, this.addMaterial);
            BC.addEvent(this, this.btnReduce, Laya.Event.CLICK, this, this.setCount, [-1]);
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.setCount, [1]);
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.hideMake);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.sureMake);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.rewardPanel?.destroy();
            this.rewardPanel = null;
            super.destroy();
        }
    }
}