namespace clientCore {
    interface TipsInfo {
        id: number
    }

    interface MtsInfo {
        id: number,
        cnt: number,
        mod: number,
        tips: string
    }

    interface GetWay {
        id: number,
        param: string,
        desc: string,
        disabled: boolean,
    }

    export class ToolTip {
        private static _tips: ui.commonUI.TipsUI;
        private static _faceTips: ui.commonUI.FaceTipsUI;
        private static _contentTips: ui.commonUI.ContentTipsUI;
        private static _curItemID: number;
        private static _rewardPanel: RewardPanel;
        static setup() {
            this._tips = new ui.commonUI.TipsUI();
            this._tips.anchorY = 0.7;
            this._tips.list.renderHandler = Laya.Handler.create(this, this.onListRender, null, false);
            this._tips.list.mouseHandler = Laya.Handler.create(this, this.onMouseHanlder, null, false);
            /////////////////
            this._faceTips = new ui.commonUI.FaceTipsUI();
            this._faceTips.anchorY = 1;
            this._faceTips.anchorX = 0.5;
            /////////////////
            this._contentTips = new ui.commonUI.ContentTipsUI();
            this._contentTips.anchorY = 0.5;
            this._contentTips.list.mouseEnabled = true;
            this._contentTips.list.renderHandler = Laya.Handler.create(this, this.onItemRender, null, false);
            this._contentTips.list.mouseHandler = Laya.Handler.create(this, this.onItemMouse, null, false);
        }

        /**添加tips监听 */
        static addTips(dis: Laya.Sprite, obj: TipsInfo) {
            if (dis) {
                dis.on(Laya.Event.REMOVED, this, this.hideTips);
                dis.on(Laya.Event.CLICK, this, this.onShowTips, [dis, obj]);
            }
        }

        /**移除tips监听 */
        static removeTips(dis: Laya.Sprite) {
            if (dis) {
                dis.off(Laya.Event.REMOVED, this, this.hideTips);
                dis.off(Laya.Event.CLICK, this, this.onShowTips);
            }
        }

        /**直接展示tips  用于list里面元素，点击自己控制，展示tips用这个*/
        static showTips(dis: Laya.Sprite, info: TipsInfo, mtsinfo?: MtsInfo) {
            if (dis)
                this.onShowTips(dis, info, mtsinfo);
        }

        /**展示表情包原图*/
        static showFaceTips(dis: Laya.Sprite, info: TipsInfo) {
            if (dis)
                this.onShowFaceTips(dis, info);
        }

        /**影藏当前的tips显示 */
        static hideTips() {
            this._tips.removeSelf();
            this._faceTips.removeSelf();
            this._contentTips.removeSelf();
            Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.onStageClick);
        }

        private static onListRender(cell: ui.commonUI.item.GetwayRenderUI, idx: number) {
            let data: GetWay = cell.dataSource;
            cell.btnGo.disabled = data.disabled;
            cell.txtGetWay.text = data.desc;
            cell.btnGo.visible = !(GuideMainManager.instance.isGuideAction && GuideMainManager.instance.curGuideInfo.mainID != 21);
        }

