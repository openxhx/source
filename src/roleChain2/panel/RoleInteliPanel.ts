namespace roleChain2 {
    export class RoleInteliPanel extends ui.roleChain2.panel.InteliPanelUI implements IBaseRolePanel {
        private _currRoleId: number;
        private _currRoleInfo: clientCore.role.RoleInfo;
        constructor() {
            super();
            this.listHobby.vScrollBarSkin = null;
            this.listHobby.renderHandler = new Laya.Handler(this, this.onHobbyRender);
        }

        show(id: number) {
            this._currRoleInfo = clientCore.RoleManager.instance.getRoleById(id);
            if (this._currRoleId != id) {
                this._currRoleId = id;
                this.listHobby.dataSource = _.filter(xls.get(xls.characterHobby).getValues(), { 'characterId': this._currRoleId });
                this.listHobby.scrollTo(0);
            }
            else {
                this.listHobby.refresh()
            }
        }

        private onHobbyRender(cell: ui.roleChain2.render.HobbyItemUI, idx: number) {
            let data = cell.dataSource as xls.characterHobby;
            let locked = this._currRoleInfo.faver < data.typeNum;
            cell.txt.text = locked ? '???' : data.desc;
            cell.imgNew.visible = false;
            cell.imgLock.visible = locked;
        }

        destroy() {
            super.destroy();
        }

        dispose(): void {

        }
    }
}