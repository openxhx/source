namespace party {
    /**
     * 派对摆放方案面板
     * party.SavePanel
     */
    export class SavePanel extends ui.party.panel.SchemeSavePanelUI {
        private _curDecoInfoArr: pb.ImapItem[];
        private _lockInfo:pb.IOrnamentScheme;
        constructor() {
            super();
        }
        init() {
            this.parseMapDeco();
            this.txtSaveNum.text = "" + clientCore.PartySchemeManager.getSaveSchemeNum() + "/"+clientCore.PartySchemeManager.getAllUnlockNum();
            this.txtDecoNum.text = "" + this._curDecoInfoArr.length;
            this.addPreLoad(xls.load(xls.partyHouseSave));
            
        }
        onPreloadOver(){
            this.findLockInfo();
        }
        private findLockInfo(){
            let arr = clientCore.PartySchemeManager.partyDecoSchemeArr;
            let haveLockPos:boolean = false;
            for(let i = 0;i<arr.length;i++){
                if(arr[i].unlock == 0){
                    let xlsInfo = xls.get(xls.partyHouseSave).get(arr[i].posId);
                    this.imgItem.skin = clientCore.ItemsInfo.getItemIconUrl(xlsInfo.cost.v1);
                    this.fontClipPrice.value = ""+xlsInfo.cost.v2;
                    haveLockPos = true;
                    this._lockInfo = arr[i];
                    break;
                }
            }
            if(!haveLockPos){
                this.btnExpand.visible = false;
            }
        }
        addEventListeners(){
            BC.addEvent(this,this.btnSave,Laya.Event.CLICK,this,this.onSaveClick);
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnExpand,Laya.Event.CLICK,this,this.onExpandClick)
        }
        onExpandClick(e:Laya.Event){
            let xlsInfo = xls.get(xls.partyHouseSave).get(this._lockInfo.posId);
            alert.showSmall(`是否消耗${xlsInfo.cost.v2}个${clientCore.ItemsInfo.getItemName(xlsInfo.cost.v1)}解锁当前位置？`,{
                callBack: {caller:this,funArr:[()=>{
                    net.sendAndWait(new pb.cs_add_party_house_pos({posId:this._lockInfo.posId})).then(()=>{
                        this._lockInfo.unlock = 1;
                        alert.showFWords("位置解锁成功！");
                        this.findLockInfo();
                    });
                }]},
                btnType: alert.Btn_Type.SURE_AND_CANCLE,
                needMask: true,
                clickMaskClose: true,
                needClose: true,
            })
        }
        async onSaveClick(e:Laya.Event){
            let posID = clientCore.PartySchemeManager.findOneEmptyPos();
            if(posID <= 0){
                alert.showSmall("没有空槽了，可以扩建新的槽位或者删除之前的保存方案");
            }
            else if(this.txtNameInput.text == ""){
                alert.showSmall("请输入保存方案的名称");
            }
            else{
                await clientCore.PartySchemeManager.saveOneDecoScheme(posID,this.txtNameInput.text,this._curDecoInfoArr);
                alert.showFWords("保存成功！");
                this.destroy();
            }
        }
        parseMapDeco() {
            this._curDecoInfoArr = [];
            let partyItemArr = clientCore.PartyItemManager.partyMapItemArr;
            for (let item of partyItemArr) {
                let optInfo = this.createOptInfo(item.itemInfo);
                this._curDecoInfoArr.push(optInfo);
            }
            this._curDecoInfoArr.push(this.addSpecialChangeInfo(clientCore.PartyItemManager.curWallID));
            this._curDecoInfoArr.push(this.addSpecialChangeInfo(clientCore.PartyItemManager.curGroundID));
            this._curDecoInfoArr.push(this.addSpecialChangeInfo(clientCore.PartyItemManager.curDoorID));


        }
        private createOptInfo(mapItemInfo: clientCore.PartyItemInfo): pb.mapItem {
            let changeInfo = new pb.mapItem();
            changeInfo.buildId = mapItemInfo.ID;
            changeInfo.getTime = 0;
            changeInfo.pos = { x: mapItemInfo.row, y: mapItemInfo.col };
            changeInfo.isReverse = mapItemInfo.isReverse ? 1 : 0;
            changeInfo.opt = 0;//0是添加
            return changeInfo;
        }
        private addSpecialChangeInfo(id: number): pb.mapItem {
            let changeInfo = new pb.mapItem();
            changeInfo.buildId = id;
            changeInfo.getTime = 0;
            changeInfo.pos = { x: 0, y: 0 };
            changeInfo.isReverse = 0;
            changeInfo.opt = 0;//0是添加
            return changeInfo;
        }
    }
}