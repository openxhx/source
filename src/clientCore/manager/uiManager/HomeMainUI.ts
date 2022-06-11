/// <reference path="MainUIBase.ts" />
namespace clientCore {
    export class HomeMainUI extends MainUIBase {
        private _mainUI: ui.main.home.HomeMainUIUI;
        private _favorTaskUI: FavorTaskPanel;
        private _homeBtnState: number = 1;
        private _contactBtnState: number = 1;
        /**二维数组，其中每个数组中存放的是按钮（huabutton或者box）
         * 从右往左排列，ui中每个按钮都需要anchorX = 0.5,如果是box宽高也要指定
         */
        private _layoutArrToRight: Array<Array<Laya.Sprite>>;
        private _layoutArrToLeft: Array<Array<Laya.Sprite>>;

        private _openManagerInitOver: boolean = false;

        // private _activityBar: ActivityBarView;

        constructor() {
            super();
            this._layoutArrToRight = [];
            this._layoutArrToLeft = [];
        }

        public setUp() {
            if (this._mainUI) {
                return;
            }
            this._mainUI = new ui.main.home.HomeMainUIUI();
            // this._mainUI = new MainUI();
            this._mainUI.mouseThrough = true;
            this._mainUI.mcRightView.mouseThrough = true;
            this._mainUI.mcLeftView.mouseThrough = true;
            this._mainUI.drawCallOptimize = true;
            // this._activityBar = new ActivityBarView();

            // this._activityBar.init(5, 10, 25, 360, 160);
            // this._activityBar.pos(-108, 0);
            // if (!clientCore.GlobalConfig.isIosTest)
            //     this._mainUI.mcRightView.addChild(this._activityBar);
            //按钮布局
            // this._layoutArrToRight.push([this._mainUI.btnMail, this._mainUI.btnAct, this._mainUI.btnCharge]);
            this._layoutArrToRight.push([this._mainUI.btnFirstRecharge, this._mainUI.btnAds, this._mainUI.btnCharge, this._mainUI.btnBaby, this._mainUI.btnTwinkle]);
            this._layoutArrToLeft.push([this._mainUI.btnRainbow, this._mainUI.btnRank]);
            this.layoutBtn();
            //显示礼包
            this._mainUI.btnLimit.visible = GlobalConfig.isPayFunctionOpen && LittleRechargManager.instacne.getRecentArr().length > 0;
            this._mainUI.btnLimit.visible && this.onActiveTimer();
            this._mainUI.txtSuitInfo.style.width = 177;
            this._mainUI.txtSuitInfo.style.height = 40;
            this._mainUI.txtSuitInfo.style.align = 'center';
            this._mainUI.txtSuitInfo.style.valign = 'center';
            this._mainUI.txtSuitInfo.style.font = '汉仪中圆简';
            this._mainUI.txtSuitInfo.style.fontSize = 19;

            this.addEvent();
            this._favorTaskUI = new FavorTaskPanel();
            this._favorTaskUI.pos(-5, 195);
            this._mainUI.mcLeftView.addChild(this._favorTaskUI);

            this._mainUI.ani1.gotoAndStop(0);
            this._mainUI.ani1.wrapMode = Laya.AnimationBase.WRAP_REVERSE;

            this._mainUI.ani2.gotoAndStop(0);
            this._mainUI.imgContactRed.visible = false;

            this._mainUI.ani3.wrapMode = Laya.AnimationBase.WRAP_REVERSE;

            this._mainUI.ani4.wrapMode = Laya.AnimationBase.WRAP_REVERSE;

            BuildQueueManager.init(this._mainUI.listElf);
            this.showUserInfo();
            this.updateWareNum();
            this.onHeadChange();
            this.checkRankOpen();
            this.onCpRedUpdate();
            this.refreshClothTemple();
            this.regLimitActivity();
            this.setConcactBgWidth();
            this.onFunnyToyInfoUpdate();
            this.checkDailyRed();
            clientCore.LimitActivityMgr.awardStateChange();
        }

        private checkDailyRed(): void {
            // MedalManager.getMedal([MedalDailyConst.RECHARGE_AVTIVITY_OPEN]).then((msg: pb.ICommonData[])=>{
            //     this._mainUI.imgActRed.visible = msg[0].value == 0;
            // })
        }

        private onTaskChange() {
            let mainTask = TaskManager.getMainTalkInfo()[0];
            if (mainTask) {
                let xlsInfo = xls.get(xls.taskData).get(mainTask.taskid);
                this._mainUI.boxTask.visible = true;
                this._mainUI.txtTaskTitle.text = xlsInfo.task_title;
                this._mainUI.txtTaskTarget.text = xlsInfo.task_target;
                this._mainUI.txtTaskStep.text = mainTask.step.toString();
                this._mainUI.txtTaskTotal.text = '/' + xlsInfo.task_condition.v3;
            }
            else {
                this._mainUI.boxTask.visible = false;
            }
            this.onMentorRedUpdate();
        }
        private onHeadChange() {
            this._mainUI.btnInfo.skin = LocalInfo.headImgUrl;
            this._mainUI.imgFrame.skin = LocalInfo.frameImgUrl;
        }
        private onTimer() {
            let recentArr = LittleRechargManager.instacne.getRecentArr();
            this._mainUI.btnLimit.visible = GlobalConfig.isPayFunctionOpen && recentArr.length > 0;
            if (recentArr.length > 0) {
                this._mainUI.txtLimitTime.text = util.StringUtils.getDateStr(recentArr[0].leftTime);
            }
            else {
                //没有倒计时了 停止计时器
                Laya.timer.clear(this, this.onTimer);
            }
        }
        private onActiveTimer() {
            Laya.timer.clear(this, this.onTimer);
            Laya.timer.loop(1000, this, this.onTimer);
        }