        private static async onMouseHanlder(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && e.target.name == 'btnGo') {
                this.hideTips();
                let jumpSuccFlag = await JumpManager.jumpByItemID(this._curItemID);
                if (!jumpSuccFlag) {
                    let data: GetWay = this._tips.list.getItem(idx);
                    this.gotoMod(data.id, data.param);
                }
                if (GuideMainManager.instance.curGuideInfo.operationBehavior == "clickTipsGoBtn") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }
        }

        private static onItemRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: true });
        }

        private static onItemMouse(e: Laya.Event, idx: number) {
            let reward: xls.pair = this._contentTips.list.array[idx];
            if (reward) {
                this.showTips(this._contentTips.list.cells[idx], { id: reward.v1 });
                return;
            };
        }

        /**打开模块，包含了一些打开限制条件 */
        static async gotoMod(id: number, param?: string) {
            // if (id == 96) {
            //     alert.showFWords('功能尚未开启~');
            //     return;
            // }
            let modueXlsInfo = xls.get(xls.moduleOpen).get(id);
            if (!modueXlsInfo)
                return;
            let reqMap = modueXlsInfo.reqMap;
            let path = modueXlsInfo.name;
            let extraStr = param ? param : modueXlsInfo.extraData;
            let extraData;
            if (extraStr) {
                try {
                    extraData = JSON.parse(extraStr)
                }
                catch {
                    extraData = extraStr;
                }
            }
            let isOpened = clientCore.ModuleManager.checkModuleOpen(path.split('.')[0]);
            if (isOpened) {
                if (!param) {
                    alert.showFWords('已经在当前功能内');
                } else {
                    EventManager.event(globalEvent.SEND_PARAM_TO_MODULE, extraData);
                }
                return;
            }
            //模块未解锁（systemTable） 或 不在时间范围内（eventControl）
            let canNotOpen = !clientCore.SystemOpenManager.ins.checkOpenByModuleId(id, true);
            let notInTime = clientCore.SystemOpenManager.ins.checkActOverByModId(id, true);
            if (canNotOpen || notInTime) {
                return;
            }
            else {
                //先关闭全部模块
                clientCore.ModuleManager.closeAllOpenModule();
                //关闭所有弹窗
                clientCore.DialogMgr.ins.closeAllDialog();
                //师徒系统特殊处理
                if (id == 89) {
                    MentorManager.openMentorSystem();
                    return;
                }
                //网页跳转处理
                if(id == 333){
                    window.open('http://xhx.61.com/events/2022return/');
                    return;
                }
                //有地图需求
                if (reqMap) {
                    if (reqMap == 0) {
                        //符合地图要求
                        clientCore.ModuleManager.open(path, extraData);
                    }
                    else {
                        if (reqMap == 1) {
                            //要求在自己家园
                            if (!clientCore.MapInfo.isSelfHome) {
                                clientCore.UserPickManager.ins.stopPick()
                                await clientCore.MapManager.enterHome(clientCore.LocalInfo.uid);
                            }
                            clientCore.ModuleManager.open(path, extraData);
                        }
                        else if (reqMap == 2) {
                            //要求家族 打开家族
                            if (!clientCore.MapInfo.isSelfFamily)
                                clientCore.FamilyMgr.ins.openFamily();
                        } else if (reqMap == 11) {
                            //要求美丽湖东
                            if (clientCore.MapInfo.mapID != 11) {
                                clientCore.UserPickManager.ins.stopPick()
                                await clientCore.MapManager.enterWorldMap(11);
                            }
                            clientCore.ModuleManager.open(path, extraData);
                        }
                    }
                }
                else {
                    //无地图要求 直接开面板
                    clientCore.ModuleManager.open(path, extraData);
                }
            }
        }

        private static onShowFaceTips(dis: Laya.Sprite, info: TipsInfo) {
            console.log('FACETIPS: ' + info?.id)
            let data = xls.get(xls.chatType).get(info.id);
            if (!data || data.chatType != 2) return;
            clientCore.LayerManager.alertLayer.addChild(this._faceTips);
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onStageClick, [null]);
            this._faceTips.imgIcon.skin = pathConfig.getChatEmoji(clientCore.LocalInfo.sex, data.chatId);
            this._faceTips.imgIcon.width = data.size.v1 ? data.size.v1 : 80;
            this._faceTips.imgIcon.height = data.size.v2 ? data.size.v2 : 80;
            this._faceTips.width = this._faceTips.imgIcon.width + 30;
            this._faceTips.height = this._faceTips.imgIcon.height + 30;
            let pos = new Laya.Point(0, 0);
            dis.localToGlobal(pos, false);
            this._faceTips.pos(pos.x + dis.width / 2, pos.y, true);
            //适配边界
            if ((this._faceTips.x - this._faceTips.width / 2) < 0) {
                this._faceTips.x = 0 + this._faceTips.width / 2;
            }
        }

        private static onShowTips(dis: Laya.Sprite, info: TipsInfo, mts?: MtsInfo) {
            console.log('TIPS: ' + info?.id)
            //角色不显示tips
            if (Math.floor(info.id / 100000) == 14)
                return;
            if (Math.floor(info.id / 100000) == 39 || Math.floor(info.id / 100000) == 19) {
                this.showContentTips(dis, info.id);
                return;
            }
            clientCore.LayerManager.alertLayer.addChild(this._tips);
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onStageClick, [dis]);
            //设置ui
            let id = info.id;
            this._curItemID = id;
            this._tips.imgIconBg.skin = ItemsInfo.getItemIconBg(id);
            this._tips.txtName.text = ItemsInfo.getItemName(id);
            this._tips.imgIcon.skin = ItemsInfo.getItemIconUrl(id);
            this._tips.list.visible = false;
            this._tips.txtNum.text = '拥有:' + ItemsInfo.getItemNum(id);
            this._tips.txtNum.visible = true;
            let getWayList: string[] = [];
            if (xls.get(xls.itemBag).has(id)) {
                this._tips.txtDes.text = xls.get(xls.itemBag).get(id).captions;
                getWayList = xls.get(xls.itemBag).get(id)?.channelType ?? [];
            }
            else if (xls.get(xls.materialBag).has(id)) {
                this._tips.txtDes.text = xls.get(xls.materialBag).get(id).captions;
                getWayList = xls.get(xls.materialBag).get(id)?.channelType ?? [];
            }
            else if (xls.get(xls.itemCloth).has(id)) {
                this._tips.txtDes.text = xls.get(xls.itemCloth).get(id).describe;
                getWayList = xls.get(xls.itemCloth).get(id)?.channelType ?? [];
            }
            else if (xls.get(xls.suits).has(id)) {
                this._tips.txtDes.text = SuitsInfo.getSuitInfo(id)?.suitInfo.describe ?? '';
                let clothId = SuitsInfo.getSuitInfo(id).clothes[0];
                getWayList = xls.get(xls.itemCloth).get(clothId)?.channelType ?? [];
            }
            else if (xls.get(xls.bgshow).has(id)) {
                // this._tips.txtDes.text = xls.get(xls.bgshow).get(id)?.name ?? '';
                this._tips.txtDes.text = xls.get(xls.bgshow).get(id)?.description ?? '';
                getWayList = xls.get(xls.bgshow).get(id)?.channelType ?? [];
            }
            else if (xls.get(xls.manageBuildingId).has(id)) {
                this._tips.txtDes.text = xls.get(xls.manageBuildingId).get(id)?.captions ?? '';
                getWayList = xls.get(xls.manageBuildingId).get(id)?.channelType ?? [];
            }
            else if (xls.get(xls.partyHouse).has(id)) {
                this._tips.txtDes.text = xls.get(xls.partyHouse).get(id)?.furnitureDes ?? '';
                let getWay = xls.get(xls.partyHouse).get(id)?.channelType;
                getWayList = getWay ? [getWay] : [];
                this._tips.txtNum.text = '拥有:' + clientCore.PartyItemManager.getTotalItemNum(id);
            }
            else if (xls.get(xls.title).has(id)) {
                this._tips.txtDes.text = xls.get(xls.title).get(id)?.des ?? '';
                getWayList = xls.get(xls.title).get(id)?.channelType ?? [];
            }
            else if (xls.get(xls.userHead).has(id)) {
                this._tips.txtDes.text = xls.get(xls.userHead).get(id)?.description ?? '';
            }
            else if (xls.get(xls.userHeadFrame).has(id)) {
                this._tips.txtDes.text = xls.get(xls.userHeadFrame).get(id)?.description ?? '';
                getWayList = xls.get(xls.userHeadFrame).get(id)?.channelType ?? [];
            } else if (xls.get(xls.collocation).has(id)) {
                this._tips.txtDes.text = xls.get(xls.collocation).get(id)?.captions ?? '';
                getWayList = xls.get(xls.collocation).get(id)?.channelType ?? [];
            }

            if (info.id == 820001) {
                //精灵能量特殊处理
                getWayList = ['精灵能量/48'];
            }
            if (info.id == 9900019) {
                this._tips.txtNum.visible = false;
            }
            getWayList = getWayList.slice(0, 3);
            if (getWayList.length > 0) {
                let arr = [230, 260, 290];
                this._tips.height = arr[getWayList.length - 1];
                this._tips.list.visible = true;
                this._tips.txtNoGetWay.visible = false;
                this._tips.list.dataSource = this.sortGetWayList(getWayList, id);
            }
            else {
                this._tips.height = 230;
                this._tips.list.visible = false;
                this._tips.txtNoGetWay.visible = true;
            }
            let pos = new Laya.Point(0, 0);
            dis.localToGlobal(pos, false);
            this._tips.pos(pos.x + dis.width / 2, pos.y + dis.height / 2, true);
            //超出右边界的话tips放左边
            if ((this._tips.x + this._tips.width) >= Laya.stage.width) {
                this._tips.x -= this._tips.width;
            }
            let disY: number = 0;
            if ((this._tips.y + this._tips.height / 2) >= Laya.stage.height) {
                disY = (this._tips.y + this._tips.height / 2) - Laya.stage.height;
                this._tips.y -= disY;
            }

            disY = this._tips.y - this._tips.height * 0.7;
            if (disY < 0) {
                this._tips.y -= disY;
            }
            if (this._tips.y < 0) {
                this._tips.y = 10;
            }
            //注册
            mts && Dispatch.reg(mts.id, mts.cnt, mts.mod, mts.tips);
        }

        /**
         * 
         * @param dis 
         * @param id 没有id时候随便传，但是content必须有
         * @param content 优先以传进来的content为准，没有的话根据id去itembag表里获取
         */
        public static showContentTips(dis: Laya.Sprite, id: number, content?: xls.pair[]) {
            if (!content) {
                let info = xls.get(xls.itemBag).get(id);
                if (!info) return;
                content = info.include;
            }
            if (content.length > 8) {
                this.showRewardPanel(content, id);
                return;
            }
            clientCore.LayerManager.alertLayer.addChild(this._contentTips);
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onStageClick, [dis]);
            this._contentTips.list.array = content;
            this._contentTips.list.repeatX = content.length > 4 ? 4 : content.length;
            this._contentTips.list.repeatY = Math.ceil(content.length / 4);
            this._contentTips.width = this._contentTips.list.repeatX > 3 ? this._contentTips.list.repeatX * 100 + 120 : 420;
            this._contentTips.height = (this._contentTips.list.repeatY - 1) * 140 + 212;
            let pos = new Laya.Point(0, 0);
            dis.localToGlobal(pos, false);
            this._contentTips.pos(pos.x + dis.width / 2, pos.y + dis.height / 2, true);
            //超出右边界的话tips放左边
            if ((this._contentTips.x + this._contentTips.width) >= Laya.stage.width) {
                this._contentTips.x -= this._contentTips.width;
            }
            let disY: number = 0;
            if ((this._contentTips.y + this._contentTips.height / 2) >= Laya.stage.height) {
                disY = (this._contentTips.y + this._contentTips.height / 2) - Laya.stage.height;
                this._contentTips.y -= disY;
            }
            disY = this._contentTips.y - this._contentTips.height * 0.7;
            if (disY < 0) {
                this._contentTips.y -= disY;
            }
            if (this._contentTips.y < 0) {
                this._contentTips.y = 10;
            }
        }

        private static showRewardPanel(array: xls.pair[], id: number) {
            this._rewardPanel = this._rewardPanel || new RewardPanel();
            this._rewardPanel.show(array, id);
        }

        private static sortGetWayList(arr: string[], id: number): GetWay[] {
            let rtn: GetWay[] = [];
            for (const o of arr) {
                if (o.indexOf('/') == -1)
                    continue;
                let moduleId: number = parseInt(o.split('/')[1]);
                let disabled = clientCore.SystemOpenManager.ins.checkActOverByModId(moduleId);
                let param: string = o.split('/')[2];
                //服装和背景秀特殊处理，有些已经下架的模块 还没有配置下架时间
                // if (xls.get(xls.itemCloth).has(id) || xls.get(xls.bgshow).has(id)) {
                //     disabled = true;
                // }
                rtn.push({ id: moduleId, param: param, desc: o.split('/')[0], disabled: disabled });
            }
            return _.sortBy(rtn, (o) => {
                return o.disabled ? 1 : -1;
            })
        }

        private static onStageClick(dis: Laya.Sprite) {
            if (dis?.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY))
                return;
            if (this._tips.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY)) {
                return;
            } else {
                this._tips.removeSelf();
            }
            if (this._contentTips.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY)) {
                return;
            }
            this.hideTips();
        }
        public static get tips(): ui.commonUI.TipsUI {
            return this._tips;
        }
    }


    export class RewardPanel extends ui.commonUI.RewardPanelUI {

        sideClose: boolean = true;

        constructor() {
            super();
            this.list.renderHandler = new Laya.Handler(this, this.itemRender);
            this.list.mouseHandler = new Laya.Handler(this, this.itemMouse);
        }
        show(array: xls.pair[], id: number): void {
            clientCore.DialogMgr.ins.open(this);
            let len: number = array.length;
            let col: number = Math.ceil(len / 4);
            this.height = this.imgBg.height = 212 + (col - 1) * 117;
            this.list.height = 180 * col;
            this.list.array = array;
            this.tipTxt.visible = id == 1900053;
        }
        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
        private itemRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let data: xls.pair = this.list.array[index];
            clientCore.GlobalConfig.setRewardUI(item, { id: data.v1, cnt: data.v2, showName: true });
        }
        private itemMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let data: xls.pair = this.list.array[index];
            clientCore.ToolTip.showTips(e.target, { id: data.v1 });
        }
    }
}