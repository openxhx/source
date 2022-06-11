namespace party {
    /**
     * 派对摆放方案面板
     * party.SavePanel
     */
    export class PartyDecoDetailPanel extends ui.party.PartyFurnitureDetailModuleUI {
        constructor(){
            super();
        }
        init(data:any){
            this._data = data;
            let id = parseInt(this._data);
            let itemXlsInfo = xls.get(xls.partyHouse).get(id);
            this.txtName.text = itemXlsInfo.furnitureName;
            this.txtNum.text = ""+clientCore.PartyItemManager.getTotalItemNum(id);
            this.txtOccupy.text = "x"+itemXlsInfo.blockPosArr.length;
            this.imgItem.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            this.txtIntro.text = itemXlsInfo.furnitureDes;
            this.listHeart.repeatX = itemXlsInfo.quality;
        }
        addEventListeners(){
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnGet,Laya.Event.CLICK,this,this.onGetClick);
        }
        onGetClick(){
            this.needOpenMod = "party.PartyEggSelectModule";
            this.destroy();
        }
        destroy(){
            BC.removeEvent(this);
            super.destroy();
        }
    }
}