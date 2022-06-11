namespace roleChain2 {
    export class ReviewPanel extends ui.roleChain2.panel.ReviewPanelUI implements IBaseRolePanel {
        private _currRoleId: number;
        private _currTabIndex: number;
        private _currRoleInfo: clientCore.role.RoleInfo;

        private _itemList: ReviewRender[];

        constructor() {
            super();

            this.boxCon.vScrollBarSkin = null;
        }

        show(id: number) {
            if (this._currRoleId == id) {
                return;
            }
            this._itemList = [];
            this.boxCon.removeChildren();
            this._currRoleId = id;
            this._currRoleInfo = clientCore.RoleManager.instance.getRoleById(id);
            this._currTabIndex = -1;
            let taskIndex = 0;
            if (clientCore.FavorTaskMgr.ins.checkHaveTask(this._currRoleId)) {
                taskIndex = clientCore.FavorTaskMgr.ins.getRoleTask(this._currRoleId).taskNum;
            }
            let isOverTask = clientCore.FavorTaskMgr.ins.checkTaskOver(this._currRoleId);
            let characterData = xls.get(xls.characterId).get(this._currRoleId);
            for (let i = 0; i < characterData.relationShip.length; i++) {
                let relationShip = characterData.relationShip[i];
                if (relationShip.v3 == 0) {
                    break;
                }
                let index: number = 0;
                let data = { index: i, title: "", isLock: true, dataList: [] };
                for (let j = 0; j < relationShip.v3; j++) {
                    let taskData = xls.get(xls.characterTask).get(relationShip.v2 + j);
                    if (taskData.taskType == 1) {//剧情
                        let isLock = !isOverTask;
                        if (this._currRoleInfo.faverLv - 1 > i) {
                            isLock = false;
                        } else if (this._currRoleInfo.faverLv - 1 == i) {
                            if (taskIndex - 1 > j) {
                                isLock = false;
                            }
                        }
                        if (!isLock) {
                            data.isLock = false;
                        }
                        data.dataList.push({ taskDes: taskData.taskTitle + "(" + (++index) + ")", mcId: taskData.storyId, isLock: isLock });
                    }
                    data.title = taskData.taskTitle;
                }
                let item = new ReviewRender();
                BC.addEvent(this, item.boxTitle, Laya.Event.CLICK, this, this.onTabMouse, [data.index]);
                item.init(data);
                item.onSelect(false);
                this.boxCon.addChild(item);
                this._itemList.push(item);
            }
            this.onTabMouse(this._currTabIndex);
            this.boxCon.scrollTo(0, 0);
        }

        private onTabMouse(value: number): void {
            if (this._itemList[this._currTabIndex]) {
                this._itemList[this._currTabIndex].onSelect(false);
            }
            if (this._currTabIndex == value) {
                this._currTabIndex = -1;
            } else {
                this._currTabIndex = value;
            }
            if (this._itemList[this._currTabIndex]) {
                this._itemList[this._currTabIndex].onSelect(true);
            }
            this.updatePos();
        }

        private updatePos(): void {
            let posY: number = 0;
            for (let i = 0; i < this._itemList.length; i++) {
                this._itemList[i].y = posY;
                posY += this._itemList[i].height + 5;
            }
        }

        destroy() {
            super.destroy();
        }

        dispose(): void {

        }
    }
}