        private layoutBtn() {
            let fixX = 0;
            for (const arr of this._layoutArrToRight) {
                if (arr.length > 0) {
                    let startX = arr[0].x;
                    let cnt = 0;
                    for (let i = 0; i < arr.length; i++) {
                        let btn = arr[i];
                        if (btn.visible && btn.parent) {
                            fixX = btn.x = startX - cnt * 104;
                            cnt++;
                        }
                    }
                }
            }
            // this._activityBar.fixXChange(252 - fixX + 160);

            for (const arr of this._layoutArrToLeft) {
                if (arr.length > 0) {
                    let startX = arr[0].x;
                    let cnt = 0;
                    for (let i = 0; i < arr.length; i++) {
                        let btn = arr[i];
                        if (btn.visible && btn.parent) {
                            btn.x = startX + cnt * 104;
                            cnt++;
                        }
                    }
                }
            }
            //判断是否显示
            // if (this._openManagerInitOver && this._mainUI.boxLuckyDraw.visible == true) {
            //     this._mainUI.boxLuckyDraw.visible = !SystemOpenManager.ins.checkActOver(5);
            // }
            /**活动开始时间检测 */
            if (this._openManagerInitOver) {
                // if (this._mainUI.btnLibrary.visible == false) {
                //     this._mainUI.btnLibrary.visible = clientCore.LocalInfo.userLv >= 12 && !SystemOpenManager.ins.checkActOver(9);
                //     this._mainUI.libraryRed.visible = this._mainUI.btnLibrary.visible;
                // }
                // else {
                //     if (clientCore.LocalInfo.userLv < 12 || SystemOpenManager.ins.checkActOver(9)) {
                //         this._mainUI.btnLibrary.visible = false;
                //     }
                // }
            }
        }

        private showAdsBtn(url: string) {
            if (!url) {
                this._mainUI.btnAds.visible = false;
            }
            else {
                //没有首充的时候才展示广告按钮
                if (!this._mainUI.btnFirstRecharge.parent) {
                    this._mainUI.btnAds.skin = url;
                    this._mainUI.btnAds.visible = true;
                }
            }
            this.layoutBtn()
        }

        private onMentorRedUpdate() {
            this._mainUI.imgMentorRed.visible = false;
            if (!MentorManager.inited)
                return;
            if (this._mainUI.btnMentor.parent) {
                let needRed: boolean = false;
                //学生
                if (MentorManager.identity == MENTOR_IDENTITY.STUDENT) {
                    //导师给了我物资
                    if (MentorManager.teacher.teacherInfo && MentorManager.teacher.teacherInfo.helpState == MENTOR_HELP_STATE.HELP_OVER)
                        needRed = true;
                    //有任务奖励可领
                    let taskarr = clientCore.TaskManager.getMentorTaskInfo();
                    if (_.filter(taskarr, t => t.state == clientCore.TASK_STATE.COMPLETE).length > 0)
                        needRed = true;
                }
                else if (MentorManager.identity == MENTOR_IDENTITY.TEACHER) {
                    let studenList = MentorManager.student.studentList;
                    //有学生提出物资申请 || 有桃李之心可以领取
                    if (_.filter(studenList, o => o.helpState == MENTOR_HELP_STATE.WAITTING || o.haveReward).length > 0)
                        needRed = true;

                }
                //有申请就红点(如果已经是学生，排除申请的红点)
                if (MentorManager.history.getApplyList().length > 0 && MentorManager.identity != MENTOR_IDENTITY.STUDENT) {
                    needRed = true;
                }
                this._mainUI.imgMentorRed.visible = needRed;
                this.refreshContactRed();
            }
        }

        private onCpRedUpdate() {
            if (this._mainUI.btnCp.parent) {
                let cpMgr = clientCore.CpManager.instance;
                this._mainUI.imgCpRed.visible = cpMgr.applyList.length > 0 || cpMgr.getDivorceAlert() != undefined;
                this.refreshContactRed();
            }
        }

        private onRedChange(id: number | number[]) {
            if (id == 4601) {
                this.refreshClothTemple();
            }
        }

        private refreshContactRed(): void {
            this._mainUI.imgContactRed.visible = this._mainUI.imgMentorRed.visible || this._mainUI.imgCpRed.visible;
        }

