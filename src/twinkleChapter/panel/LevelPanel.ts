namespace twinkleChapter{

    export class LevelPanel extends ui.twinkleChapter.panel.LevelPanelUI{
        private _cfg: xls.shineTripStage;
        private _noData: boolean;
        constructor(){
            super();
            this.list.renderHandler = new Laya.Handler(this,this.listRender,null,false);
        }
        show(cfg: xls.shineTripStage,noData: boolean): void{
            this._noData = noData;
            this._cfg = cfg;
            this.titleTxt.changeText(cfg.title);
            this.costTxt.changeText(cfg.energy + '');
            this.descTxt.text = cfg.desc;
            this.list.array = cfg.reward;
            clientCore.UIManager.setMoneyIds([9900120,9900119]);
            clientCore.UIManager.showCoinBox();
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            clientCore.UIManager.refreshMoney();
            this._cfg = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnAccpt,Laya.Event.CLICK,this,this.onAccpt);
            BC.addEvent(this,this.btnCancel,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        private listRender(item: Laya.Box,index: number): void{
            let data: xls.pair = this.list.array[index];
            (item.getChildByName('icon') as Laya.Image).skin = clientCore.ItemsInfo.getItemIconUrl(data.v1);
        }
        private onAccpt(): void{
            let cfg: xls.shineTripStage = this._cfg;
            if(clientCore.ItemsInfo.getItemNum(9900120) < cfg.energy){
                net.send(new pb.cs_shine_change_get_energy());
                alert.showFWords('体力恢复中，请稍后再试~');
                return;
            }
            net.sendAndWait(new pb.cs_shine_change_start_level({customsId: cfg.id, chapterId: cfg.requireCharpter})).then(()=>{
                this.hide();
                clientCore.ModuleManager.closeModuleByName('twinkleChapter');
                clientCore.ModuleManager.open('clothChange.ClothChangeModule',{cfg: cfg,noData: this._noData});
            });
        }
    }
}