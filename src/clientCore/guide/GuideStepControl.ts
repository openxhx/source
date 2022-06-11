namespace clientCore {
    export class GuideStepControl {
        private static _instance: GuideStepControl;

        private isFirstShow: boolean = true;
        constructor() {
        }
        public static get instance(): GuideStepControl {
            if (!this._instance) {
                this._instance = new GuideStepControl;
            }
            return this._instance;
        }
        private checkShowMaskUI(): boolean {
            if (GuideMainManager.instance.curGuideInfo.showMaskBehavior == "") {
                return true;
            }
            return false;
        }

        public showUIByStep(mainID: number, subID: number) {
            // console.log("show  " + mainID + "_" + subID + "  panel ui");
            if (this.checkShowMaskUI()) {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
            switch (mainID) {
                case 1:
                    if (subID == 1) {
                        let obj = LayerManager.joyLayer.getChildByName("JoyStickUI");
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                    }
                    break;
                case 2:
                    if (subID == 1) {/**地图摆放花朵，设置下人物所在位置，防止第一步移动人物的时候，把人物移动到不可摆放位置 */
                        MapManager.setSelfBodyPos(1196, 1282);
                        PeopleManager.getInstance().player.pos(1496, 1282);
                    }
                    break;
                case 3:
                    if (subID == 3) {
                        EventManager.once(globalEvent.ENTER_MAP_SUCC, this, () => {
                            let pickItemInfo = new pb.PickItem();
                            pickItemInfo.pos = new pb.Point();
                            pickItemInfo.pos.x = 1300;
                            pickItemInfo.pos.y = 700;
                            pickItemInfo.posId = 6;
                            let mapPickItem = new MapPickItem(pickItemInfo);
                            MapManager.curMap.pickLayer.addChild(mapPickItem);
                            Laya.timer.frameOnce(1, this, () => {
                                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, mapPickItem);
                            });
                            //
                            let progress = new Laya.Sprite();
                            let bg = new Laya.Image();
                            let pro = new Laya.Image();
                            let mask = new Laya.Image();
                            bg.skin = "commonUI/pickProgressBg.png";
                            pro.skin = "commonUI/pickProgress.png";
                            mask.skin = "commonUI/pickProgress.png";
                            pro.mask = mask;
                            progress.addChild(bg);
                            progress.addChild(pro);
                            progress.width = bg.width;
                            progress.height = bg.height;
                            progress.pivotX = bg.width / 2;
                            mask.x = -mask.width;
                            mapPickItem.once(Laya.Event.CLICK, this, () => {
                                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                                let aimPos = new Laya.Point();
                                aimPos.x = mapPickItem.x - 30;
                                aimPos.y = mapPickItem.y + mapPickItem.height / 2;
                                PeopleManager.getInstance().flyTo(aimPos);
                                EventManager.once(globalEvent.PLAYER_FLY_COMPLETE, this, () => {
                                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, progress);
                                    PeopleManager.getInstance().player.showProgress(progress);
                                    Laya.Tween.to(mask, { x: 0 }, 2000, null, Laya.Handler.create(this, () => {
                                        progress.removeSelf();
                                        mapPickItem.removeSelf();
                                        mapPickItem.destroy();

                                        net.sendAndWait(new pb.cs_new_player_guide_special_opt({ opt: 1 })).then((data: pb.sc_new_player_guide_special_opt) => {
                                            for (let i = 0; i < data.items.length; i++) {
                                                alert.showFWords("获得：" + ItemsInfo.getItemName(data.items[i].id) + " x" + data.items[i].cnt);
                                                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                                            }
                                        });
                                    }));
                                });
                            });

                        });
                    }
                    else if (subID == 5) {
                        if (MapInfo.isSelfHome) {
                            GuideMainManager.instance.curGuideInfo.moduleName = "selfHomeUI";
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    }
                    break;
                case 4:
                    /**
                     * 这两部特殊处理，因为这一步正常情况下是在大地图完成。但是如果玩家第四步刷新，重新上来的时候，玩家是在家园的
                     * 而表里面配的icon是世界地图的icon位置，所以这需要特殊处理一下
                     */
                    if (subID == 1 || subID == 10) {
                        if (MapInfo.isSelfHome) {
                            GuideMainManager.instance.curGuideInfo.moduleName = "selfHomeUI";
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    }
                    break;
                case 5:
                    if (subID == 1) {
                        if (MapInfo.isSelfHome) {
                            GuideMainManager.instance.skipStep(5, 3);
                            GuideMainManager.instance.startGuide();
                        }
                    }
                    else if (subID == 3)//
                    {
                        if (!MapInfo.isSelfHome) {
                            EventManager.once(globalEvent.ENTER_MAP_SUCC, this, () => {
                                MapManager.setSelfBodyPos(650, 1282);
                                Laya.timer.frameOnce(2, this, () => {
                                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, MapManager.curMap.mapExpend.findLoakBtnById(105).imgFlg);
                                });
                            });
                        }
                        else {
                            MapManager.setSelfBodyPos(650, 1282);
                            Laya.timer.frameOnce(2, this, () => {
                                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, MapManager.curMap.mapExpend.findLoakBtnById(105).imgFlg);
                            });
                        }
                    }
                    else if (subID == 4) {
                        MapManager.curMap.mapExpend.findLoakBtnById(105).imgFlg.disabled = true;
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, MapManager.curMap.mapExpend.findLoakBtnById(105).imgExpand);
                    }
                    else if (subID == 10) { /**地图摆放花朵，设置下人物所在位置，防止第一步移动人物的时候，把人物移动到不可摆放位置 */
                        MapManager.setSelfBodyPos(1296, 1282);
                        // PeopleManager.getInstance().player.pos(1596, 1282);
                    }
                    else if (subID == 18) {
                        MapManager.setSelfBodyPos(650, 1282);
                        Laya.timer.frameOnce(2, this, () => {
                            if (MapManager.curMap.mapExpend.findLoakBtnById(105).imgExpand.visible) {
                                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                            }
                            else {
                                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, MapManager.curMap.mapExpend.findLoakBtnById(105).imgFlg);
                            }
                        });
                    }
                    else if (subID == 19) {
                        MapManager.curMap.mapExpend.findLoakBtnById(105).imgFlg.disabled = true;
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, MapManager.curMap.mapExpend.findLoakBtnById(105).imgExpand);
                    }
                    break;
                case 6:
                    if (subID == 5)//
                    {
                        if (UIManager.getHomeBtnState() == 0) {
                            EventManager.event(UIManager.CHANGE_HOME_BTN, 1);
                        }
                    }
                    break;
                case 7:
                    break;
                case 8:
                    if (subID == 3) {//这一步是点击生产按钮，如果已经在生产了或者已经生产完成了，就可以跳过了
                        let buildingInfo = MapItemsInfoManager.instance.getBuildingInfoByID(400001);
                        if (buildingInfo && buildingInfo.produceTotalNum > 0) {//已经开始生产了
                            GuideMainManager.instance.skipStep(8, 6);
                            GuideMainManager.instance.startGuide();
                        }
                        else {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    }
                    else if (subID == 6) {
                        let buildingInfo = MapItemsInfoManager.instance.getBuildingInfoByID(400001);
                        if (buildingInfo && buildingInfo.produceCompleteNum > 0) {//已经有物品产出了，就可以直接收
                            Laya.timer.frameOnce(2, this, () => {
                                GuideMainManager.instance.skipStep(8, 8);
                                GuideMainManager.instance.startGuide();
                            });
                        }
                        else {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    }
                    break;
                case 9:
                    break;
                case 10:
                    break;
                case 11:
                    break;
                case 12:
                    if (subID == 1) {
                        if (UIManager.getHomeBtnState() == 0)//如果是在冒险状态，这步就跳过
                        {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                        else {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    }
                    break;
                case 13:
                    if (subID == 1) {/**冒险兼容处理，如果关卡1完成，直接做关卡2，那么前两部点击icon的就没用必要 */
                        if (ModuleManager.checkModuleOpen("adventure")) {
                            GuideMainManager.instance.skipStep(13, 3);
                            GuideMainManager.instance.startGuide();
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                            return;
                        }
                        if (UIManager.getHomeBtnState() == 0)//如果是在冒险状态，这步就跳过
                        {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                        else {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    }
                    // if (subID == 1) {
                    //     PeopleManager.getInstance().selfBody.pos(900, 1450);
                    // }
                    break;
                case 14:
                    if (subID == 8)//
                    {
                        let seedInfo = MapItemsInfoManager.instance.getFlowerInfoByID(900002);
                        if (seedInfo && seedInfo.produceRestTime < 1)/**如果刷新之后，这里花种已经都生产好了，就可以直接跳过这一步 */ {
                            GuideMainManager.instance.skipStep(14, 10);
                            GuideMainManager.instance.startGuide();
                        }
                        else {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    }
                    else if (subID == 11) {
                        if (LocalInfo.rainbowInfo.duration <= 0) {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                    }
                    break;
                case 15:
                    if (subID == 1) {
                        if (UIManager.getHomeBtnState() == 0)//如果是在冒险状态，这步就跳过
                        {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                        else {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    }
                    break;
                case 16:
                    if (subID == 1) {/**冒险兼容处理，如果神祈完了。直接在队伍面板上解锁神祈技能 */
                        if (ModuleManager.checkModuleOpen("formation")) {
                            GuideMainManager.instance.skipStep(16, 3);
                            GuideMainManager.instance.startGuide();
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                            return;
                        }
                        if (UIManager.getHomeBtnState() == 0)//如果是在冒险状态，这步就跳过
                        {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                        else {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    }
                    break;
                case 17:
                    if (subID == 1) {/**冒险兼容处理，如果神祈完了。直接在队伍面板上解锁神祈技能 */
                        if (ModuleManager.checkModuleOpen("formation")) {
                            GuideMainManager.instance.skipStep(17, 3);
                            GuideMainManager.instance.startGuide();
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                            return;
                        }
                        if (UIManager.getHomeBtnState() == 0)//如果是在冒险状态，这步就跳过
                        {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                        else {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    }
                    break;
                case 18:
                    if (subID == 1) {
                        if (UIManager.getHomeBtnState() == 0)//如果是在冒险状态，这步就跳过
                        {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                        else {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    }
                    break;
                case 19:
                    if (subID == 1) {
                        if (UIManager.getHomeBtnState() == 0)//如果是在冒险状态，这步就跳过
                        {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                        else {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                        }
                    }
                    break;
                case 20:
                    if (subID == 1) {
                        MapManager.setSelfBodyPos(942, 544);
                    }

                    break;
                case 21:
                    break;
                case 22:
                    break;
                case 23:
                    if (subID == 1) {
                        MapManager.setSelfBodyPos(2992, 859);
                        Laya.timer.frameOnce(3, this, () => {
                            EventManager.event(globalEvent.PARTY_ENTER_OPEN_START);
                        })
                    }
                    else if (subID == 3) {
                        EventManager.once(globalEvent.ENTER_MAP_SUCC, this, () => {
                            let obj = LayerManager.joyLayer.getChildByName("JoyStickUI");
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                        });
                    }
                    else if (subID == 4) {
                        MapManager.setSelfBodyPos(1000, 900);
                    }
                    break;
                case 24:
                    if (subID == 1) {
                        MapManager.setSelfBodyPos(2644, 859);
                        Laya.timer.frameOnce(3, this, () => {
                            EventManager.event(globalEvent.RESTAURANT_ENTER_OPEN_START);
                        })
                    }
                    break;
            }
        }
        public setUp() {

        }
    }
}