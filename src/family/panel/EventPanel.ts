
namespace family.panel {
    /**
     * 事件面板
     */
    export class EventPanel extends ui.family.panel.EventPanelUI implements IPanel {
        private _postArr: pb.IspecialInfo[];

        constructor() {
            super();
            this.postList.vScrollBarSkin = "";
            this.postList.renderHandler = Laya.Handler.create(this, this.postListRender, null, false);
            this.eventList.vScrollBarSkin = "";
            this.eventList.renderHandler = Laya.Handler.create(this, this.eventListRender, null, false);
        }

        update(parent: Laya.Sprite): void {
            this._postArr = [
                { post: FamlyPost.SHAIKH, username: "" },
                { post: FamlyPost.VICE_SHAIKH, username: "" },
                { post: FamlyPost.ELDER, username: "" },
                { post: FamlyPost.ELITE, username: "" }
            ];
            this.postList.dataSource = this._postArr;

            this.addEventListeners();
            parent.addChild(this);
            this.getPosts();
            this.getEvents();
        }

        private postListRender(item: ui.family.item.EventPostItemUI, index: number): void {
            let data: pb.IspecialInfo = item.dataSource;
            item.iconZhiwei.skin = "family/icon_zhiwei_" + data.post + ".png";
            item.labName.text = data.username == "" ? "无" : data.username;
        }

        private eventListRender(item: ui.family.item.EventInfoItemUI, index: number): void {
            let data: any = JSON.parse(item.dataSource);
            let str: string = "";
            switch (data.type) {
                case FamlyEvent.JOIN:
                    str = util.getLang(FamilyConstant.EVENT_MSG[data.type], data.param1);
                    break;
                case FamlyEvent.LEAVE:
                    str = util.getLang(FamilyConstant.EVENT_MSG[data.type], data.param1);
                    break;
                case FamlyEvent.PLEASE_LEAVE:
                    str = util.getLang(FamilyConstant.EVENT_MSG[data.type], data.param1, data.param2);
                    break;
                case FamlyEvent.APPOINT:
                    str = util.getLang(FamilyConstant.EVENT_MSG[data.type], data.param1, FamilyConstant.POST[data.param2]);
                    break;
                case FamlyEvent.APPOINT2:
                    str = util.getLang(FamilyConstant.EVENT_MSG[data.type], data.param1, FamilyConstant.POST[data.param2]);
                    break;
                case FamlyEvent.UNLOCK:
                    let xlsData: xls.manageBuildingId = xls.get(xls.manageBuildingId).get(data.param1);
                    str = util.getLang(FamilyConstant.EVENT_MSG[data.type], xlsData.name);
                    break;
            }
            item.labTime.text = util.TimeUtil.analysicTime(data.time, true, "/");
            item.labMsg.style.width = 315;
            item.labMsg.style.fontSize = 24;
            item.labMsg.style.family = "汉仪中圆简";
            item.labMsg.style.color = "#4d3118";
            item.labMsg.style.leading = 2;
            item.labMsg.innerHTML = str;
        }

        /** 获取职位列表信息**/
        private getPosts(): void {
            FamilySCommand.ins.getSpecialInfo(Laya.Handler.create(this, (arr: pb.IspecialInfo[]) => {
                for (let i = 0; i < this._postArr.length; i++) {
                    for (let j = 0; j < arr.length; j++) {
                        if (arr[j].post == this._postArr[i].post) {
                            if (this._postArr[i].username == "") {
                                this._postArr[i].username = arr[j].username;
                            } else {
                                this._postArr.splice(++i, 0, arr[j]);
                            }
                        }
                    }
                }
                this.postList.refresh();
            }))
        }

        /** 获取信息列表信息**/
        private getEvents(): void {
            FamilySCommand.ins.getChangelog(0, 30, Laya.Handler.create(this, (arr: string[]) => {
                this.eventList.dataSource = arr;
                this.labNoData.visible = arr.length == 0;

                this.boxBar.visible = this.eventList.scrollBar.max > 0;
                if (this.boxBar.visible) {
                    this.onScrollBarChange();
                }
            }))
        }

        private onScrollBarChange(): void {
            let scrollBar: Laya.ScrollBar = this.eventList.scrollBar;
            if (scrollBar.max <= 0) return;
            this.imgBar.y = -1 + _.clamp(400 * (scrollBar.value / scrollBar.max), 0, 400);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.eventList.scrollBar, Laya.Event.CHANGE, this, this.onScrollBarChange);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        dispose(): void {
            this.removeSelf();
            this.removeEventListeners();
        }

        destroy(): void {
            super.destroy();
        }
    }
}