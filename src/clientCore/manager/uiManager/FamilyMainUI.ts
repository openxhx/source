/// <reference path="MainUIBase.ts" />
namespace clientCore {
    export class FamilyMainUI extends MainUIBase {
        private _mainUI:ui.main.family.FamilyMainUIUI;
        constructor() {
            super();
        }
        public setUp() {
            if (!this._mainUI) {
                this._mainUI = new ui.main.family.FamilyMainUIUI();
                this._mainUI.mouseThrough = true;
                this._mainUI.mcRightView.mouseThrough = true;
                this._mainUI.mcLeftView.mouseThrough = true;
                this._mainUI.drawCallOptimize = this._mainUI.drawCallOptimize = true;
                this._mainUI.htmlLine.style.fontSize = 20;
                this._mainUI.htmlLine.style.width = 70;
                this._mainUI.htmlLine.style.align = "center";
            }
            this.updateOnlineText();
            this.showOnlineInfo();
            this.updateBadge();
        }
        private updateOnlineText() {
            this._mainUI.htmlLine.innerHTML = util.StringUtils.getColorText2([FamilyMgr.ins.svrMsg.onlineCnt + "", "#fffc00", "/" + FamilyMgr.ins.svrMsg.member, "#FFFFFF"]);
        }

        private showOnlineInfo() {
            this._mainUI.txtLiveness.changeText(FamilyMgr.ins.svrMsg.liveness + "");
            this._mainUI.txtName.changeText(FamilyMgr.ins.svrMsg.fmlName);
            this._mainUI.txtLv.changeText("" + FamilyMgr.ins.getFamilyLevel());
        }

        /** 更新族徽*/
        private updateBadge(): void {
            if(FamilyMgr.ins.checkInFamily()){
                this._mainUI.imgBadge.skin = pathConfig.getFamilyBadgeUrl(FamilyMgr.ins.svrMsg.badgeType);
                this._mainUI.imgBoard.skin = pathConfig.getFamilyBadgeUrl(FamilyMgr.ins.svrMsg.badgeBase);
                this.showOnlineInfo();
                this.updateOnlineText();
            }
        }
        private addEvent() {
            BC.addEvent(this, this._mainUI.btnBack, Laya.Event.CLICK, this, this.back);
            BC.addEvent(this, this._mainUI.btnInfo, Laya.Event.CLICK, this, this.openFamilyInfo, [1]);
            BC.addEvent(this, this._mainUI.btnDonate, Laya.Event.CLICK, this, this.openFamilyInfo, [2]);
            BC.addEvent(this, this._mainUI.btnOrder, Laya.Event.CLICK, this, this.openOrder);
            BC.addEvent(this, this._mainUI.btnEdit, Laya.Event.CLICK, this, this.startEdit);
            BC.addEvent(this, this._mainUI.btnActivity, Laya.Event.CLICK, this, this.openActivity);
            BC.addEvent(this, this._mainUI.btnShop, Laya.Event.CLICK, this, this.openShop);
            BC.addEvent(this, this._mainUI.btnTailor, Laya.Event.CLICK, this, this.openTailor);
            BC.addEvent(this, this._mainUI.btnCloth, Laya.Event.CLICK, this, this.openCloth);
            BC.addEvent(this, EventManager, globalEvent.UPDATE_FAMILY_BUILD, this, this.updateFamilyLv);
            BC.addEvent(this, EventManager, globalEvent.STAGE_RESIZE, this, this.onResizeView);
            net.listen(pb.sc_family_member_notify, this, this.synMember);
            BC.addEvent(this,EventManager,globalEvent.FAMILY_BADGE_CHANGE,this,this.updateBadge);
            BC.addEvent(this,EventManager,globalEvent.ENTER_MAP_SUCC,this,this.changeBtnsInfo);
        }
        private openCloth(){
            clientCore.ModuleManager.open('clothChange.ClothChangeModule');
        }
        private removeEvent(): void {
            BC.removeEvent(this);
            net.unListen(pb.sc_family_member_notify, this, this.synMember);
        }

