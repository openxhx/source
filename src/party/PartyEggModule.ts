
namespace party {
    /**
     * 派对扭蛋
     * party.PartyEggModule
     */
    export class PartyEggModule extends ui.party.PartyEggModuleUI {
        private _tenPanel: PartyTenPanel;
        private _coinId: number[];
        private _poolID: number;
        private _poolIDArr:number[];
        private _curPoolIndex:number;
        init(d: any) {
            super.init(d);
            this.addPreLoad(xls.load(xls.giftSell));
            this.addPreLoad(xls.load(xls.godTree));
        }

        onPreloadOver() {
            /** 如果传进来的是物品ID，需要对应到物品所属奖池里面 */
            if (this._data) {
                if (this._data < 200) {
                    this._poolID = this._data;
                }
                else{
                    let arr = _.filter(xls.get(xls.godTree).getValues(),function(o){let id = clientCore.LocalInfo.sex == 1?o.item.v1:o.itemMale.v1;return id == this._data});
                    if(arr.length < 1){
                        console.log(`不存在物品${this._data}对应的奖池`);
                        return;
                    }
                    this._poolID = arr[0].module;
                }
            }
            this.initPrizePool();
            this._curPoolIndex = this._poolIDArr.indexOf(this._poolID);
            this.changePoolInfo();

            clientCore.Logger.sendLog('2020年6月24日活动', '【家具扭蛋机】', `打开${xls.get(xls.giftSell).get(this._poolID).name}面板`);
        }

        initPrizePool(){
            let allPoolArr = _.filter(xls.get(xls.giftSell).getValues(),function(o){return o.id > 100 && o.id < 200});
            this._poolIDArr = _.map(allPoolArr,function(o){return o.id});
        }

        changePoolInfo(){
            let config = xls.get(xls.giftSell).get(this._poolID);
            this.imgOne.skin = clientCore.ItemsInfo.getItemIconUrl(config.oneLottery[0].v1);
            this.numOne.value = config.oneLottery[0].v2.toString();
            this.imgTen.skin = clientCore.ItemsInfo.getItemIconUrl(config.tenLottery[0].v1);
            this.numTen.value = config.tenLottery[0].v2.toString();
            this.txtName.text = config.name;
            clientCore.UIManager.showCoinBox();
            this._coinId = _.uniq([config.oneLottery[0].v1, config.tenLottery[0].v1,clientCore.MoneyManager.LEAF_MONEY_ID]);
            clientCore.UIManager.setMoneyIds(this._coinId);

            this.startRound();
        }

        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitEggModuleOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }


        private _tening: boolean;
        private onDraw(times: number) {
            if (this._tening) {
                alert.showFWords('点的太急啦！');
                return;
            }
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickEggModuleDraw") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            let config = xls.get(xls.giftSell).get(this._poolID);
            let needId = times == 1 ? config.oneLottery[0].v1 : config.tenLottery[0].v1;
            let needNum = times == 1 ? config.oneLottery[0].v2 : config.tenLottery[0].v2;
            //神叶不足
            let haveLeaf = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID);
            if (needId == clientCore.MoneyManager.LEAF_MONEY_ID && haveLeaf < needNum) {
                alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                    alert.AlertLeafEnough.showAlert(needNum - haveLeaf);
                }));
                return;
            }

            //不然就快捷购买
            let diff: number = needNum - clientCore.ItemsInfo.getItemNum(needId);
            if (diff > 0) {
                let array: xls.shop[] = xls.get(xls.shop).getValues();
                let len: number = array.length;
                let quickSell: boolean = false;
                let buyCnt: number = 0;
                for (let i: number = 0; i < len; i++) {
                    let element: xls.shop = array[i];
                    if (element.itemId == needId && element.quickSell == 1) {
                        quickSell = true;
                        buyCnt = element.unitNum;
                        break;
                    }
                }
                if (quickSell)
                    alert.alertQuickBuy(needId, Math.max(buyCnt,diff), true);
                return
            }
            if (times == 10) {
                this._tening = true;
            }
            net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: this._poolID, times: times })).then((data: pb.sc_common_activity_draw) => {
                if (data.times == 1) {
                    if (data.item[0]) {
                        let godTreeInfo = data.item[0];
                        this.playRotateAni().then(() => {
                            let xlsInfo = xls.get(xls.godTree).get(godTreeInfo.id);
                            if (xlsInfo) {
                                let rwdPair = clientCore.LocalInfo.sex == 1 ? xlsInfo.item : xlsInfo.itemMale
                                if (xlsInfo.type == 3)
                                    alert.showDrawClothReward(rwdPair.v1);
                                else
                                    alert.showReward([clientCore.GoodsInfo.create(rwdPair)]);
                            }else{
                                alert.showSmall(`道具:${clientCore.ItemsInfo.getItemName(godTreeInfo.flag)}到达背包上限`);
                            }
                        })
                    }
                }
                else {
                    this._tenPanel = this._tenPanel || new PartyTenPanel();
                    this._tenPanel.showReward(data.item);
                    Laya.timer.once(1000, this, this.onDelayOver);
                }
                EventManager.event(globalEvent.PARTY_PACKAGE_ITEM_CHANGE_BY_DRAW, [data.item]);
            }).catch(() => {
                if (times == 10) {
                    this._tening = false;
                }
            });
        }

        private async playRotateAni() {
            this.mouseEnabled = false;
            await this.playSwitchAni(true);
            await this.playBallAni();
            this.imgBall.visible = true;
            await this.playSwitchAni(false);
            this.mouseEnabled = true;
        }

        private playSwitchAni(postive: boolean) {
            this.ani1.wrapMode = postive ? Laya.AnimationBase.WRAP_POSITIVE : Laya.AnimationBase.WRAP_REVERSE;
            this.ani1.play(0, false);
            return new Promise((ok) => {
                this.ani1.once(Laya.Event.COMPLETE, this, ok);
            })
        }

        private playBallAni() {
            let bone = clientCore.BoneMgr.ins.play('res/animate/party/gashapon.sk', 0, false, this.ani);
            bone.on(Laya.Event.START, this, () => { this.imgBall.visible = false });
            return new Promise((ok) => {
                bone.once(Laya.Event.COMPLETE, this, ok);
            })
        }

        private onDelayOver() {
            this._tening = false;
        }

        private async onOpenPreview() {
            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", this._poolID)
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds(this._coinId);
                clientCore.UIManager.showCoinBox();
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnOne, Laya.Event.CLICK, this, this.onDraw, [1]);
            BC.addEvent(this, this.btnTen, Laya.Event.CLICK, this, this.onDraw, [10]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnPrev, Laya.Event.CLICK, this, this.onOpenPreview);
            BC.addEvent(this,this.btnPre,Laya.Event.CLICK,this,this.onPageClick,[-1]);
            BC.addEvent(this,this.btnNext,Laya.Event.CLICK,this,this.onPageClick,[1]);


            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo)
        }
        onPageClick(num:number){
            let page = this._curPoolIndex + num;
            if(page < 0){
                page = 0;
            }
            if(page > this._poolIDArr.length-1){
                page = this._poolIDArr.length-1;
            }
            if(page != this._curPoolIndex){
                this._curPoolIndex = page;
                this._poolID  = this._poolIDArr[this._curPoolIndex];
                this.changePoolInfo();
            }
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "partyEggModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, null);
                }
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
            clientCore.UIManager.releaseCoinBox();
        }


        private _t: time.GTime;
        private _img: Laya.Image;
        private _current: number = 1;
        private startRound(): void {
            util.TweenUtils.remove('PartyEggModule');
            this._t?.dispose();
            if(this._img){
                this._img.skin = "";
            }
            this.imgNotice.skin = pathConfig.getPartyEggAdv(""+this._poolID+"_"+this._current);
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 5000, this, this.showRound);
            this._t.start();
        }
        private showRound(): void {
            this._img = this._img || new Laya.Image();
            this._current = this._current + 1 > 2 ? 1 : this._current + 1;
            this._img.skin = pathConfig.getPartyEggAdv(""+this._poolID+"_"+this._current);
            this._img.x = 458;
            this.panel.addChild(this._img);
            util.TweenUtils.creTween(this._img, { x: 0 }, 1000, null, this, () => {
                this.imgNotice.skin = this._img.skin;
                this._img.removeSelf();
                this._img.skin = '';
                this._img.x = 458;
            }, 'PartyEggModule');
        }


        destroy(): void {
            util.TweenUtils.remove('PartyEggModule');
            this._t?.dispose();
            this._img?.destroy();
            this._t = this._img = null;
            super.destroy();
            EventManager.event("party_egg_module_close");
        }
    }
}