        private refreshClothTemple() {
            //挑选对应性别的服装圣殿散件id
            let array = _.filter(xls.get(xls.clothTemple).getValues(), (o) => { return o.type == 1 && (o.sex == clientCore.LocalInfo.sex || o.sex == 0) });
            //按套装分组（同套装priority字段相同）
            let suitDict = _.groupBy(array, o => o.priority);
            let suitArr = _.valuesIn(suitDict);
            //过滤已经收齐的
            suitArr = _.filter(suitArr, o => !clientCore.SuitsInfo.getSuitInfo(xls.get(xls.itemCloth).get(o[0].clothId).suitId).allGet)
            //套装数组按优先级排序
            suitArr = suitArr.sort((a, b) => {
                if (a[0].priority < b[0].priority) {
                    return -1;
                }
                return 1;
            })
            //按顺序找到第一个未开放
            let cantExchangeSuitIdx = _.findIndex(suitArr, o => o => !this.checkTempleOpen(o[0].openRequire));//第一个不能兑换的idx
            let canExchangeSuit = _.find(suitArr, o => this.checkTempleOpen(o[0].openRequire));//当前开放兑换的套装
            let haveSuitNotExchange = cantExchangeSuitIdx != -1 || !_.isUndefined(canExchangeSuit);//是否还有衣服可以兑换(不管当前是否解锁)
            this._mainUI.boxTemple.visible = haveSuitNotExchange && clientCore.LocalInfo.userLv >= 3;
            BC.removeEvent(this, this._mainUI.boxTemple, Laya.Event.CLICK);
            //如果没有全部兑换完
            if (haveSuitNotExchange) {
                //当前有解锁的套装
                this._mainUI.boxTemple.skin = 'main/clothtemplelabel1.png';
                //如果有能兑换的套装 显示信息
                if (canExchangeSuit) {
                    let canMakeIdx = _.findIndex(canExchangeSuit, o => this.checkCanMake(o));
                    if (canMakeIdx > -1) {
                        this._mainUI.boxTemple.skin = 'main/clothtemplelabel2.png';
                    }
                    let suitId = xls.get(xls.itemCloth).get(canExchangeSuit[0].clothId).suitId;
                    let suitInfo = clientCore.SuitsInfo.getSuitInfo(suitId);
                    this._mainUI.txtSuitInfo.innerHTML = util.StringUtils.getColorText3(`${suitInfo.suitInfo.name}<br>{${suitInfo.hasCnt}}/${suitInfo.clothes.length}`, '#7a5329', '#ff0000');
                    BC.addEvent(this, this._mainUI.boxTemple, Laya.Event.CLICK, this, this.onTemple);
                }
                else {
                    //尚无套装解锁，显示下一个解锁条件
                    let nextSuit = suitArr[cantExchangeSuitIdx];
                    let txt = '';
                    for (const require of nextSuit[0].openRequire) {
                        if (require.v1 == 1) {
                            txt = `等级达到${require.v2}级后`
                        }
                    }
                    this._mainUI.txtSuitInfo.innerHTML = util.StringUtils.getColorText3(`${txt}<br>解锁下一套服装`, '#7a5329', '#7a5329')
                    BC.addEvent(this, this._mainUI.boxTemple, Laya.Event.CLICK, this, this.onNotExp);
                }
            }
        }

        private onTemple() {
            clientCore.ModuleManager.open('familyTailor.FamilyTailorModule');
        }

        private onNotExp() {
            alert.alertExpNotEnough();
        }

        /** 检查服装圣殿是否已开启*/
        private checkTempleOpen(openRequire: xls.pair[]): boolean {
            let len: number = openRequire.length;
            let isOpen: boolean = true;
            for (let i: number = 0; i < len; i++) {
                let element: xls.pair = openRequire[i];
                if (element.v1 == 2) {
                    let rtn = clientCore.SuitsInfo.getSuitInfo(element.v2);
                    isOpen = isOpen && rtn.allGet;
                }
                else if (element.v1 == 1) {
                    let playerLv: number = clientCore.LocalInfo.userLv;
                    isOpen = isOpen && playerLv >= element.v2;
                }
            }
            return isOpen;
        }

        private checkCanMake(xlsData: xls.clothTemple) {
            //已有了就不可制作
            if (clientCore.LocalInfo.checkHaveCloth(xlsData.clothId))
                return false;
            for (const needItem of xlsData.materials) {
                if (clientCore.ItemsInfo.getItemLackNum({ itemID: needItem.v1, itemNum: needItem.v2 }) > 0) {
                    return false;
                }
            }
            return true;
        }

        private onLimitActRedChange(show: boolean) {
            this._mainUI.imgHaveAwardGet.visible = show;
        }

        private onResize(): void {
            this._mainUI.mcRightView.x = Laya.stage.width;
        }

        private onFunnyToyInfoUpdate() {
            let propClearNum = 0;
            let now = clientCore.ServerManager.curServerTime;
            for (const info of LocalInfo.srvUserInfo.propStampInfo) {
                if (now <= info.clearPropStamp) {
                    propClearNum += 1;
                }
            }
            this._mainUI.btnFunnyClear.visible = propClearNum > 0;
            this._mainUI.txtFunnyClearNum.text = propClearNum.toString();
        }

