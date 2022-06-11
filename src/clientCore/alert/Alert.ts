namespace alert {
    export enum Btn_Type {
        /**只有一个确定按钮 */
        ONLY_SURE,
        /**确定和取消两个按钮 */
        SURE_AND_CANCLE
    }

    export interface AlertOption {
        callBack?: CallBack;
        btnType?: Btn_Type,
        needMask?: boolean,
        needClose?: boolean,
        clickMaskClose?: boolean,
        /**vip加成，如果没有就传0，里面会判断是否置灰 */
        vipAddPercent?: number
    }

    export interface CallBack {
        funArr: Function[];
        caller: any
    }

    export interface IDrawRewardInfo {
        id: number,
        num: number,
        /** 是否分解*/
        decomp?: boolean,
        decompId?: number,
        decompNum?: number
    }

    const DefaultAlertOpt: AlertOption = {
        callBack: null,
        btnType: Btn_Type.SURE_AND_CANCLE,
        needMask: true,
        clickMaskClose: true,
        needClose: true,
    }


    export function showSmall2(txt: string, handler: Laya.Handler): void {
        let view = new ui.alert.SmallAlertUI();
        view.btnClose.once(Laya.Event.CLICK, this, () => {
            clientCore.DialogMgr.ins.close(view);
        });
        view.btnCancle.once(Laya.Event.CLICK, this, () => {
            clientCore.DialogMgr.ins.close(view);
        });
        view.btnSure.once(Laya.Event.CLICK, this, () => {
            clientCore.DialogMgr.ins.close(view);
            handler?.run();
        });
        view.txt.text = txt;
        clientCore.DialogMgr.ins.open(view);
    }


    export function showSmall(txt: string, opt: AlertOption = DefaultAlertOpt) {
        //option mergeD
        opt = _.assignIn(_.cloneDeep(DefaultAlertOpt), opt);
        //set ui by option
        // let view = new ui.alert.SmallAlertUI();
        let view: SmallAlert = new SmallAlert();
        // view.centerX = view.centerY = 0;
        view.txt.text = txt ? txt : '';
        view.pivot(view.width / 2, view.height / 2);
        view.scale(0.1, 0.1);
        view.onResize();
        Laya.Tween.to(view, { scaleX: 1, scaleY: 1 }, 400, Laya.Ease.backOut, Laya.Handler.create(this, () => {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "alertShowSmall") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, view.btnSure);
            }
        }));
        if (opt.btnType == Btn_Type.ONLY_SURE) {
            view.btnCancle.removeSelf();
            view.btnSure.centerX = 0;
        }
        if (opt.needMask) {
            createMaskUnderPanel(view, opt.callBack, opt.clickMaskClose);
        }
        let funArr = [];
        let caller = null;
        if (opt.callBack) {
            funArr = opt.callBack.funArr;
            caller = opt.callBack.caller;
        }
        //event
        view.btnSure.once(Laya.Event.CLICK, this, () => {
            view.removeSelf();
            removeAllEvent(view);
            if (funArr && funArr[0]) {
                funArr[0].call(caller);
            }
        });
        view.btnCancle.once(Laya.Event.CLICK, this, () => {
            view.removeSelf();
            removeAllEvent(view);
            if (funArr && funArr[1]) {
                funArr[1].call(caller);
            }
        });
        view.btnClose.visible = opt.needClose;
        if (opt.needClose) {
            view.btnClose.once(Laya.Event.CLICK, this, () => {
                view.removeSelf();
                removeAllEvent(view);
                if (funArr && funArr[1]) {
                    funArr[1].call(caller);
                }
            });
        }
        clientCore.LayerManager.alertLayer.addChild(view);
        return view;

    }
    export function closeShowSmall(view: ui.alert.SmallAlertUI) {
        view.removeSelf();
        removeAllEvent(view);
    }

    /**
    * 上浮提示文字
    * @param context 
    * @param x 
    * @param y 
    */
    export function showFWords(context: string, x?: number, y?: number): void {
        if (!context || context == "")
            return;
        if (!FloatingWords.moveing) {
            creFWords(context, x, y);
            FloatingWords.moveing = true;
            Laya.timer.once(800, null, function (): void {
                FloatingWords.moveing = false;
                let list: any = FloatingWords.contextArr.pop();
                list && showFWords(list[0], list[1], list[2]);
                list = null;
            });
            Laya.timer.clear(null, forceRemoveFWords);
            Laya.timer.once(5000, null, forceRemoveFWords);
        } else {
            FloatingWords.contextArr.push([context, x, y]);
        }
    }
    /** 有文字卡在界面中间情况 */
    function forceRemoveFWords() {
        console.log("force clear run!!!");
        let num = clientCore.LayerManager.alertLayer.numChildren;
        for (let i = num - 1; i >= 0; i--) {
            let item = clientCore.LayerManager.alertLayer.getChildAt(i);
            if (item instanceof FloatingWords) {
                item.clear();
            }
        }
    }

    function creFWords(context: string, x: number, y: number): void {
        let tip: FloatingWords = FloatingWords.create();
        tip.init(context, x, y);
        clientCore.LayerManager.alertLayer.addChild(tip);
    }

    /**滚动提示文字,使用前可以用setScrollStyle设置样式，若不设置则是默认 */
    export function showScrollWords(str: string) {
        if (!clientCore.GlobalConfig.needNotice) return;
        alert.ScrollWords.ins.setDefaultStyle();
        alert.ScrollWords.ins.show(str);
    }

    /**滚动提示文字带样式*/
    export function showWordsWithStyle(str: string, style: IScrollStyle) {
        if (!clientCore.GlobalConfig.needNotice) return;
        alert.ScrollWords.ins.setStyle(style);
        alert.ScrollWords.ins.show(str);
    }

    /** 世界跑马灯*/
    export function showWorlds(info: ScrollWordInfo): void {
        if (!clientCore.GlobalConfig.needNotice) return;
        alert.ScrollWords2.instance.showTxt(info)
    }
    export function stopWorlds(sign?: Sign): void {
        alert.ScrollWords2.instance.stopWords(sign);
    }

    export function showTestNotice(): void {
        for (let i: number = 0; i < 3; i++) {
            let info: alert.ScrollWordInfo = new alert.ScrollWordInfo();
            info.bgPath = 'res/alert/worldNotice/108.png';
            info.width = 752;
            info.y = 25;
            info.value = `喜报！Gaaam在米米奇的花车巡游中，在美丽湖东获得全套天使之翼套装奖励，真是花神眷顾啊！`;;
            info.sizeGrid = '0,0,0,0';
            info.sign = alert.Sign.FOLWER_VEHICLE_SHOW;
            info.fontColor = '#ffffff';
            info.fontSize = 20;
            alert.showWorlds(info);
        }

        // for (let i: number = 0; i < 3; i++) {
        //     let info: alert.ScrollWordInfo = new alert.ScrollWordInfo();
        //     info.bgPath = 'res/alert/worldNotice/102.png';
        //     info.width = 833;
        //     info.y = 33;
        //     info.value = '花车来了哈哈哈哈哈哈哈哈哈哈或或或或或或或或或或或或或或或或或';
        //     info.sizeGrid = '0,0,0,0';
        //     info.sign = alert.Sign.FLOWER_VEHICLE;
        //     alert.showWorlds(info);
        // }

    }

    /**
     * 弹出奖励 
     * @param 一维数组
     */
    export function showReward(reward: xls.pair[], title?: string, opt?: AlertOption): AlertRewardPanel
    export function showReward(reward: pb.IItem[], title?: string, opt?: AlertOption): AlertRewardPanel
    export function showReward(reward: pb.IItemInfo[], title?: string, opt?: AlertOption): AlertRewardPanel
    export function showReward(reward: clientCore.GoodsInfo[], title?: string, opt?: AlertOption): AlertRewardPanel
    export function showReward(reward: any[], title: string = '', opt: AlertOption = DefaultAlertOpt): any {
        //option merge
        opt = _.assignIn(_.cloneDeep(DefaultAlertOpt), opt);
        if (reward.length == 0) {
            console.warn('奖励数组为空');
            return;
        }
        reward = clientCore.GoodsInfo.createArray(reward);
        //set ui by option
        let view = new AlertRewardPanel();
        view.setData(reward, title, opt.callBack, opt);
        clientCore.GlobalConfig.isH5 ? view.playShowH5() : view.playShowScaleAni();
        clientCore.LayerManager.alertLayer.addChild(view);
        return view;
    }

    /**显示抽奖衣服奖励 */
    export async function showDrawClothReward(clothId: number, changeItem = undefined) {
        if (clientCore.GuideMainManager.instance.isGuideAction)
            return Promise.resolve();
        let clothInfo = clientCore.ClothData.getCloth(clothId);
        if (clothInfo.suitId == 0) {
            return;
        }
        let mod = await clientCore.ModuleManager.open('drawReward.DrawClothModule', [clothId, changeItem]);
        return new Promise((ok) => { mod.once(Laya.Event.CLOSE, this, ok) });
    }

    /**重启游戏提示框 */
    export function showRestart(txt: string) {
        clientCore.LoadingManager.hide();
        clientCore.LoadingManager.hideSmall();
        //退出新手引导
        clientCore.GuideMainManager.instance.hideGuidUI();
        let view = new ui.alert.RestartAlertUI();
        view.txt.text = txt;
        view.btn.once(Laya.Event.CLICK, this, () => {
            window.location.reload();
        })
        view.centerX = view.centerY = 0;
        view.pivot(view.width / 2, view.height / 2);
        view.scale(0.1, 0.1);
        clientCore.LayerManager.systemLayer.addChild(view);
        Laya.Tween.to(view, { scaleX: 1, scaleY: 1 }, 400, Laya.Ease.backOut);
        createMaskUnderPanel(view, null, false);
    }

    export function showSystemNotice(txt: string) {
        clientCore.LoadingManager.hide();
        clientCore.LoadingManager.hideSmall();
        //退出新手引导
        clientCore.GuideMainManager.instance.hideGuidUI();
        let view = new ui.alert.SystemNoticeUI();
        view.txt.text = txt;
        view.btn.once(Laya.Event.CLICK, this, () => {
            view.destroy();
        })
        view.centerX = view.centerY = 0;
        view.pivot(view.width / 2, view.height / 2);
        view.scale(0.1, 0.1);
        clientCore.LayerManager.systemLayer.addChild(view);
        Laya.Tween.to(view, { scaleX: 1, scaleY: 1 }, 400, Laya.Ease.backOut);
        createMaskUnderPanel(view, null, false);
    }


    /**
     * 在面板下创建黑色底
     * @param view 关联面板
     * @param closeFun 关闭回调函数
     * @param cliclClose 点击黑影是否关闭
     */
    export function createMaskUnderPanel(view: Laya.View, callBack: CallBack, clickClose?: boolean) {
        let sp: Laya.Sprite;
        sp = util.DisplayUtil.createMask(clientCore.LayerManager.stageWith, clientCore.LayerManager.stageHeight);
        if (view && view.parent) {
            view.parent.addChildAt(sp, 0);
        } else {
            clientCore.LayerManager.alertLayer.addChildAt(sp, 0);
        }
        view.once(Laya.Event.REMOVED, this, () => {
            sp.removeSelf();
        })
        if (clickClose)
            sp.on(Laya.Event.CLICK, this, () => {
                view.destroy();
                sp.offAll();
                sp.removeSelf();
                if (callBack && callBack.funArr[1] && callBack.caller)
                    callBack.funArr[1].call(callBack.caller);
            });
        return sp;
    }

    /**
     * 弹出升级通知
     * @param strength 装饰等级 
     * @param lvDiff 等积変化
     * @param infoName 额外说明文字
     * @param infoNum 额外说明数值
     * @param title 标题图片
     */
    export function showUpgradeNotice(strength: 1 | 2 | 3, lvDiff: number[], infoName?: string, infoNum?: number, title?: '升级成功' | '等级提升' | '星级提升' | '好感度') {
        let view = new ui.alert.notice.NoticeAlertUI();
        let deco = new ui.alert.notice[`NoticeBg${strength}UI`]();
        view.txtLvFrom.text = 'lv' + lvDiff[0];
        view.txtLvTo.text = 'lv' + lvDiff[1];
        if (deco.boxDeco)
            deco.boxDeco.visible = false;
        let bone = clientCore.BoneMgr.ins.play('res/animate/notice/noticeDeco.sk', `stren${strength}`, false, view);
        bone.pos(277, 160);
        bone.once(Laya.Event.COMPLETE, this, () => {
            if (deco.boxDeco)
                deco.boxDeco.visible = true;
        })
        if (infoName && infoName != "") {
            view.boxLv.y = 100;
            view.boxAttr.visible = true;
            view.txtName.text = infoName;
            view.txtValue.text = infoNum.toString();
        } else {
            view.boxAttr.visible = false;
            view.boxLv.y = 123.5;
        }
        view.boxDeco.addChild(deco);
        view.centerX = view.centerY = 0;
        view.pivot(view.width / 2, view.height / 2);
        view.scale(0.1, 0.1);
        clientCore.LayerManager.alertLayer.addChild(view);
        createMaskUnderPanel(view, null, true);
        Laya.Tween.to(view, { scaleX: 1, scaleY: 1 }, 400, Laya.Ease.backOut);
    }

    /**
     * 展示系统解锁
     * @param id systemTable表中id
     */
    export function showSystemOpen(id: number, itemIDArr: number[], lv: number, callBack: CallBack) {
        let view = new SystemOpenPanel(id, itemIDArr, lv);
        view.playShowScaleAni();
        clientCore.LayerManager.systemLayer.addChild(view);
        view.mouseEnabled = false;
        let bgMask = createMaskUnderPanel(view, callBack, true);

        if (clientCore.GlobalConfig.guideAutoPlay) {/**新手引导自动点击加的额外操作 */
            Laya.timer.once(600, this, () => {
                let event = new Laya.Event();
                bgMask.event(Laya.Event.CLICK, event.setTo(Laya.Event.CLICK, bgMask, bgMask));
            });
        }

    }

    /**
     * 展示特殊的收获道具
     * @param itemId 
     * @param cnt 
     * @param startPos 
     * @param type 1-缩放特效 2-珍稀盖章特效 3-彩虹特效
     */
    export async function showSpecialItem(itemId: number, cnt: number, startPos: Laya.Point, type: number): Promise<void> {
        let item: ui.alert.AlertSprUI = Laya.Pool.getItemByClass("AlertSprUI", ui.alert.AlertSprUI);
        item.boxRare.visible = false;
        item.pos(startPos.x, startPos.y);
        item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(itemId);
        item.cnt.changeText("+" + cnt);
        clientCore.LayerManager.alertLayer.addChild(item);
        item.ani1.play(0, true);
        core.SoundManager.instance.playSound(pathConfig.getSoundUrl('rareItem'));
        await new Promise((suc) => {
            Laya.Tween.to(item, { y: item.y - 60 }, 1000, null, Laya.Handler.create(this, () => { suc(); }))
        })

        //是体力的自动切换成 type 1
        if (itemId == 9900006) {
            type = 1;
        }

        switch (type) {
            case 1:
                // let currScale: number = item.ico.scaleX;
                // item.ico.scale(currScale, currScale);
                // Laya.Tween.from(item.ico, { scaleX: 0, scaleY: 0 }, 500, Laya.Ease.sineOut, Laya.Handler.create(this, clear, [item]));
                clear(item);
                break;
            case 2:
                item.boxRare.visible = true;
                item.ani2.play(0, false);
                item.ani2.once(Laya.Event.COMPLETE, this, clear, [item])
                break;
            case 3:
                let bone: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/product/Rainbow.sk", 0, false, item);
                bone.pos(94, 53.5);
                bone.once(Laya.Event.COMPLETE, this, clear, [item]);
                break;
            default:
                fly(item);
                break;
        }
    }

    function fly(item: ui.alert.AlertSprUI): void {
        Laya.Tween.to(item, { x: 66, y: 350 }, 500, Laya.Ease.sineOut, Laya.Handler.create(this, clear, [item]))
    }

    function clear(item: ui.alert.AlertSprUI): void {
        item.removeSelf();
        item.ani1.gotoAndStop(0);
        item.ani2.gotoAndStop(0);
        Laya.Pool.recover("AlertSprUI", item);
    }

    export function showRewardAlert(itemId: number): void {
        if (itemId == 0) return;
        let rewardAlert: ui.alert.AlertShowUI = new ui.alert.AlertShowUI();
        rewardAlert.ico.skin = clientCore.ItemsInfo.getItemIconUrl(itemId);
        rewardAlert.txName.changeText("获得新装饰：" + clientCore.ItemsInfo.getItemName(itemId));
        rewardAlert.sideClose = true;
        clientCore.DialogMgr.ins.open(rewardAlert);
    }

    function removeAllEvent(view: Laya.View) {
        for (let index = 0; index < view.numChildren; index++) {
            let element = view.getChildAt(index);
            element.offAll();
        }
        if (view['blackMask']) {
            view['blackMask'].removeSelf();
            view['blackMask'].offAll();
        }
    }

    /**
     * 花费神叶的处理
     * @param costCnt 将要花费的数量 
     * @param enoughHandler 神叶足够的处理
     */
    export function useLeaf(costCnt: number, enoughHandler: Laya.Handler) {
        let has: number = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID);
        if (has >= costCnt) {
            enoughHandler && enoughHandler.run();
            return;
        }
        // enoughHandler && enoughHandler.recover();

        this.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
            AlertLeafEnough.showAlert(costCnt - has);
        }))
    }

    export async function leafNotEnoughShowRecharge(showLeafBuyHandler: Laya.Handler) {
        /**
                * 神叶不足的时候，如果玩家等级大于8级，
                * 弹限时特惠，
                * （限时特惠如果弹过）弹神叶养成，
                * （神叶养成如果弹过）弹神叶获得途径面板
                * */
        if (clientCore.LocalInfo.userLv >= 8) {
            if (clientCore.LittleRechargManager.instacne.checkCanShow(6)) {
                clientCore.LittleRechargManager.instacne.activeWindowById(6);
                showLeafBuyHandler && showLeafBuyHandler.recover();
                return;
            }
            else {
                let statusData = await clientCore.MedalManager.getMedal([MedalConst.ACTIVITY_LEAF_PLAN]);
                let isOpen = _.find(statusData, { "id": MedalConst.ACTIVITY_LEAF_PLAN }).value == 1;
                if (!isOpen) {
                    clientCore.ModuleManager.open('activity.ActivityModule', 4);
                    clientCore.MedalManager.setMedal([{ id: MedalConst.ACTIVITY_LEAF_PLAN, value: 1 }]);
                    showLeafBuyHandler && showLeafBuyHandler.recover();
                    return;
                }
            }
        }
        showLeafBuyHandler && showLeafBuyHandler.run();
    }

    export function alertQuickBuy3(buyId: number, buyCnt: number, handler: Laya.Handler): void {
        let array: xls.shop[] = xls.get(xls.shop).getValues();
        array = _.filter(array, (element) => { return element.itemId == buyId && element.quickSell == 1 });
        if (array.length <= 0) {
            alert.showFWords(`${clientCore.ItemsInfo.getItemName(buyId)}不可快捷购买或不在商品列表中~`);
            return;
        }
        let cost: xls.pair = array[0].sell[0];
        let info: QuickBuyInfo = new QuickBuyInfo(buyId);
        let getCnt: number = array[0].unitNum;
        info.tokenID = cost.v1;
        info.singlePrice = cost.v2;
        info.defaultBuyNum = buyCnt;
        info.haveNum = clientCore.ItemsInfo.getItemNum(buyId);
        info.stepNum = getCnt;
        info.minNum = 1;
        info.caller = this;
        info.needCheck = false;
        info.cancelFun = () => { }
        info.sureFun = (id: number, cnt: number) => {
            let has: number = clientCore.ItemsInfo.getItemNum(cost.v1);
            let need = cnt * cost.v2;
            if (has < need) {
                handler?.runWith([cost.v1, need - has]);
                return;
            }
            net.sendAndWait(new pb.cs_shop_buy_item({ id: id, num: cnt })).then((msg: pb.sc_shop_buy_item) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.addItems));
            });
        }
        quickBuy(info);
    }

    /**
     * 自动快捷购买
     * @param buyId 商品ID 
     * @param buyCnt 需要购买的数量
     * @param needLeaf 是否需要弹出通用神叶不足的提示框
     * @param handler 购买成功回调函数
     * @param cancelHandler 取消回调函数
     */
    export async function alertQuickBuy(buyId: number, buyCnt: number, needLeaf?: boolean, handler?: Laya.Handler, cancelHandler?: Laya.Handler): Promise<void> {
        let array: xls.shop[] = xls.get(xls.shop).getValues();
        let len: number = array.length;
        let cost: xls.pair;
        let getCnt: number = 1;
        let isLimit: boolean = false; //是否限购
        for (let i: number = 0; i < len; i++) {
            let element: xls.shop = array[i];
            if (element.itemId == buyId && element.quickSell == 1) {
                cost = element.sell[0];
                getCnt = element.unitNum;
                isLimit = element.dayLimit > 0;
                break;
            }
        }

        if (!cost) {
            alert.showFWords(`${clientCore.ItemsInfo.getItemName(buyId)}不可快捷购买或不在商品列表中~`);
            cancelHandler?.run();
            return;
        }

        if (buyId == clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID) {
            let baseNum = xls.get(xls.globaltest).get(1).buyGoldCoeff;
            let rate = xls.get(xls.globaltest).get(1).buyGoldBase / 1000;
            let level = clientCore.LocalInfo.userLv;
            let tmpNum = baseNum * Math.pow(rate, Math.max(0, level - 20));
            getCnt = 200 + Math.round(tmpNum / 10) * 10;

            buyCnt = Math.ceil(buyCnt / getCnt) * getCnt;
        }
        if (!buyCnt) buyCnt = 1;
        let info: QuickBuyInfo = new QuickBuyInfo(buyId);
        info.tokenID = cost.v1;
        info.singlePrice = cost.v2;
        info.defaultBuyNum = buyCnt;
        info.haveNum = clientCore.ItemsInfo.getItemNum(buyId);
        info.stepNum = getCnt;
        info.minNum = 1;
        info.caller = this;
        info.needCheck = cost.v1 != clientCore.MoneyManager.LEAF_MONEY_ID || !needLeaf;
        info.cancelFun = () => { cancelHandler?.run() }
        info.sureFun = (id: number, cnt: number) => {
            if (!info.needCheck) {
                let has: number = clientCore.ItemsInfo.getItemNum(cost.v1);
                let need = 0;
                /**神叶兑换仙豆，不是按照表里面配的价格，需要按照上面的公式计算来 */
                if (id == clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID) {
                    need = Math.floor(cnt / info.stepNum);
                }
                else {
                    need = cnt * cost.v2;
                }
                if (has < need) {
                    this.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                        AlertLeafEnough.showAlert(need - has);
                    }));
                    return;
                }
            }

            net.sendAndWait(new pb.cs_shop_buy_item({ id: id, num: cnt })).then((msg: pb.sc_shop_buy_item) => {
                if (handler) {
                    handler.runWith([clientCore.GoodsInfo.createArray(msg.addItems)]);
                } else {
                    alert.showReward(clientCore.GoodsInfo.createArray(msg.addItems));
                }
            });
        }

        //有限购产品
        if (isLimit) {
            await net.sendAndWait(new pb.cs_shop_get_item_info({ id: info.buyItemID })).then((msg: pb.sc_shop_get_item_info) => {
                msg.remain != -1 && (info.limitNum = msg.remain);
            })
        }

        quickBuy(info);
    }

    /**弹出规则说明面板
     * @param innerHtmlArr 文本内容(html格式)
     * @param oriTxtArr 原有文本内容（html获取不到高度，里面用一个隐藏的label获取高度，所以要传原始文本）
     */
    export function showRulePanel(innerHtmlArr: string[], oriTxtArr: string[]) {
        let panel = new AlertRulePanel();
        panel.show(innerHtmlArr, oriTxtArr);
        return panel;
    }
    export var ruleJson: any;
    export function showRuleByID(index: number) {
        console.log('show rule' + index);
        if (!ruleJson)
            ruleJson = res.get(pathConfig.getJsonPath("rule"));
        let ruleArr = ruleJson["" + index];
        return showRulePanel(_.map(ruleArr, s => util.StringUtils.getColorText3(s as string, '#66472c', '#f25c58')),
            _.map(ruleArr, s => (s as string).replace(/{/g, '').replace(/}/g, '').replace(/<br>/g, "\n")));
    }

    /**
     * 弹出有购买次数限制的通用购买
     * @param nowTime 当前已购买次数 
     * @param maxTime 购买次数上线
     * @param coinNum 消耗数量
     * @param coinId 消耗id
     * @param buyNum 购买数量
     * @param buyId 购买id
     * @param sureHanlder Laya.Hanlder点击确定的回调
     */
    export function showBuyTimesPanel(obj: { nowTime: number, maxTime: number, coinNum: number, coinId: number, buyNum: number, buyId: number, sureHanlder: Laya.Handler, noIcon?: string }) {
        let panel = new AlertBuyTimesPanel();
        panel.show(obj);
        return panel
    }

    /**打开送花面板 */
    export function showGiveFlowerPanel(data: { uid: number, nick: string }) {
        if (!clientCore.GiveFlowerManager.instance.isInActTime()) {
            alert.showFWords('爱心守护活动已超过截止时间。')
            return;
        }
        if (data.uid != clientCore.LocalInfo.uid)
            clientCore.ModuleManager.open('giveFlower.GiveFlowerModule', data);
        else
            alert.showFWords('不能送花给自己');
    }

    /**弹出预览/试穿模块
     * 支持 背景秀，坐骑(可传入数组，同时预览多个)
     * 套装，花精灵王，角色
     */
    export function showPreviewModule(id: number | number[]) {
        if (id instanceof Array) {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: id });
        }
        else {
            if (xls.get(xls.bgshow).has(id)) {
                clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: id });
            }
            else {
                clientCore.ModuleManager.open('rewardDetail.PreviewModule', id);
            }
        }
    }

    /**
     * 通用购买二次确认弹窗
     * 目前只判断灵豆和神叶不足
     * @param id 花费道具id
     * @param need 花费数量
     * @param str 补充字符串,如：确认花费xxyy购买${str}
     * @param callBack 回调参数
     */
    export function buySecondConfirm(id: number, need: number, str: string, callBack: CallBack) {
        let have = clientCore.ItemsInfo.getItemNum(id);
        if (have >= need) {
            alert.showSmall(`确认花费${need}${clientCore.ItemsInfo.getItemName(id)}购买${str}`, { callBack: callBack });
        }
        else {
            if (id == clientCore.MoneyManager.LEAF_MONEY_ID) {
                alert.useLeaf(need, new Laya.Handler(callBack.caller, callBack.funArr[0]));
            }
            else if (id == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                alert.showSmall('灵豆不足，是否补充?', {
                    callBack: {
                        caller: this, funArr: [() => {
                            clientCore.ToolTip.gotoMod(50)
                        }]
                    }
                })
            }
            else {
                alert.showSmall('道具不足')
            }
        }
    }

    /**
     * 通用材料不足时神叶购买弹窗
     * @param cost 所需要的材料
     * @param handler 回调
     */
    export function mtrNotEnough(cost: xls.pair[], handler: laya.utils.Handler) {
        clientCore.ModuleManager.open("panelCommon.MtrNotEnoughPanel", { mtr: cost, handler: handler });
    }

    /**
     * 
     * @param end 
     */
    export function showBuyDetails(id: number, handle: Laya.Handler, handleF: Laya.Handler = null) {
        let panel = new BuyDetailsPanel();
        panel.show(id, handle, handleF);
    }

    export function showCountDown(end: Laya.Handler): void {
        alert.CountDownAlert.show(end);
    }

    export function alertExpNotEnough() {
        AlertExpEnough.showAlert();
    }

    export function showCloth(id: number): void {
        clientCore.ModuleManager.open("rewardDetail.PreviewModule", id);
    }

    /**
     * 显示自动兑换提示
     * @param id 序号id
     */
    export async function showAutoExchange(id: number, medalId: number): Promise<void> {
        await xls.load(xls.recycle);
        let cfg: xls.recycle = xls.get(xls.recycle).get(id);
        if (!cfg) return;
        clientCore.MedalManager.getMedal([medalId]).then((data: pb.ICommonData[]) => {
            if (data[0].value == 0) {
                clientCore.MedalManager.setMedal([{ id: medalId, value: 1 }]);
                alert.showSmall(cfg.description);
            }
        })
    }

    /**
     * 判断玩家是否成年
     * 未成年返回true
     * @param needTip 是否需要提示
     */
    export function checkAge(needTip: boolean = false) {
        if (needTip && clientCore.LocalInfo.age < 18) {
            alert.showSmall('未成年玩家禁止发送私聊信息!');
        }
        return clientCore.LocalInfo.age < 18;
    }

    /**
     * 展示活动内礼包购买
     * @param ids rechareEvent表的id
     */
    export function showEventBuy(ids: number[]) {
        let panel = new BuyPanel();
        panel.show(ids);
    }
}