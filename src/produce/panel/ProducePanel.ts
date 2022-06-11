namespace produce.panel {
    /**
     * 生产中面板
     */
    export class ProducePanel extends ui.produce.panel.ProducePanelUI implements IPanel {

        private _info: clientCore.MapItemInfo;

        constructor() {
            super();

            this.pos(250, 601);
            this.list.hScrollBarSkin = "";
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.selectEnable = true;
            this.list.selectHandler = Laya.Handler.create(this, this.listSelect, null, false);
        }

        update(parent: Laya.Sprite, info: clientCore.MapItemInfo,state:number): void {
            parent.addChild(this);
            this.addEvents();
            this._info = info;
            this.list.array = new Array(info.produceTotalNum);
            this.btnSpeedUp.visible = info.produceCompleteNum < info.produceTotalNum && this.list.length > 0;
            this.btnSpeedUpOneKey.visible = info.produceCompleteNum < info.produceTotalNum && this.list.length > 0;
        }

        updateFrame(): void {
            let preBoxSpeedUpVisible = this.btnSpeedUp.visible;
            this.btnSpeedUp.visible = this._info.produceCompleteNum < this._info.produceTotalNum && this.list.length > 0;
            this.btnSpeedUpOneKey.visible = this._info.produceCompleteNum < this._info.produceTotalNum && this.list.length > 0;
            let afterBoxSpeedUpVisible = this.btnSpeedUp.visible;
            this.list.startIndex = this.list.startIndex;
            //意味着加速完成
            if (preBoxSpeedUpVisible == true && afterBoxSpeedUpVisible == false) {
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickProduceSpeedUpBtn") {
                    clientCore.GuideMainManager.instance.skipStep(clientCore.GuideMainManager.instance.curGuideInfo.mainID, clientCore.GuideMainManager.instance.curGuideInfo.stepID + 2);
                    clientCore.GuideMainManager.instance.startGuide();
                }
            }
        }

        dispose(): void {
            this._info = null;
            this.list.array = null;
            this.removeEvents();
            this.removeSelf();
        }

        private addEvents(): void {
            BC.addEvent(this, this.btnSpeedUp, Laya.Event.CLICK, this, this.onSpeedUp);
            BC.addEvent(this,this.btnSpeedUpOneKey,Laya.Event.CLICK,this,this.speedUpOneKey);
        }
        private removeEvents(): void {
            BC.removeEvent(this);
        }
        private speedUpOneKey(){
            let useNum =  this.getTotalUseNum();
            alert.showSmall(`是否消耗${useNum}星之粉进行一键加速？`, { callBack: { caller: this, funArr: [this.sureSpeedUpOneKey] } });
        }
        private getTotalUseNum() {
            //计算当前这个还剩多少秒： 剩余总时间 - (总个数-已生产个数-1)*每个需要时间
            let restTime = this._info.produceRestTime % this._info.produceOneNeedTime;
            let reducePerStar = xls.get(xls.globaltest).get(1).starDust;
            let restNum = Math.floor(this._info.produceRestTime / this._info.produceOneNeedTime);
            let totalNeedNum = restNum * Math.ceil(this._info.produceOneNeedTime / reducePerStar) + Math.ceil(restTime / reducePerStar);
            return totalNeedNum;
        }
        private sureSpeedUpOneKey(){
            let reducePerStar = xls.get(xls.globaltest).get(1).starDust;
            let useNum =  this.getTotalUseNum();
            let has: number = clientCore.ItemsInfo.getItemNum(1550001);
            if(!clientCore.ItemsInfo.checkItemsEnough([new clientCore.GoodsInfo(1550001,useNum)]) && !clientCore.GuideMainManager.instance.isGuideAction){
                if(!clientCore.LittleRechargManager.instacne.checkCanShow(1) || clientCore.LocalInfo.userLv < 8){
                    alert.alertQuickBuy(1550001, useNum - has, true);
                }
                else{
                    clientCore.LittleRechargManager.instacne.activeWindowById(1);
                }
                return;
            }
            net.sendAndWait(new pb.cs_one_click_accelerate_products({id:this._info.id})).then((data:pb.sc_one_click_accelerate_products)=>{
                this._info.refreshItemInfo(data.builds[0]);
                this.btnSpeedUp.visible = false;
                this.btnSpeedUpOneKey.visible = false;
                EventManager.event(ProduceConstant.SHEEP_UP); //通知主页面
                EventManager.event(globalEvent.PRODUCE_SPEED_UP_SUCC, this._info.getTime);
                let bone = clientCore.BoneMgr.ins.play("res/animate/product/clock.sk",0,false,clientCore.LayerManager.upMainLayer);
                bone.pos(Laya.stage.width/2,Laya.stage.height/2);
            })
        }
       

        private onSpeedUp(): void {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickProduceSpeedUpBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            let useNum = this.getUseNum();
            alert.showSmall(`是否消耗${useNum}星之粉进行加速？`, { callBack: { caller: this, funArr: [this.sureSpeedUp] } });
        }

        private getUseNum() {
            //计算当前这个还剩多少秒： 剩余总时间 - (总个数-已生产个数-1)*每个需要时间
            let restTime = this._info.produceRestTime % this._info.produceOneNeedTime;
            let reducePerStar = xls.get(xls.globaltest).get(1).starDust;
            if (restTime == 0) {
                restTime = this._info.produceOneNeedTime;
            }
            return Math.ceil(restTime / reducePerStar);
        }
        private sureSpeedUp() {
            let useNum = this.getUseNum();
            let has: number = clientCore.ItemsInfo.getItemNum(1550001);
            if(!clientCore.ItemsInfo.checkItemsEnough([new clientCore.GoodsInfo(1550001,useNum)]) && !clientCore.GuideMainManager.instance.isGuideAction){
                if(!clientCore.LittleRechargManager.instacne.checkCanShow(1) || clientCore.LocalInfo.userLv < 8){
                    alert.alertQuickBuy(1550001, useNum - has, true);
                }
                else{
                    clientCore.LittleRechargManager.instacne.activeWindowById(1);
                }
                return;
            }
            net.sendAndWait(new pb.cs_some_product_quick_finish({ getTime: this._info.getTime })).then((msg: pb.sc_some_product_quick_finish) => {
                this._info.refreshItemInfo(msg.build);
                alert.showFWords("加速成功，快去收获产出吧！");
                EventManager.event(ProduceConstant.SHEEP_UP); //通知主页面
                EventManager.event(globalEvent.PRODUCE_SPEED_UP_SUCC, this._info.getTime);
            });
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickAlertShowSmallSureBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        // private calSpeedUpNeedItemNum(time: number): number {
        //     let needItemNum = 0;
        //     needItemNum += Math.floor(time / 86400) * 256;
        //     time = time % 86400;
        //     let hour = Math.floor(time / 3600);
        //     hour = (hour > 16 ? 16 : hour);
        //     needItemNum += hour * 16;
        //     time = time % 3600;
        //     let minutes = Math.floor(time / 60);
        //     minutes = Math.ceil(minutes / 5);
        //     minutes = (minutes > 8 ? 8 : minutes);
        //     needItemNum += minutes * 2;
        //     return needItemNum;
        // }

        private listSelect(index: number): void {
            let completeNum: number = this._info.produceCompleteNum;
            let isComplete = index < completeNum;
            if (isComplete)
                net.sendAndWait(new pb.cs_get_some_build_product({ getTime: this._info.getTime, num: 1 })).then((msg: pb.sc_get_some_build_product) => {
                    this._info.refreshItemInfo(msg.build);
                    EventManager.event(ProduceConstant.GET_ONE_PRODUCED);
                    EventManager.event(globalEvent.GET_ONE_PRODUCT_IN_MODULE,msg.build.getTime);
                    // 珍稀道具展现效果
                    if (msg.rareItems.length > 0) {
                        _.forEach(msg.rareItems, (element: pb.IItem) => {
                            alert.showSpecialItem(element.id, element.cnt, new Laya.Point(Laya.stage.width / 2, Laya.stage.height / 2), 2);
                        })
                    }
                })
        }

        private listRender(item: ui.produce.item.ProduceItemUI, index: number): void {
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(this._info.produceOutPutItemID);
            item.ico.scale(0.55, 0.55);
            // 0-已完成 1-正在进行 2-等待
            let completeNum: number = this._info.produceCompleteNum;
            let status: number = index < completeNum ? 0 : (index == completeNum ? 1 : 2);
            item.wait.visible = status == 2;
            item.boxTime.visible = status == 1;
            item.imgMask.visible = status != 0;
            item.mcGetState.visible = status == 0;
            let sp: Laya.Sprite = item.imgMask.mask;
            // 进度
            if (status == 1) {
                let t: number = this._info.produceOneNeedTime - (this._info.produceTotalNum - completeNum) * this._info.produceOneNeedTime + this._info.produceRestTime;
                let rate: number = t / this._info.produceOneNeedTime;
                if (!sp) {
                    sp = new Laya.Sprite();
                    sp.graphics.drawPie(36, 36, 50, -90, 270, "#FFFFFF");
                    item.imgMask.mask = sp;
                }
                let startA: number = 360 * (1 - rate) - 90;
                item.txTime.changeText(util.StringUtils.getDateStr(t));

                let cmd: Laya.DrawPieCmd = sp.graphics["_one"];
                cmd.startAngle = startA;
                sp.graphics["_repaint"]();
            } else {
                if (sp) {
                    let cmd: Laya.DrawPieCmd = sp.graphics["_one"];
                    cmd.startAngle = -90;
                    sp.graphics["_repaint"]();
                }
            }
        }
    }
}