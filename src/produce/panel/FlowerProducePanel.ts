namespace produce.panel {
    /**
     * 补充材料
     */
    export class FlowerProducePanel extends ui.produce.panel.FlowerProducePanelUI implements IPanel {
        private _info: pb.FlowerInfo;
        private _curSpeedUpInfo: clientCore.MapItemInfo;
        private _increaseLimitPanel:IncreaseLimitPanel;
        constructor() {
            super();

            this.pos(250, 601);
            this.list.hScrollBarSkin = "";
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.selectEnable = true;
            this.list.selectHandler = Laya.Handler.create(this, this.listSelect, null, false);

            this.btnIncreaseLimit.visible = clientCore.LocalInfo.userLv >= 9;
        }
        private listSelect(index: number): void {
            let selectFlowerInfo = this.list.array[index] as clientCore.MapItemInfo;
            if (selectFlowerInfo.flowerCurStage >= clientCore.MapItemInfo.FLOWER_MAX_STAGE) {
                let optInfo = selectFlowerInfo.createOptInfo(6);
                net.sendAndWait(new pb.cs_map_build_produce_opt({ itemInfo: [optInfo] })).then((data: pb.sc_map_build_produce_opt) => {
                    EventManager.event(globalEvent.HARVEST_ONE_FLOWER, selectFlowerInfo.id);
                    clientCore.MapItemsInfoManager.instance.removeOneMapItem(selectFlowerInfo.getTime);
                    EventManager.event(ProduceConstant.GET_ONE_PRODUCED);
                });
            }
        }

        private listRender(item: ui.produce.item.ProduceItemUI, index: number): void {
            let selectFlowerInfo = this.list.array[index] as clientCore.MapItemInfo;
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(xls.get(xls.flowerPlant).get(selectFlowerInfo.id).outputItem);
            item.ico.scale(0.55, 0.55);
            // // 0-已完成 1-正在进行 2-等待
            item.wait.visible = selectFlowerInfo.flowerBeginTime == 0;
            item.boxTime.visible = selectFlowerInfo.flowerBeginTime > 0 && selectFlowerInfo.flowerCurStage < clientCore.MapItemInfo.FLOWER_MAX_STAGE;
            item.imgMask.visible = (item.wait.visible || item.boxTime.visible);
            item.mcGetState.visible = selectFlowerInfo.flowerCurStage >= clientCore.MapItemInfo.FLOWER_MAX_STAGE;
            let sp: Laya.Sprite = item.imgMask.mask;
            // // 进度
            if (item.boxTime.visible) {
                let flowerGrowInfo = selectFlowerInfo.getFlowerGrowTimeInfo();
                // console.log(`总时间：${flowerGrowInfo.totalTime}  剩余时间：${flowerGrowInfo.restTime}`);
                let restTime = flowerGrowInfo.restTime;
                let totalTime = flowerGrowInfo.totalTime;
                let rate: number = restTime / totalTime;
                if (!sp) {
                    sp = new Laya.Sprite();
                    sp.graphics.drawPie(36, 36, 50, -90, 270, "#FFFFFF");
                    item.imgMask.mask = sp;
                }
                let startA: number = 360 * (1 - rate) - 90;
                item.txTime.changeText(util.StringUtils.getDateStr(restTime));

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
        update(parent: Laya.Sprite, info: pb.FlowerInfo,state:number): void {
            parent.addChild(this);
            this.addEvents();
            this._info = info;
            this.list.array = this.findAllFlowerByID(info.flowerId);
            this.txtFloweer.changeText(clientCore.MapItemsInfoManager.instance.getAllFlowerInMap().length + "/" + (clientCore.ScienceTreeManager.ins.increment(1) + clientCore.BuildingUpgradeConf.getGodTreeInfo(99).plantLimit + clientCore.FlowerPetInfo.getPrivilegeByType(4)));
            this.txtHas.changeText("" + clientCore.ItemsInfo.getItemNum(xls.get(xls.flowerPlant).get(info.flowerId).outputItem));
            this.btnSpeedUp.visible = this.list.length > 0 && (this.findOneFlower() != null);
            this.btnSpeedUpOneKey.visible = this.list.length > 0 && (this.findOneFlower() != null);
            this.boxPlantInfo.visible = this.list.array.length < 1;
            this.showPlantInfo(info.flowerId, xls.get(xls.flowerPlant).get(info.flowerId).outputItem,info.exp);
        }
        private showPlantInfo(seedID: number, flowerID: number,exp:number) {
            this.mcSeed.ico.skin = clientCore.ItemsInfo.getItemIconUrl(seedID);
            this.mcSeed.txtName.text = clientCore.ItemsInfo.getItemName(seedID);
            this.mcSeed.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(seedID);
            this.mcSeed.num.value = "1";
            this.mcSeed.num.scale(1.5,1.5);
            // mc.mcReward.txtName.visible = true;
            this.mcFlower.ico.skin = clientCore.ItemsInfo.getItemIconUrl(flowerID);
            this.mcFlower.txtName.text = clientCore.ItemsInfo.getItemName(flowerID);
            this.mcFlower.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(flowerID);
            let maxCnt: number = clientCore.FlowerGrowConf.getFlowerMax(seedID, exp);
            let minNum = Math.floor(maxCnt * 0.9);
            if(maxCnt == minNum){
                this.mcFlower.num.value = "1";
            }
            else{
                this.mcFlower.num.value = ""+minNum +"~"+maxCnt;
            }
            this.mcFlower.num.scale(1.5,1.5);
        }
        private findAllFlowerByID(id: number) {
            let tmpArr = [];
            let arr = clientCore.MapItemsInfoManager.instance.getAllFlowerInMap();
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].id == id) {
                    tmpArr.push(arr[i]);
                }
            }
            tmpArr.sort(this.compare);
            return tmpArr;
        }
        private compare(info1: clientCore.MapItemInfo, info2: clientCore.MapItemInfo) {
            let restTime1 = info1.getFlowerGrowTimeInfo().restTime;
            let restTime2 = info2.getFlowerGrowTimeInfo().restTime;
            if (restTime1 < restTime2) {
                return -1;
            }
            else if (restTime1 > restTime2) {
                return 1;
            }
            else {
                return 0;
            }
        }
        private addEvents(): void {
            BC.addEvent(this, this.btnSpeedUp, Laya.Event.CLICK, this, this.onSpeedUp);
            BC.addEvent(this,this.btnSpeedUpOneKey,Laya.Event.CLICK,this,this.onSpeedUpOneKey);

            BC.addEvent(this,this.mcFlower,Laya.Event.MOUSE_DOWN,this,this.showTips,[2]);

            BC.addEvent(this,this.btnIncreaseLimit,Laya.Event.CLICK,this,this.showIncreaseLimit)
        }
        private showIncreaseLimit(){
            if(!this._increaseLimitPanel){
                this._increaseLimitPanel = new IncreaseLimitPanel();
            }
            this._increaseLimitPanel.show();
        }
        private showTips(index:number){
            let id = 0;
            if(index == 1){
                id = this._info.flowerId;
                clientCore.ToolTip.showTips(this.mcSeed, { id: id });
            }
            else if(index == 2){
                id = xls.get(xls.flowerPlant).get(this._info.flowerId).outputItem;
                clientCore.ToolTip.showTips(this.mcFlower, { id: id });
            }

        }
        private _speedUpInfo:{speedUpNum:number,needDustNum:number};
        private onSpeedUpOneKey(){
            this._speedUpInfo = this.getCanSpeedUpNum();
            if (this._speedUpInfo.speedUpNum < 0) {
                alert.showFWords("当前没有可加速的花朵！");
                this.btnSpeedUp.visible = false;
                this.btnSpeedUpOneKey.visible = false;
                return;
            }
            alert.showSmall(`是否消耗${this._speedUpInfo.needDustNum}星之粉进行一键加速？`, { callBack: { caller: this, funArr: [this.speedUpOneKey] } });
        }
        private speedUpOneKey(){
            let useNum = this._speedUpInfo.needDustNum;
            let has: number = clientCore.ItemsInfo.getItemNum(1550001);
            if (has < useNum && !clientCore.GuideMainManager.instance.isGuideAction) {
                if(!clientCore.LittleRechargManager.instacne.checkCanShow(1) || clientCore.LocalInfo.userLv < 8){
                    alert.alertQuickBuy(1550001, useNum - has, true);
                }
                else{
                    clientCore.LittleRechargManager.instacne.activeWindowById(1);
                }
                return;
            }
            net.sendAndWait(new pb.cs_one_click_accelerate_products({id:this._info.flowerId})).then((data:pb.sc_one_click_accelerate_products)=>{
                let buildHashMap:util.HashMap<pb.IBuild> = new util.HashMap();
                for(let build of data.builds){
                    buildHashMap.add(build.getTime,build);
                }
                let flowerInfoArr = clientCore.MapItemsInfoManager.instance.getAllMapItems();
                for(let flower of flowerInfoArr){
                    if(buildHashMap.has(flower.getTime)){
                        flower.mapItemInfo.refreshItemInfo(buildHashMap.get(flower.getTime));
                        flower.getOrProduceOneProduct();
                    }
                }
                this.btnSpeedUp.visible = false;
                this.btnSpeedUpOneKey.visible = false;
                EventManager.event(ProduceConstant.SHEEP_UP); //通知主页面
                // EventManager.event(globalEvent.PRODUCE_SPEED_UP_SUCC, this._curSpeedUpInfo.getTime);
                let bone = clientCore.BoneMgr.ins.play("res/animate/product/clock.sk",0,false,clientCore.LayerManager.upMainLayer);
                bone.pos(Laya.stage.width/2,Laya.stage.height/2);
            })
        }
        private getCanSpeedUpNum(){
            let count = 0;
            let needNum = 0;
            let reducePerStar = xls.get(xls.globaltest).get(1).starDust;
            for (let i = 0; i < this.list.array.length; i++) {
                let info = this.list.array[i] as clientCore.MapItemInfo;
                if (info.flowerBeginTime > 0 && info.flowerCurStage < clientCore.MapItemInfo.FLOWER_MAX_STAGE) {
                    count++;
                    let restTime = info.getFlowerGrowTimeInfo().restTime;
                    needNum += Math.ceil(restTime / reducePerStar);
                }
            }
            return {speedUpNum:count,needDustNum:needNum};
        }
        private onSpeedUp(): void {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickProduceSpeedUpBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            this._curSpeedUpInfo = this.findOneFlower();
            if (!this._curSpeedUpInfo) {
                alert.showFWords("当前没有可加速的花朵！");
                this.btnSpeedUp.visible = false;
                this.btnSpeedUpOneKey.visible = false;
                return;
            }
            let useNum = this.getUseNum();
            alert.showSmall(`是否消耗${useNum}星之粉进行加速？`, { callBack: { caller: this, funArr: [this.sureSpeedUp] } });
        }
        private getUseNum() {
            let reducePerStar = xls.get(xls.globaltest).get(1).starDust;
            let restTime = this._curSpeedUpInfo.getFlowerGrowTimeInfo().restTime
            return Math.ceil(restTime / reducePerStar);
        }
        private findOneFlower() {
            for (let i = 0; i < this.list.array.length; i++) {
                let info = this.list.array[i] as clientCore.MapItemInfo;
                if (info.flowerBeginTime > 0 && info.flowerCurStage < clientCore.MapItemInfo.FLOWER_MAX_STAGE) {
                    return this.list.array[i];
                }
            }
            return null;
        }
        private sureSpeedUp() {
            let useNum = this.getUseNum();
            let has: number = clientCore.ItemsInfo.getItemNum(1550001);
            if (has < useNum && !clientCore.GuideMainManager.instance.isGuideAction) {
                if(!clientCore.LittleRechargManager.instacne.checkCanShow(1) || clientCore.LocalInfo.userLv < 8){
                    alert.alertQuickBuy(1550001, useNum - has, true);
                }
                else{
                    clientCore.LittleRechargManager.instacne.activeWindowById(1);
                }
                return;
            }
            net.sendAndWait(new pb.cs_some_product_quick_finish({ getTime: this._curSpeedUpInfo.getTime })).then((msg: pb.sc_some_product_quick_finish) => {
                this._curSpeedUpInfo.refreshItemInfo(msg.build);
                alert.showFWords("加速成功，快去收获产出吧！");
                this.btnSpeedUp.visible = false;
                this.btnSpeedUpOneKey.visible = false;
                EventManager.event(ProduceConstant.SHEEP_UP); //通知主页面
                EventManager.event(globalEvent.PRODUCE_SPEED_UP_SUCC, this._curSpeedUpInfo.getTime);
            });
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickAlertShowSmallSureBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private removeEvents(): void {
            BC.removeEvent(this);
        }

        updateFrame(): void {
            this.list.refresh();
        }
        dispose(): void {
            this._info = null;
            this.list.array = null;
            this.removeEvents();
            this.removeSelf();
        }
    }
}