        private updateFamilyLv(): void {
            this._mainUI.txtLv.changeText("" + FamilyMgr.ins.getFamilyLevel());
        }

        private openActivity(e: Laya.Event) {
            ModuleManager.open("familyActivity.FamilyActivityInfoModule");
        }
        /** 成员变化通知*/
        private synMember(msg: pb.sc_family_member_notify): void {

        }
        private startEdit(e: Laya.Event) {
            if (!FamilyMgr.ins.checkLimit(FamilyMgr.ins.svrMsg.post, "arrangement")) {
                alert.showFWords("当前权限不能进行家族布置~");
                return;
            }
            net.sendAndWait(new pb.cs_family_build_opt_status({ opt: 0, fmlId: clientCore.FamilyMgr.ins.familyId })).then((data: pb.sc_family_build_opt_status) => {
                if (data.status == 0) {
                    clientCore.MapEditorManager.getInstance().showUI(2, 'ui');
                }
                else if (data.status == 1) {
                    alert.showFWords("当前权限不能进行家族布置~");
                }
                else if (data.status == 2) {
                    alert.showFWords("当前有玩家正在布置，请稍后再试！");
                }
            });
        }
        /** 打开家族信息*/
        private openFamilyInfo(type: number): void {
            ModuleManager.open("family.FamilyModule", { panel: "info", type: type });
        }

        /** 打开订单 */
        private openOrder() {
            ModuleManager.open("family.FamilyModule", { panel: "order" });
        }

        /** 打开裁缝小铺*/
        private openTailor(): void {
            let lv: number = clientCore.FamilyMgr.ins.getBuildLevel(499998);
            // if (lv == 0) {
            //     alert.showFWords("裁缝小屋达到1级后开始营业");
            //     return;
            // }
            ModuleManager.open("familyTailor.FamilyTailorModule", { type: 0, lv: lv });
        }

        /** 打开神秘商场*/
        private openShop(): void {
            // let lv: number = clientCore.FamilyMgr.ins.getBuildLevel(499997);
            // if (lv == 0) {
            //     alert.showFWords("神秘商店达到1级后开始营业");
            //     return;
            // }
            clientCore.ModuleManager.open("commonShop.CommonShopModule", 4);
        }

        back() {
            //回到家园
            clientCore.MapManager.enterHome(clientCore.LocalInfo.uid);
        }

        private changeBtnsInfo(){
            this._mainUI.btnTailor.visible = MapInfo.mapID == 2;
            this._mainUI.btnShop.visible = MapInfo.mapID == 2;
            this._mainUI.btnEdit.visible = MapInfo.mapID == 2;
            this._mainUI.btnDonate.visible = MapInfo.mapID == 2;
            this._mainUI.btnOrder.visible = MapInfo.mapID == 2;
            this._mainUI.btnActivity.visible = MapInfo.mapID == 2;
            this._mainUI.btnBack.visible = MapInfo.mapID == 2;
            this._mainUI.btnCloth.y = MapInfo.mapID == 2?228:562;

        }
        private onResizeView(): void{
            this._mainUI.mcRightView.x = Laya.stage.width;
        }
        public open() {
            // this.initBtnsInfo();
            this._mainUI.mcLeftView.x = 0;
            this.onResizeView();
            this.addEvent();
            UIManager.showTalk();
            LayerManager.uiLayer.addChild(this._mainUI);
        }
        public close() {
            this.removeEvent();
            this._mainUI.removeSelf();
        }
        public hide(){
            Laya.Tween.to(this._mainUI,{alpha:0},200);
            this._mainUI.mouseEnabled = false;
        }
        public show(){
            Laya.Tween.clearAll(this._mainUI);
            Laya.Tween.to(this._mainUI,{alpha:1},200);
            this._mainUI.mouseEnabled = true;
        }
        public isHide() {
            return !this._mainUI.parent;
        }
    }
}