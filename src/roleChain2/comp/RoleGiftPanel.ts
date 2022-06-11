
namespace roleChain2 {
    export class RoleGiftPanel extends ui.roleChain2.comp.GiftPanelUI {
        private _currRoleInfo: clientCore.role.RoleInfo;
        private _heartBone: clientCore.Bone;
        private _frame: Laya.Image;
        constructor() {
            super();
            this.list.hScrollBarSkin = null;
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.selectHandler = new Laya.Handler(this, this.onListSelect);
            this.list.dataSource = clientCore.ItemBagManager.getItemsByEvent(11);
            EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.onItemChange);
        }
        show(id: number, isChange?: boolean) {
            this._frame = new Laya.Image('roleChain2/frameselect.png');
            this._frame.scale(0.75,0.75);
            this._currRoleInfo = clientCore.RoleManager.instance.getRoleById(id);
            let haveTask: boolean = clientCore.FavorTaskMgr.ins.checkHaveTask(id);
            this.boxTask.visible = haveTask;
            this.boxGift.visible = !haveTask;
            this.list.selectedIndex = 0;
            if (haveTask) {

            }
            else {
                if (isChange) {
                    //好感度增加特效
                    let bone: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/favor/hua.sk", 0, false, this.spFavor);
                    bone.on(Laya.Event.COMPLETE, this, this.updateFavor);
                    bone.pos(55, 41);
                } else {
                    this.updateFavor();
                }
            }
        }

        onEnable(): void {
            BC.addEvent(this, EventManager, globalEvent.FAVOR_UPDATE, this, this.updateGift);
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.onClick,[0]);
            BC.addEvent(this, this.btnDuce, Laya.Event.CLICK, this, this.onClick,[1]);
            BC.addEvent(this, this.btnGive, Laya.Event.CLICK, this, this.onUse);
            BC.addEvent(this, this.itCount, Laya.Event.BLUR, this, this.onBlur)
        }

        onDisable(): void{
            this.list.selectedIndex = -1;
            BC.removeEvent(this);
        }

        private onClick(type: number): void{
            let value: number = parseInt(this.itCount.text);
            type == 0 ? value++ : value--;
            this.changeGiftCount(value,true);
        }

        private updateFavor(): void {
            this.txtLv.value = this._currRoleInfo ? util.StringUtils.fillZero(this._currRoleInfo.faverLv, 2) : '00';
            this.txtExp.text = ' ' + this._currRoleInfo.faver + '/' + this._currRoleInfo.needFaver;
            if (!this._heartBone) {
                this._heartBone = clientCore.BoneMgr.ins.play("res/animate/favor/xin.sk", 0, true, this.spFavor);
                let sp: Laya.Sprite = new Laya.Sprite();
                sp.loadImage("roleChain2/heart3.png");
                this._heartBone.mask = sp;
            }
            let y: number = (1 - this._currRoleInfo.faverPercent) * 84
            this._heartBone.mask.y = -y;
            this._heartBone.pos(0, y);
        }

        private onItemChange() {
            this.list.dataSource = clientCore.ItemBagManager.getItemsByEvent(11);
            this.changeGiftCount(parseInt(this.itCount.text));
        }

        private onListRender(cell: ui.roleChain2.render.RewardItemUI, idx: number) {
            let info = cell.dataSource as clientCore.ItemBagInfo;
            clientCore.GlobalConfig.setRewardUI(cell.mcReward,{id: info.xlsInfo.itemId,cnt: info.goodsInfo.itemNum,showName: true, vs: 1.5});
            cell.imgSelect.visible = idx == this.list.selectedIndex;
        }

        private onListSelect(index: number): void{
            if(index == -1)return;
            this.changeGiftCount(1);
        }

        private onListMouse(e: Laya.Event, idx: number) {
            // let info = this.list.dataSource[idx] as clientCore.ItemBagInfo;
            // if (e.type == Laya.Event.CLICK && info.goodsInfo.itemNum > 0) {
            //     this.useItem2(info.goodsInfo.itemID);
            //     if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "selectFirstGift") {
            //         EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            //     }
            // }
        }

        private onUse(): void{
            let data: clientCore.ItemBagInfo = this.list.array[this.list.selectedIndex];
            if(!data)return;
            this.useItem2(data.goodsInfo.itemID);
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "selectFirstGift") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private onBlur(): void{
            this.changeGiftCount(parseInt(this.itCount.text),true);
        }

        private _beforeFavor: number = 0;
        private useItem2(id: number) {
            this._beforeFavor = this._currRoleInfo.faver;
            clientCore.RoleManager.instance.giveGift(this._currRoleInfo.id,id,parseInt(this.itCount.text));
        }

        private updateGift(lvChanged: boolean): void {
            this.show(this._currRoleInfo.id, true);
            if (lvChanged)
                RoleChainVoice.instance.playSound(this._currRoleInfo.id, 'favorLvUp');
            else {
                //好感度增加值
                RoleChainVoice.instance.playSound(this._currRoleInfo.id, 'gift', this._currRoleInfo.faver - this._beforeFavor);
            }
            if (this._currRoleInfo.faverPercent == 1) {
                alert.showFWords(`你和${this._currRoleInfo.name}的好感度增加啦！先去完成任务吧`);
            }
            else {
                alert.showFWords(`你和${this._currRoleInfo.name}的好感度增加啦！`);
            }
            this.event(Laya.Event.CHANGED);
        }

        public getFirstCell() {
            return this.list.getCell(0);
        }
        public getCloseBtn() {
            return this.btnClose;
        }


        /**
         * 改变礼物数量
         */
        private changeGiftCount(cnt: number,tips?: boolean): void{
            if(this.list.selectedIndex < 0)return;
            let data: clientCore.ItemBagInfo = this.list.array[this.list.selectedIndex];
            if(!data){
                this.itCount.changeText('0');
                return;
            }
            let need: number = Math.ceil((this._currRoleInfo.needFaver-this._currRoleInfo.faver) / this.getTotal(data));
            let had: number = data.goodsInfo.itemNum;
            let max: number = Math.min(need,had);
            this.itCount.changeText(_.clamp(cnt,1,max)+'');
            if(tips){
                if(cnt > had){
                    alert.showFWords('没有更多的礼物了哦~');
                }else if(cnt > need){
                    alert.showFWords('本级可赠送礼物已达上限~');
                }
            }
        }


        /**
         * 先算喜好道具 如果不是喜好道具 需要算喜好类型  最后+VIP
         * @param data 
         */
        private getTotal(data: clientCore.ItemBagInfo): number{
            let value: number = data.xlsInfo.value;
            let hobbyA: xls.pair[] = _.filter(this._currRoleInfo.xlsId.hobbyItem,(element: xls.pair)=>{ return element.v1 == data.goodsInfo.itemID; });
            if(hobbyA.length > 0){
                value *= (hobbyA[0].v2/100);
            }else{
                hobbyA = _.filter(this._currRoleInfo.xlsId.hobbyType,(element: xls.pair)=>{ return element.v1 == data.xlsInfo.valueType; });
                hobbyA.length > 0 && (value *= (hobbyA[0].v2/100));
            }
            let vipInfo: xls.pair =  clientCore.LocalInfo.getVipPrivilege(11);
            vipInfo && (value+=vipInfo.v2);
            return value;
        }

        destroy() {
            super.destroy();
            this._frame?.destroy();
            this._frame = null;
            this._heartBone && this._heartBone.dispose();
            this._heartBone = null;
        }
    }
}