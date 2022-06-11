namespace scene.battle.result {
    /**
     * 战斗结算信息
     */
    export class ResultInfoPanel extends ui.battleResult.ResultInfoUI {

        private _myTotalHurt: number = 0;
        private _enemyTotalHurt: number = 0;

        constructor() {
            super();

            this.myList.vScrollBarSkin = "";
            this.enemyList.vScrollBarSkin = "";
            this.myList.renderHandler = Laya.Handler.create(this, this.myRender, null, false);
            this.enemyList.renderHandler = Laya.Handler.create(this, this.enemyRender, null, false);
        }

        public show(array: pb.IDamageRec[]): void {
            clientCore.DialogMgr.ins.open(this);

            let _myHurts: pb.DamageRec[] = [];
            let _enemyHurts: pb.DamageRec[] = [];
            _.forEach(array, (element: pb.DamageRec) => {
                if (element.team == 1) {
                    _myHurts.push(element)
                    this._myTotalHurt += element.data;
                } else {
                    _enemyHurts.push(element)
                    this._enemyTotalHurt += element.data;
                }
            })

            this.myList.width = 360 + 45 * (_myHurts.length - 1);
            this.myList.array = _myHurts;
            this.enemyList.width = 360 + 45 * (_enemyHurts.length - 1);
            this.enemyList.array = _enemyHurts;
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.myList.scrollBar, Laya.Event.CHANGE, this, this.onChange, [this.myList]);
            BC.addEvent(this, this.enemyList.scrollBar, Laya.Event.CHANGE, this, this.onChange, [this.enemyList]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        private onChange(list: Laya.List): void {
            let len: number = list.length;
            let value: number = list.scrollBar.value;
            let item: Laya.Box;
            for (let i: number = list.startIndex; i < 5 + list.startIndex; i++) {
                item = list.getCell(i);
                item && (item.x = (len - i - 1) * 45 + 45 / 125 * value);
            }
        }

        private myRender(item: ui.battleResult.item.MyHurtItemUI, index: number): void {
            let info: pb.DamageRec = item.dataSource;
            let role: clientCore.role.RoleInfo = clientCore.RoleManager.instance.getRoleById(info.roleid);
            item.ico.skin = clientCore.RoleManager.instance.getSelfInfo().id == info.roleid ? clientCore.LocalInfo.headImgUrl : pathConfig.getRoleIcon(info.roleid);
            item.txDamage.changeText(info.data + "");
            item.txLv.changeText(role.lv + "");
            item.frame.skin = pathConfig.getRoleCircleBg(role.xlsId.quality);
            item.imgAttrIco.skin = pathConfig.getRoleAttrIco(role.xlsId.Identity);
            item.imgCareer.skin = pathConfig.getRoleBattleTypeIcon(role.xlsId.battleType);
            item.bar.width = info.data / this._myTotalHurt * 210;
        }

        private enemyRender(item: ui.battleResult.item.EnemyHurtItemUI, index: number): void {
            let info: pb.DamageRec = item.dataSource;
            item.txDamage.changeText(info.data + "");
            let monster: xls.monsterBase = xls.get(xls.monsterBase).get(info.roleid);
            if (!monster)
                return;
            item.ico.skin = pathConfig.getMonsterIcon(monster.monAppear);
            item.imgAttrIco.skin = pathConfig.getRoleAttrIco(monster.Identity);
            item.txLv.changeText(monster.monsterLv + "");
            item.bar.width = info.data / this._enemyTotalHurt * 210;
        }
    }
}