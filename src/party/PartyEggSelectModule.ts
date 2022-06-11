namespace party {
    /**
     * 扭蛋奖池选择
     * party.PartyEggSelectModule
     */
    export class PartyEggSelectModule extends ui.party.PartyEggSelectModuleUI {
        private _poolIDArr:number[];
        constructor() {
            super();
        }
        init() {
            this.addPreLoad(xls.load(xls.giftSell));
            this.btnClose.pos(60 - (Laya.stage.width - Laya.stage.designWidth) / 2, 40, true);
            this.hitArea = new Laya.Rectangle(-clientCore.LayerManager.mainLayer.x, 0, Laya.stage.width, Laya.stage.height);
        }
        popupOver(){
            if(clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitPartEggSelectOpen"){
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }
        onPreloadOver(){
            this.initPrizePool();
            this.listAD.renderHandler = new Laya.Handler(this,this.showAD,null,false);
            this.listAD.mouseHandler = new Laya.Handler(this,this.selectAD,null,false);
            this.listAD.hScrollBarSkin = "";
            this.listAD.array = this._poolIDArr;
            this.listAD.scrollBar.touchScrollEnable = false;

            let page = Math.ceil(this._poolIDArr.length/2);
            this.listPage.renderHandler = new Laya.Handler(this,this.showPage,null,false);
            this.listPage.array = new Array(page);
            this.listPage.repeatX = page;

        }
        showPage(cell:Laya.Image,index:number){
            let curIndex = this.listAD.startIndex;

            let pageIndex = Math.floor(curIndex/2);
            if(curIndex % 2 > 0){
                pageIndex++;
            }
            cell.skin = pageIndex == index?"party/本页.png":"party/未到此页.png";
        }
        showAD(cell:ui.party.render.ADRenderUI,index:number){
            cell.img.skin = `res/party/partyEgg/ad/${this._poolIDArr[index]}.png`;
        }
        selectAD(e:Laya.Event,index:number){
            if(e.type == Laya.Event.CLICK){
                if(clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSelectEggPool"){
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
                let poolID = this._poolIDArr[index];
                this.needOpenMod = "party.PartyEggModule";
                this.needOpenData = poolID;
                this.destroy();
            }
        }
        initPrizePool(){
            let allPoolArr = _.filter(xls.get(xls.giftSell).getValues(),function(o){return o.id > 100 && o.id < 200});
            this._poolIDArr = _.map(allPoolArr,function(o){return o.id});
            // this._poolIDArr = _.uniq(poolIDArr);
            // console.log("所有奖池的ID："+this._poolIDArr);
        }
        addEventListeners(){
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnPre,Laya.Event.CLICK,this,this.onPageClick,[2]);
            BC.addEvent(this,this.btnNext,Laya.Event.CLICK,this,this.onPageClick,[-2]);

            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo)
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "partyEggSelectModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "cell_0") {
                    var obj: any;
                    obj = this.listAD.getCell(0);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, null);
                }
            }
        }
        onPageClick(num:number){
            let curIndex = this.listAD.startIndex;
            curIndex += num;
            if(curIndex < 0){
                curIndex = 0;
            }
            if(curIndex > this._poolIDArr.length-2){
                curIndex = this._poolIDArr.length-2;
            }
            if(curIndex != this.listAD.startIndex){
                this.listAD.tweenTo(curIndex,200*Math.abs(this.listAD.startIndex - curIndex),new Laya.Handler(this,()=>{
                    this.listPage.refresh();
                }));
            }
        }   
        destroy(){
            BC.removeEvent(this);
            super.destroy();
        }
    }
}