namespace mentorApply {
    export class ApplyInfoPanel extends ui.mentorApply.ApplyInfoPanelUI {
        /**  1拜师  2收徒 */
        private _petNameArr:string[] = ["奇妙花宝及以上","闪亮花宝及以上","闪耀花宝"];
        constructor(){
            super();
            this.listInfo.vScrollBarSkin = null;
            this.listInfo.renderHandler = new Laya.Handler(this,this.showInfo,null,false);
            this.listInfo.mouseHandler = new Laya.Handler(this,this.selectInfo);
        }
        showInfo(cell:ui.mentorApply.ApplyInfoItemUI,index:number){
            cell.txtInfo.text = cell.dataSource.recruitDesc;
            cell.visible = this.satisfyCondition(cell.dataSource);
            cell.imgBg.disabled = !this.satisfyCondition(cell.dataSource);
            cell.txtInfo.disabled= !this.satisfyCondition(cell.dataSource);
        }
        selectInfo(e:Laya.Event,index:number){
            if(e.type == Laya.Event.CLICK){
                let info:xls.tutorRecruit = this.listInfo.array[index];
                if(info.require > 0 && info.require < 4){
                    if(clientCore.FlowerPetInfo.petType < info.require){
                        alert.showFWords(`${this._petNameArr[info.require-1]}用户才能使用！`);
                        return;
                    }
                }
                else if(info.require ==4 ){
                    if(clientCore.LocalInfo.vipLv < 1){
                        alert.showFWords(`VIP1级以上用户才能使用！`);
                        return ;
                    }
                }
                else if(info.require == 5){
                    if(clientCore.LocalInfo.vipLv < 5){
                        alert.showFWords(`VIP5级以上用户才能使用！`);
                        return ;
                    }
                }
                let id = this.listInfo.array[index].recruitId;
                this.event("DIALOG_SELECT",id);
            }
        }
        show(type:number){
            this.imgTitle_1.visible = type == 1;
            this.imgInfo_1.visible = type == 1;
            this.imgTitle_2.visible = type == 2;
            this.imgInfo_2.visible = type == 2;
            this.initInfo(type);
            clientCore.DialogMgr.ins.open(this);
        }
        initInfo(type:number){
            let arr:xls.tutorRecruit[] = [];
            let allInfo = xls.get(xls.tutorRecruit).getValues();
            
            for(let info of allInfo){
                // if(this.satisfyCondition(info))
                // {
                    if(type == 1){/**拜师 */
                        if(info.recruitId > 2000){
                            arr.push(info);
                        }
                    }
                    else if(type == 2){/**收徒 */
                        if(info.recruitId < 2000){
                            arr.push(info);
                        }
                    }
                // }
            }
            arr = _.sortBy(arr,function(o){
                if(o.require > 0 && o.require <= 3){
                    if(clientCore.FlowerPetInfo.petType >= o.require)
                    {
                        return -1;
                    }
                    else{
                        return 1;
                    }
                }
                else if(o.require > 3){
                    if(o.require == 4){
                        if(clientCore.LocalInfo.vipLv >= 1){
                            return -1;
                        }
                        else {
                            return 1;
                        }
                    }
                    else if(o.require == 5){
                       if(clientCore.LocalInfo.vipLv >= 5){
                           return -1;
                       }
                       else{
                           return 1;
                       }
                    }
                }
                return 0;
            });
            this.listInfo.array = arr;
        }
        satisfyCondition(info:xls.tutorRecruit){
            if(info.require == 0){
                return true;
            }
            if(info.require > 0 && info.require <= 3){
                return clientCore.FlowerPetInfo.petType >= info.require;
            }
            else if(info.require > 3){
                if(info.require == 4){
                    return clientCore.LocalInfo.vipLv >= 1;
                }
                else if(info.require == 5){
                    return clientCore.LocalInfo.vipLv >= 5;
                }
            }
        }
        private onScroll() {
            let scroll = this.listInfo.scrollBar;
            this.imgBar.y =(this.imgBarbg.height - this.imgBar.height) * scroll.value / scroll.max;
        }
        addEventListeners(){
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.closeClick);
            BC.addEvent(this, this.listInfo.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }
        closeClick(e:Laya.Event){
            clientCore.DialogMgr.ins.close(this);
        }
        destroy(){
            BC.removeEvent(this);
            super.destroy();

        }
    }
}