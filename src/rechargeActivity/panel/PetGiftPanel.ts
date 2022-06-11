namespace rechargeActivity {
    /**
     * 闪耀花宝
     */
    export class PetGiftPanel extends BasePanel {
        private _privilegeIconInfoArr:{id:number,isNew:boolean,isHot:boolean}[] = [
            {id:1,isNew:false,isHot:false},
            {id:2,isNew:false,isHot:false},
            {id:3,isNew:false,isHot:false},
            {id:4,isNew:false,isHot:false},
            {id:5,isNew:false,isHot:false},
            {id:6,isNew:false,isHot:false}
        ];
        constructor() { super(); }

        async init(data: xls.rechargeActivity[], info: pb.sc_get_activity_gift_bag_info): Promise<void> {
            await res.load("unpack/rechargeActivity/vip_man.png");
            await res.load("unpack/rechargeActivity/vip_woman.png");
            await res.load("unpack/rechargeActivity/vipNormal.png");
            await res.load("unpack/rechargeActivity/bgPetGift.png");
            await res.load("atlas/vipPrivilegeIcon.atlas");
            if (!this._mainUI) {
                this._mainUI = new ui.rechargeActivity.panel.PetGiftPanelUI();
                let isWoman: boolean = clientCore.LocalInfo.sex == 1;
                this._mainUI["imgFemale"].visible = isWoman;
                this._mainUI["imgMale"].visible = !isWoman;
                this._mainUI['boxVip'].visible = clientCore.FlowerPetInfo.petType >= 1;
                this._mainUI['boxNormal'].visible = clientCore.FlowerPetInfo.petType < 1;
                this.addChild(this._mainUI);
                this.addEventListenters();

                let list:Laya.List = this._mainUI["listPrivilegeIcon"];
                list.renderHandler = new Laya.Handler(this,this.showPrivilegeIcon);
                list.width = 670;
                list.hScrollBarSkin = "";
                list.array = this._privilegeIconInfoArr;
            }
        }
        showPrivilegeIcon(cell:ui.rechargeActivity.render.vipPrivilegeRenderUI,index:number){
            cell.imgHot.visible = this._privilegeIconInfoArr[index].isHot;
            cell.imgNew.visible = this._privilegeIconInfoArr[index].isNew;
            cell.imgPrivilege.skin = `vipPrivilegeIcon/${this._privilegeIconInfoArr[index].id}.png`;
        }

        refreshTime() {

        }

        addEventListenters(): void {
            BC.addEvent(this, this._mainUI["btnGo"], Laya.Event.CLICK, this, this.onClick);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onClick(): void {
            clientCore.ModuleManager.closeModuleByName("rechargeActivity");
            clientCore.ModuleManager.open("flowerPet.FlowerPetModule", "show");
        }

    }
}