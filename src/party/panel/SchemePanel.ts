namespace party {
    /**
     * 派对摆放方案面板
     * party.SchemePanel
     */
    export class SchemePanel extends ui.party.panel.SchemePanelUI {
        private _saveSchemeArr: pb.IOrnamentScheme[];
        constructor() {
            super();
        }
        init() {
            this.txtSaveNum.text = "" + clientCore.PartySchemeManager.getSaveSchemeNum() + "/"+clientCore.PartySchemeManager.getAllUnlockNum();
            this.listScheme.renderHandler = new Laya.Handler(this, this.renderScheme);
            this.listScheme.mouseHandler = new Laya.Handler(this, this.selectScheme);
            this.listScheme.height = 325;
            this.listScheme.vScrollBarSkin = "";
            this.addPreLoad(xls.load(xls.partyHouseSave));

        }
        onPreloadOver() {
            // this._xlsInfoArr = xls.get(xls.partyHouseSave).getValues();
            let saveSchemeArr = clientCore.PartySchemeManager.partyDecoSchemeArr.slice();
            this._saveSchemeArr = saveSchemeArr.sort(this.compare);

            this.listScheme.array =  this._saveSchemeArr;
        }
        compare(a: pb.IOrnamentScheme, b: pb.IOrnamentScheme): number {
            if (a.counts > 0 && b.counts == 0) {
                return -1;
            }
            else if (a.counts == 0 && b.counts > 0) {
                return 1;
            }
            else if(a.counts == b.counts){
                return b.unlock - a.unlock;
            }
            return 0;
        }
        renderScheme(cell: ui.party.render.SchemeRenderUI, index: number) {
            let posInfo = this._saveSchemeArr[index];
            if (posInfo.unlock == 1) {/** 已解锁 */
                cell.boxNormal.visible = true;
                cell.boxLock.visible = false;
                let saveInfo = this._saveSchemeArr[index];
                if (saveInfo.counts <= 0) {
                    cell.btnUse.visible = false;
                    cell.txtName.visible = false;
                    cell.imgBg.visible = false;
                    cell.btnDelete.visible = false;
                }
                else {
                    cell.btnUse.visible = true;
                    cell.txtName.visible = true;
                    cell.imgBg.visible = true;
                    cell.btnDelete.visible = true;

                    cell.txtName.text = saveInfo.name;
                }
            }
            else {
                let xlsInfo = xls.get(xls.partyHouseSave).get(posInfo.posId);
                cell.boxNormal.visible = false;
                cell.boxLock.visible = true;
                cell.imgItem.skin = clientCore.ItemsInfo.getItemIconUrl(xlsInfo.cost.v1);
                cell.fontNum.value = ""+xlsInfo.cost.v2;
            }
        }
        selectScheme(e: Laya.Event, index: number) {
            let info:pb.IOrnamentScheme = this.listScheme.array[index];
            if (e.type == Laya.Event.CLICK) {
                if (e.target.name == "btnUse") {
                    alert.showSmall(`确定要使用${info.name}方案吗？现在小屋内的家具搭配都不会被保存的哦~`,{
                        callBack: {caller:this,funArr:[()=>{
                            net.sendAndWait(new pb.cs_use_party_house_scheme({ posId: info.posId })).then((data: pb.sc_use_party_house_scheme) => {
                                clientCore.PartyItemManager.changeScheme(data.buildsInMap);
                                alert.showFWords("方案替换成功！");
                            });
                        }]},
                        btnType: alert.Btn_Type.SURE_AND_CANCLE,
                        needMask: true,
                        clickMaskClose: true,
                        needClose: true,
                    })
                   
                }
                else if (e.target.name == "btnDelete") {
                    alert.showSmall(`是否确定删除${info.name}方案吗？`,{
                        callBack: {caller:this,funArr:[()=>{
                            clientCore.PartySchemeManager.deleteOneScheme(info.posId).then(() => {
                                this.listScheme.startIndex = this.listScheme.startIndex;
                                alert.showFWords("方案删除成功！");
                            });
                        }]},
                        btnType: alert.Btn_Type.SURE_AND_CANCLE,
                        needMask: true,
                        clickMaskClose: true,
                        needClose: true,
                    })
                   
                }
                else if(e.currentTarget['boxLock'].visible == true){
                    let xlsInfo = xls.get(xls.partyHouseSave).get(info.posId);
                    alert.showSmall(`是否消耗${xlsInfo.cost.v2}个${clientCore.ItemsInfo.getItemName(xlsInfo.cost.v1)}解锁当前位置？`,{
                        callBack: {caller:this,funArr:[()=>{
                            net.sendAndWait(new pb.cs_add_party_house_pos({posId:info.posId})).then(()=>{
                                info.unlock = 1;
                                this.listScheme.startIndex = this.listScheme.startIndex;
                                alert.showFWords("位置解锁成功！");
                            });
                        }]},
                        btnType: alert.Btn_Type.SURE_AND_CANCLE,
                        needMask: true,
                        clickMaskClose: true,
                        needClose: true,
                    })
                }
            }
        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }
        destroy() {
            super.destroy();
        }
    }
}