        private addEvent() {
            EventManager.on(globalEvent.FUNNY_TOY_INFO_UPDATE, this, this.onFunnyToyInfoUpdate);
            //适配
            EventManager.on(globalEvent.STAGE_RESIZE, this, this.onResize);
            //显示活动按钮红点
            EventManager.on(globalEvent.HAVE_COMMONAWARD_TO_GET, this, this.onLimitActRedChange);
            EventManager.on(globalEvent.PRODUCE_GET_PRODUCTION_SUCC, this, this.onGetProducts);
            EventManager.on(globalEvent.BACKPACK_UPGRADE, this, this.updateWareNum);
            EventManager.on(globalEvent.TASK_STATE_CHANGE, this, this.onTaskChange);
            EventManager.on(globalEvent.USER_HEAD_IMAGE_CHANGE, this, this.onHeadChange);
            EventManager.on(UIManager.CHANGE_HOME_BTN, this, this.changeBtns);
            EventManager.on(globalEvent.ACTIVE_UI_TIMER, this, this.onActiveTimer);
            EventManager.on(globalEvent.SHOW_ADS_BTN, this, this.showAdsBtn);
            //导师系统红点
            EventManager.on(globalEvent.MENTOR_HELP_CHANGE, this, this.onMentorRedUpdate);
            EventManager.on(globalEvent.MENTOR_IDENTITY_CHANGE, this, this.onMentorRedUpdate);
            EventManager.on(globalEvent.MENTOR_APPLY_LIST_CHANGE, this, this.onMentorRedUpdate);
            EventManager.on(globalEvent.MENTOR_TASK_CHANGE, this, this.onMentorRedUpdate);
            EventManager.on(globalEvent.MENTOR_STUEND_LIST_CHANGE, this, this.onMentorRedUpdate);
            EventManager.on(globalEvent.MENTOR_UPDATE_MAINUI_RED, this, this.onMentorRedUpdate);
            EventManager.on(globalEvent.MENTOR_HAVE_GIFT, this, this.onMentorRedUpdate);
            //CP系统红点
            EventManager.on(globalEvent.CP_APPLY_LIST_UPDATE, this, this.onCpRedUpdate);
            EventManager.on(globalEvent.CP_INFO_UPDATE, this, this.onCpRedUpdate);
            EventManager.on(globalEvent.CP_DIVORCE_ALERT, this, this.onCpRedUpdate);
            BC.addEvent(this, EventManager, globalEvent.RED_POINT_CHANGED, this, this.onRedChange);
            BC.addEvent(this, EventManager, globalEvent.RED_POINT_CHANGED_BY_NOTICE, this, this.refreshClothTemple);
            BC.addEvent(this, EventManager, globalEvent.USER_LEVEL_UP, this, this.refreshClothTemple);

            this._mainUI.btnFunnyClear.on(Laya.Event.CLICK, this, this.onClick);
            //是否关闭付费功能
            this._mainUI.btnCharge.visible = GlobalConfig.isPayFunctionOpen;
            this._mainUI.btnVipPet.visible = GlobalConfig.isPayFunctionOpen;
            // this._mainUI.btnSun.on(Laya.Event.CLICK, this, this.onClick);
            // this._mainUI.btnThree.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnFunny.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnMentor.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnCp.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnAds.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnChange.on(Laya.Event.CLICK, this, this.onBtnChangeClick);
            this._mainUI.listElf.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnCharge.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnLimit.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnTask.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnFriend.on(Laya.Event.CLICK, this, this.onClick)
            this._mainUI.btnVipPet.on(Laya.Event.CLICK, this, this.onClick)
            this._mainUI.btnTask.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnTrain.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnCloth.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnInfo.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnShop.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnAdventure.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnOrder.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.boxWareIcon.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnEdit.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnProduce.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnBless.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnRoleRelation.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnRoleTrain.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnFamily.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.boxWareIcon.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnWorldMap.on(Laya.Event.CLICK, this, this.onClick)
            this._mainUI.btnAct.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnMail.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnCollect.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnFirstRecharge.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnLimitAc.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnTwinkle.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnBaby.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnRank.on(Laya.Event.CLICK, this, this.onClick);
            // this._mainUI.btnEvent.on(Laya.Event.CLICK, this, this.onClick);
            // this._mainUI.boxLuckyDraw.visible = false;
            this._mainUI.btnContact.on(Laya.Event.CLICK, this, this.onContact);
            this._mainUI.btnBamboo.on(Laya.Event.CLICK, this, this.onClick);
            this._mainUI.btnOnOff.on(Laya.Event.CLICK, this, this.onBtnOnOffClick);
            EventManager.on(globalEvent.SYSTEM_OPEN_CHANGED, this, this.setConcactBgWidth);
            EventManager.on(globalEvent.CHANGE_USER_NICK, this, this.userNickChange);

            EventManager.on(globalEvent.CHECK_RAINBOW, this, this.onRainbow);
            EventManager.on(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
            EventManager.on(globalEvent.SYSTEM_OPEN_MANAGER_INIT_COMPLETE, this, this.onSystemOpenInitCom);
            EventManager.on(globalEvent.UPDATE_LIMIT_ACTIVITY_RED, this, this.regLimitActivity);
            EventManager.on(globalEvent.FLOWER_PET_VIP_CHANGE_NOTICE, this, this.updateFlowerPet);
            EventManager.on(globalEvent.ENTER_GEME, this, this.updateFlowerPet);
            EventManager.on("check_rank_open", this, this.checkRankOpen);

            //临时加的打开布置
            EventManager.on("OPEN_EDIT_PANEL", this, this.openEdit);

        }

        private openEdit(){
            MapEditorManager.getInstance().showUI(2, 'ui');
        }

        private onSystemOpenInitCom(e: Laya.Event) {
            /**这个判断抽奖活动是否开启，放到彩虹查询事件里面，因为彩虹查询事件实在进入游戏才开始的
                        * 而这个判断如果放在init里面，会出现SystemOpenManager还没初始化的情况
                        */
            this._openManagerInitOver = true;
            // this._mainUI.boxLuckyDraw.visible = !SystemOpenManager.ins.checkActOver(5);
            // this._mainUI.btnThree.visible = this._mainUI.btnThree.visible && !SystemOpenManager.ins.checkActOver(8);
            // this._mainUI.btnSun.visible = this._mainUI.btnSun.visible && !SystemOpenManager.ins.checkActOver(10);
            // this._mainUI.btnLibrary.visible = this._mainUI.btnLibrary.visible && !SystemOpenManager.ins.checkActOver(9);
            // if (this._mainUI.btnLibrary.visible) {
            //     MedalManager.getMedal([MedalConst.REBUILD_LIBRARY_RED]).then((data: pb.ICommonData[]) => { this._mainUI.libraryRed.visible = data[0].value == 0; })
            // }

            this.checkRankOpen();
        }
        /**
         * 注册限时活动红点啦
         */
        private regLimitActivity(): void {
            let litteRed: number[] = [];
            _.forEach(xls.get(xls.limitActivity).getValues(), (element: xls.limitActivity) => {
                let ret: number = LimitActivityMgr.checkActivity(element);
                ret == 1 && (litteRed = _.concat(litteRed, element.littleRed));
            });
            this._mainUI.btnLimitAc.redPointArr = litteRed;
        }
        private setConcactBgWidth() {
            let systems: number[] = [17, 58, 117, 45];
            let value: number = 368;
            _.forEach(systems, (element: number) => {
                SystemOpenManager.ins.getIsOpen(element) == false && (value -= 75);
            })
            this._mainUI.imgBg.width = value;
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "selfHomeUI") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (this._mainUI[objName]) {
                    //是导师的话 展开社交
                    objName == 'btnMentor' && this._contactBtnState == 1 && this._mainUI.ani2.gotoAndStop(this._mainUI.ani2.count);
                    var obj: any;
                    obj = this._mainUI[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
            }
        }
        private onClick(e: Laya.Event) {
            if (!UIManager.enabledBtns)
                return;
            // 修改by chen 4.15.2019
            switch (e.currentTarget) {
                case this._mainUI.btnFunnyClear:
                    this.sendLog('点击奇趣道具消除按钮')
                    FunnyToyManager.openClearModule();
                    break;
                case this._mainUI.btnFunny:
                    this.sendLog('点击奇趣道具按钮')
                    clientCore.ModuleManager.open('weddingItem.WeddingItemModule')
                    break;
                case this._mainUI.btnCp:
                    this.sendLog('点击花缘按钮')
                    this.onContact();
                    clientCore.ToolTip.gotoMod(110);
                    break;
                case this._mainUI.btnMentor:
                    this.sendLog('点击导师按钮')
                    this.onContact();
                    if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "UIMentorIconClick") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    MentorManager.openMentorSystem();
                    break;
                case this._mainUI.btnAds:
                    this.sendLog('点击首充广告按钮')
                    let id = this._mainUI.btnAds.skin.split('_')[1].split('.')[0];//匹配其中的数组
                    ModuleManager.open('loginAds.LoginAdsModule', id);
                    break;
                case this._mainUI.listElf:
                    this.sendLog('点击精灵能量按钮')
                    ModuleManager.open('elfEnergy.ElfEnergyModule');
                    break;
                case this._mainUI.btnBamboo:
                    this.sendLog('点击幸运竹按钮')
                    this.onContact();
                    ModuleManager.open("luckyBamboo.LuckyBambooInfoModule");
                    break;
                case this._mainUI.btnCharge:
                    // if(this._mainUI.imgActRed.visible){
                    //     this._mainUI.imgActRed.visible = false;
                    //     MedalManager.setMedal([{id: MedalDailyConst.RECHARGE_AVTIVITY_OPEN,value: 1}]);
                    // }

                    this.sendLog('点击活动礼包按钮')
                    ModuleManager.open("rechargeActivity.RechargeActivityModule");
                    break;
                case this._mainUI.btnLimit:
                    this.sendLog('点击活动按钮')
                    ModuleManager.open("littleCharge.LittleChargeModule");
                    break;
                case this._mainUI.btnVipPet:
                    this.sendLog('点击花宝按钮')
                    ModuleManager.open("flowerPet.FlowerPetModule");
                    break;
                case this._mainUI.btnTask:
                    this.sendLog('点击任务按钮')
                    if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "UITaskIconClick") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    clientCore.ModuleManager.open('task.TaskModule');
                    break;
                case this._mainUI.btnCollect:
                    this.sendLog('点击收藏按钮')
                    ModuleManager.open('collection.CollectionModule');
                    break;
                case this._mainUI.btnAct:
                    this.sendLog('点击活动按钮')
                    ModuleManager.open('activity.ActivityModule');
                    if (GuideMainManager.instance.curGuideInfo.operationBehavior == "clickActIcon") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    break;
                case this._mainUI.btnTrain:
                    this.sendLog('点击试炼按钮')
                    ModuleManager.open('adventureAct.AdventureActModule');
                    util.RedPoint.updateAdd([], [100001]);
                    break;
                case this._mainUI.btnCloth:
                    this.sendLog('点击装扮按钮')
                    if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "UIClothIconClick") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    clientCore.ModuleManager.open('clothChange.ClothChangeModule');
                    break;
                case this._mainUI.btnInfo:
                    this.sendLog('点击个人信息（玩家头像）按钮')
                    clientCore.ModuleManager.open('selfInfo.SelfInfoModule');
                    break;
                case this._mainUI.btnShop:
                    this.sendLog('点击商店街按钮')
                    if (GuideMainManager.instance.curGuideInfo.operationBehavior == "UIShopIconClick") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    ModuleManager.open("shoppingMall.ShoppingMallModule");
                    break;
                case this._mainUI.btnAdventure:
                    this.sendLog('点击剧情按钮')
                    if (GuideMainManager.instance.curGuideInfo.operationBehavior == "UIAdventureIconClick") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    clientCore.ModuleManager.open('adventure.AdventureModule');
                    break;
                case this._mainUI.btnBless:
                    this.sendLog('点击神树按钮')
                    if (GuideMainManager.instance.curGuideInfo.operationBehavior == "UISpiritTreeIconClick") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    clientCore.ModuleManager.open('spirittree.SpirittreeModule');
                    break;
                case this._mainUI.btnRoleRelation:
                    this.sendLog('点击羁绊按钮')
                    if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "UIRoleRelationIconClick") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    clientCore.ModuleManager.open('roleChain2.RoleChainModule');
                    break;
                case this._mainUI.btnRoleTrain:
                    this.sendLog('点击队伍按钮')
                    if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "UIRoleTrainIconClick") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    clientCore.ModuleManager.open("formation.FormationModule");
                    break;
                case this._mainUI.btnProduce:
                    this.sendLog('点击生产按钮')
                    if (GuideMainManager.instance.curGuideInfo.operationBehavior == "UIProduceIconClick") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    clientCore.ModuleManager.open('produce.ProduceModule');
                    break;
                case this._mainUI.btnOrder:
                    this.sendLog('点击订单按钮')
                    if (GuideMainManager.instance.curGuideInfo.operationBehavior == "UIOrderIconClick") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    clientCore.ModuleManager.open('orderSystem.OrderSystemModule');
                    break;
                case this._mainUI.btnEdit:
                    this.sendLog('点击布置按钮')
                    if (MapInfo.isSelfHome) {
                        MapEditorManager.getInstance().showUI(0, 'ui');
                        if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "UIEditIconClick") {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        }
                    }
                    else
                        alert.showFWords('不是自己家园!');
                    break;
                case this._mainUI.boxWareIcon:
                    this.sendLog('点击仓库按钮')
                    ModuleManager.open("backpack.BackpackModule");
                    this.hideWareIconAni();
                    break;
                case this._mainUI.btnWorldMap:
                    this.sendLog('点击世界地图按钮')
                    ModuleManager.open("worldMap.WorldMapModule");
                    if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSelfUIWorldMapBtn") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    break;
                case this._mainUI.btnFriend:
                    this.sendLog('点击好友按钮')
                    ModuleManager.open("friends.FriendMainModule");
                    break;
                case this._mainUI.btnFamily:
                    this.sendLog('点击家族按钮')
                    this.onContact();
                    FamilyMgr.ins.openFamily();
                    break;
                case this._mainUI.btnMail:
                    this.sendLog('点击邮箱按钮')
                    ModuleManager.open("mail.MailModule");
                    break;
                case this._mainUI.btnFirstRecharge:
                    this.sendLog('点击邮箱按钮')
                    ModuleManager.open("firstRechargeGift.FirstRechargeGift");
                    break;
                case this._mainUI.btnRank:
                    ModuleManager.open("rank.RankModule");
                    break;
                case this._mainUI.btnLimitAc:
                    clientCore.Logger.sendLog('系统', '主UI按钮触达', '点击限时按钮');
                    ModuleManager.open('newActivity.NewActivityModule');
                    break;
                case this._mainUI.btnTwinkle:
                    ModuleManager.open('twinkleTransfg.TwinkleTransfgModule');
                    break;
                case this._mainUI.btnBaby:
                    // ModuleManager.open("rechargeActivity.RechargeActivityModule","flowerPet");
                    ModuleManager.open("flowerPet.FlowerPetModule");
                    break;
                // case this._mainUI.btnEvent://偶尔的活动广告
                //     ModuleManager.open("loginAds.LoginQcsModule");
                //     break;
                default:
                    break;
            }
        }

        //-------------------收取作物的动效相关-------------------------------------------------------
        WARE_SHOW_X: number = 20;//icon展示时的x坐标
        WARE_HIDE_X: number = -100;//icon收起时的坐标
        TIME: number = 300;//icon动画总时间

        private async onGetProducts(build: MapItemInfo, items: Array<pb.IItem>, rareItems: Array<pb.IItem>) {
            LayerManager.alertLayer.addChild(this._mainUI.boxWareIcon);
            await this.showWareIconAni();
            let pos = MapInfo.calPositionByRowAndCol(build.mapPosRow, build.mapPosCol);
            MapManager.mapItemsLayer.localToGlobal(pos);
            //如果多个奖励 统一显示5个动画
            if (items && items.length >= 1) {
                let id = items[0].id;
                res.load(ItemsInfo.getItemIconUrl(id)).then(() => {
                    let cnt = items[0].cnt;
                    this.getProductImg(cnt, pos, id);
                });
            }
            this.updateWareNum();

            // 珍稀道具展现效果
            if (rareItems && rareItems.length > 0) {
                _.forEach(rareItems, (element: pb.IItem) => {
                    alert.showSpecialItem(element.id, element.cnt, pos, 2);
                })
            }

            if (!MaterialBagManager.isWareHouseFull)
                this.hideWareIconAni();
        }

        private getProductImg(cnt: number, pos: Laya.Point, id: number) {
            for (let i = 0; i < (cnt > 1 ? 5 : 1); i++) {
                let icon = new Laya.Image(ItemsInfo.getItemIconUrl(id));
                icon.anchorX = icon.anchorY = 0.5;
                icon.pos(pos.x, pos.y);
                this.flyProduct(icon, 60 * i);
            }
        }
        private updateWareNum() {
            let allitems = MaterialBagManager.getAllItems();
            allitems = _.filter(allitems, o => o.xlsInfo.show == 0);
            let nowNum = _.reduce(allitems, (sum, value) => {
                return sum + value.goodsInfo.itemNum;
            }, 0);
            let total = clientCore.LocalInfo.pkgSize;
            let per = _.clamp(nowNum / total, 0, 1);
            this._mainUI.txtMaterialNum.text = nowNum + "/" + total;
            this._mainUI.imgProgressMask.y = 57 * (1 - per);
            let perArr = [0.01, 0.25, 0.75, 0.95];
            let idx = Math.max(0, _.findIndex(perArr, (i) => {
                return per < i;
            }) - 1);
            let perArr2 = [0.3, 0.75, 0.95];
            let idx2 = _.findIndex(perArr2, (i) => {
                return per < i;
            })
            this._mainUI.imgPro.skin = `main/proUp${idx2}.png`;
        }
        private async showWareIconAni() {
            Laya.Tween.clearAll(this._mainUI.boxWareIcon);
            let per = (this.WARE_SHOW_X - this._mainUI.boxWareIcon.x) / (this.WARE_SHOW_X - this.WARE_HIDE_X);
            return new Promise((ok) => {
                Laya.Tween.to(this._mainUI.boxWareIcon, { x: this.WARE_SHOW_X }, this.TIME * per, Laya.Ease.cubicIn, new Laya.Handler(this, ok));
            });
        }
        private hideWareIconAni() {
            let per = (this._mainUI.boxWareIcon.x - this.WARE_HIDE_X) / (this.WARE_SHOW_X - this.WARE_HIDE_X);
            Laya.Tween.to(this._mainUI.boxWareIcon, { x: this.WARE_HIDE_X }, this.TIME * per, Laya.Ease.cubicOut, new Laya.Handler(this, () => {
                this._mainUI.addChild(this._mainUI.boxWareIcon);
            }), 2000);
        }
        private flyProduct(icon: Laya.Image, delay: number) {
            LayerManager.upMainLayer.addChild(icon);
            Laya.Tween.to(icon, { x: 66, y: 350, scaleX: 0.5, scaleY: 0.5 }, 700, Laya.Ease.sineInOut, new Laya.Handler(this, () => {
                icon.destroy();
            }), delay);
        }

        /**------------------------------------ end ----------------------------------------- */

        private userNickChange(e: Laya.Event) {
            this.showUserInfo();
        }
        public showUserInfo() {
            this._mainUI.txtNick.text = LocalInfo.userInfo.nick;
            let expInfo = LocalInfo.getLvInfo();
            this._mainUI.txtUserLevel.text = expInfo.lv.toString();
            this._mainUI.expMask.x = (expInfo.expPercent - 1) * this._mainUI.expMask.width;
            this._mainUI.txtExp.text = "" + expInfo.currExp + "/" + (expInfo.nextLvNeed + expInfo.currExp);
        }
        private checkAllContact(): boolean {
            let array: number[] = [17, 58, 45];
            for (let i: number = 0; i < 3; i++) {
                if (SystemOpenManager.ins.getIsOpen(array[i])) return true;
            }
            return false;
        }
        private onContact(e?: Laya.Event): void {
            if (e && e.type == Laya.Event.MOUSE_DOWN && e.target.name == 'tag_1') return;
            clientCore.Logger.sendLog('系统', '主UI按钮触达', '点击社交按钮');
            if (this._contactBtnState == 1) {
                if (!this.checkAllContact()) {
                    alert.showFWords(`社交功能尚未解锁哦~`);
                    return;
                }
                this._mainUI.ani2.wrapMode = Laya.AnimationBase.WRAP_POSITIVE;
                this._contactBtnState = 0;
                this._mainUI.ani2.once(Laya.Event.COMPLETE, this, () => {
                    Laya.stage.once(Laya.Event.MOUSE_DOWN, this, this.onContact);
                })
            } else {
                this._mainUI.ani2.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
                this._contactBtnState = 1;
            }
            this._mainUI.ani2.play(0, false);
        }

        private onBtnChangeClick() {
            this.changeBtns();
            if (GuideMainManager.instance.curGuideInfo.operationBehavior == "UIChangeIconClick") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }
        private changeBtns() {
            if (this._mainUI.ani1.wrapMode == Laya.AnimationBase.WRAP_POSITIVE) {
                if (this._mainUI.ani4.wrapMode == Laya.AnimationBase.WRAP_POSITIVE) {
                    this._mainUI.ani4.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
                    this._mainUI.ani4.play(0, false);
                }
                this._mainUI.ani1.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
                this._homeBtnState = 1;
            }
            else {
                if (this._mainUI.ani3.wrapMode == Laya.AnimationBase.WRAP_POSITIVE) {
                    this._mainUI.ani3.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
                    this._mainUI.ani3.play(0, false);
                }
                this._mainUI.ani1.wrapMode = Laya.AnimationBase.WRAP_POSITIVE;
                this._homeBtnState = 0;
            }
            this._mainUI.ani1.play(0, false);
        }
        public getHomeBtnState(): number {
            return this._homeBtnState;
        }

        private onBtnOnOffClick() {
            if (this._mainUI.ani1.wrapMode == Laya.AnimationBase.WRAP_REVERSE) {
                if (this._mainUI.ani3.wrapMode == Laya.AnimationBase.WRAP_POSITIVE) {
                    this._mainUI.ani3.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
                }
                else {
                    this._mainUI.ani3.wrapMode = Laya.AnimationBase.WRAP_POSITIVE;
                }
                this._mainUI.ani3.play(0, false);
            }
            else {
                if (this._mainUI.ani4.wrapMode == Laya.AnimationBase.WRAP_POSITIVE) {
                    this._mainUI.ani4.wrapMode = Laya.AnimationBase.WRAP_REVERSE;
                }
                else {
                    this._mainUI.ani4.wrapMode = Laya.AnimationBase.WRAP_POSITIVE;
                }
                this._mainUI.ani4.play(0, false);
            }
        }

        public open() {
            // TODO 先不处理啦~
            LayerManager.uiLayer.addChild(this._mainUI);
            UIManager.showTalk();
            this.showUserInfo();
            this.onResize();
            // Laya.timer.loop(500, this, this.layoutBtn);
        }

        public close() {
            this._mainUI.removeSelf();
            // Laya.timer.clear(this, this.layoutBtn);
        }

        // public isHide() {
        //     return !this._mainUI.parent;
        // }

        public hide() {
            Laya.Tween.to(this._mainUI, { alpha: 0 }, 200);
            this._mainUI.mouseEnabled = false;
        }
        public show() {
            Laya.Tween.clearAll(this._mainUI);
            Laya.Tween.to(this._mainUI, { alpha: 1 }, 200);
            this._mainUI.mouseEnabled = true;
        }

        private sendLog(str: string) {
            clientCore.Logger.sendLog('系统', '主UI按钮触达', str);
        }

        /****  以下操作彩虹相关*/

        private _rainbowUI: ui.main.RainbowInfoUI;
        private _duration: number;
        private async onRainbow(force?: boolean) {
            let rainInfo: RainbowInfo = clientCore.LocalInfo.rainbowInfo;
            let isShow: boolean = rainInfo.duration > 0;

            if (force) {
                ModuleManager.open("rainbow.RainbowModule");
            } else {
                // 彩虹未开启 并且即将开始,并且新手强制引导结束，并且回归强弹结束
                let result = await clientCore.MedalManager.getMedal([MedalConst.WELCOME_BACK_OPEN_TWO]);
                if (!this._mainUI.btnRainbow.visible && isShow && !GuideMainManager.instance.isGuideAction && result[0].value == 1) {
                    await util.TimeUtil.awaitTime(500);
                    ModuleManager.open("rainbow.RainbowModule");
                }
            }

            this._mainUI.btnRainbow.visible = isShow;
            Laya.timer.clear(this, this.rainbowTime);
            if (isShow) {
                this._duration = rainInfo.duration;
                Laya.timer.loop(1000, this, this.rainbowTime);
                BC.addEvent(this, this._mainUI.btnRainbow, Laya.Event.CLICK, this, this.onRainbowClick);
            } else {
                BC.removeEvent(this, this._mainUI.btnRainbow, Laya.Event.CLICK, this, this.onRainbowClick);
            }
        }

        private rainbowTime(): void {
            if (this._duration-- <= 0) {
                Laya.timer.clear(this, this.rainbowTime);
                this._mainUI.btnRainbow.visible = false;
                if (this._rainbowUI && this._rainbowUI.parent) {
                    DialogMgr.ins.close(this._rainbowUI);
                }
                return;
            }
            clientCore.LocalInfo.rainbowInfo.duration = this._duration;
            let timeStr: string = util.StringUtils.getDateStr(this._duration);
            this._mainUI.txRainbowTime.changeText(timeStr);
            this._rainbowUI && this._rainbowUI.parent && this._rainbowUI.txTime.changeText(timeStr);
        }

        private onRainbowClick(): void {
            this._rainbowUI = this._rainbowUI || new ui.main.RainbowInfoUI();
            this._rainbowUI.btnClose.clickHandler = this._rainbowUI.btnSure.clickHandler = Laya.Handler.create(this, function (): void {
                this._rainbowUI.clickHandler = this._rainbowUI.btnSure.clickHandler = null;
                DialogMgr.ins.close(this._rainbowUI);
            })
            DialogMgr.ins.open(this._rainbowUI);
        }


        //-----------------排行榜

        private _rankT: time.GTime;
        private _dis: number;
        private _closed: boolean;

        private checkRankOpen(): void {

            let isOpen = SystemOpenManager.ins.getIsOpen(35);
            if (!isOpen) {
                this._mainUI.btnRank.visible = false;
                return;
            }

            this._closed = false;
            this._dis = clientCore.RankManager.ins.checkActivity();
            let isShow: boolean = this._dis > 0 || clientCore.RankManager.ins.checkHide() > 0;
            this._mainUI.btnRank.visible = isShow;
            if (isShow) {
                if (this._dis <= 0) {
                    this._closed = true;
                    this._mainUI.btnRank.skin = "main/btn_rank_close.png";
                    this._mainUI.txRank.visible = false;
                }
                this._rankT?.dispose();
                this._rankT = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
                this._rankT.start();
            }
        }


        private onTime(): void {
            if (this._dis <= 0 && clientCore.RankManager.ins.checkHide() <= 0) {
                this._rankT?.dispose();
                this._mainUI.btnRank.visible = false;
                return;
            }

            if (this._dis > 0) {
                let dis: number = this._dis;
                let d: number = Math.floor(dis / 86400);
                dis -= (d * 86400);
                let h = Math.floor(dis / 3600);
                this._mainUI.txRank.changeText(`${d}天${h}时`);
            } else if (!this._closed) {
                this._closed = true;
                this._mainUI.btnRank.skin = "main/btn_rank_close.png";
                this._mainUI.txRank.visible = false;
            }
        }

        //花宝新增
        private updateFlowerPet(): void {
            let type: number = FlowerPetInfo.petType;
            if (type >= 3) {
                this._mainUI.btnBaby.visible = false;
                this.layoutBtn();
                return;
            }
            this._mainUI.btnBaby.skin = `main/baby_${_.clamp(type + 1, 1, 3)}.png`;
        }
    }
}