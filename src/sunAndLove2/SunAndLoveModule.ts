
namespace sunAndLove2 {
    const SUIT_ID = 2100158;
    const BG_ID = 1000003;
    /**
     * 阳光与恋的传说
     * sunAndLove2.SunAndLoveModule
     */
    export class SunAndLoveModule extends ui.sunAndLove2.SunAndLoveModuleUI {
        private _detailPanel: SunDetailPanel;
        private _tenPanel: SunTenPanel;
        private _todayFreeTimes: number;
        private _rewardState: boolean[];

        init(d: any) {
            super.init(d);
            this.tips.visible = false;
            this.listBook.renderHandler = new Laya.Handler(this, this.onListRender);
            this.listBook.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.tips.list.renderHandler = new Laya.Handler(this, this.onTipsListRender);
            this.tips.list.mouseHandler = new Laya.Handler(this, this.onTipsListMouse);
            this.imgCloth.skin = clientCore.LocalInfo.sex == 1 ? 'unpack/sunAndLove2/女.png' : 'unpack/sunAndLove2/男.png';
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.eventFeature));
            this.addPreLoad(res.load('unpack/spirittree/chibang.sk'));
            this.addPreLoad(res.load('unpack/spirittree/zi.sk'));
            this.addPreLoad(net.sendAndWait(new pb.cs_get_sun_legend_status()).then((data: pb.sc_get_sun_legend_status) => {
                this._todayFreeTimes = data.freeTimes;
                this._rewardState = [];
                for (let i = 0; i < 3; i++) {
                    this._rewardState.push(util.getBit(data.status, i + 1) == 1);
                }
            }));
            this.imgRotate.visible = false;
            clientCore.UIManager.showCoinBox();
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
        }

        onPreloadOver() {
            this.listBook.dataSource = xls.get(xls.eventFeature).getValues();
            this.setRewardClock();
            this.setUI();
            clientCore.Logger.sendLog('2020年5月8日活动', '【付费】青峦谪仙的寻觅', '打开活动面板');
        }

        private setRewardClock() {
            for (let i = 0; i < 12; i++) {
                if (SPECIAL_CLOCK_IDX.indexOf(i) > -1) {
                    this['rwd_' + i].skin = `sunAndLove2/clock${i}_${clientCore.LocalInfo.sex == 1 ? 'female' : 'male'}.png`;
                }
                else {
                    let rwd = this['rwd_' + i] as ui.commonUI.item.RewardItemUI;
                    let rwdInfo = xls.get(xls.godTree).get(REWARD_MAP[i][0])?.item;
                    if (rwdInfo) {
                        rwd.ico.skin = clientCore.ItemsInfo.getItemIconUrl(rwdInfo.v1);
                        rwd.num.value = rwdInfo.v2.toString();
                        rwd.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(rwdInfo.v1);
                        rwd.num.scale(1.5, 1.5, true);
                    }
                }
            }
        }

        private setUI() {
            this.listBook.startIndex = this.listBook.startIndex;
            this.btnOne.skin = this._todayFreeTimes > 0 ? 'sunAndLove2/btn_water_free.png' : 'sunAndLove2/btn_jd1.png';
            let clothIds = clientCore.SuitsInfo.getSuitInfo(SUIT_ID).clothes;
            let haveNum = _.filter(clothIds, (id) => { return clientCore.LocalInfo.checkHaveCloth(id) }).length;
            this.txtAllNum.text = haveNum + '/' + clothIds.length;
            this.btnGetBg.skin = 'sunAndLove2/集齐奖励.png';
            this.imgRwdItem.skin = 'sunAndLove2/gift.png';
            //获得了美瞳，没有买齐衣服不显示背景秀领取按钮
            this.btnGetBg.visible = _.isUndefined(clientCore.BgShowManager.instance.getDecoInfoById(BG_ID).srvInfo)
            //抽完的格子要灰掉
            for (let i = 0; i < SPECIAL_CLOCK_IDX.length; i++) {
                let ids = REWARD_MAP[SPECIAL_CLOCK_IDX[i]];
                this['imgBot_' + i].gray = this.checkAllClothHaveByGodTreeIds(ids);
            } REWARD_MAP
            this.rwd_2.imgBg.gray = this.rwd_2.ico.gray = this.rwd_2.num.gray = this.checkAllClothHaveByGodTreeIds(REWARD_MAP[2]);
        }

        /**判断奖励是否全部获得
         * @param gotTreeIdArr godTree表中的id数组
         */
        private checkAllClothHaveByGodTreeIds(gotTreeIdArr: number[]) {
            let xlsGodtreeArr = _.map(gotTreeIdArr, (i) => { return xls.get(xls.godTree).get(i) });
            let clothIds = _.map(xlsGodtreeArr, (o) => { return clientCore.LocalInfo.sex == 1 ? o.item : o.itemMale }).map((p) => { return p.v1 });
            let haveArr = _.filter(clothIds, (id) => { return clientCore.LocalInfo.checkHaveCloth(id) });
            return haveArr.length == clothIds.length;
        }

        private onListRender(cell: ui.sunAndLove2.render.SunBookRenderUI, idx: number) {
            let data = cell.dataSource as xls.eventFeature;
            cell.imgBook.skin = `sunAndLove2/传说${idx + 1}.png`;
            cell.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(data.reward[0].v1);
            cell.imgReaded.visible = this._rewardState[idx];
            let date = util.TimeUtil.formatSecToDate(util.TimeUtil.formatTimeStrToSec(data.openTime));
            cell.txtDate.text = `${date.getMonth() + 1}月${date.getDate()}日开启`;
            cell.txtDate.visible = clientCore.ServerManager.curServerTime < (date.getTime() / 1000);
            cell.imgLock.visible = cell.txtDate.visible;
            cell.boxBubble.visible = !this._rewardState[idx];
        }

        private onTipsListRender(box: Laya.Box, idx: number) {
            let id = box.dataSource as number;
            let cell = box.getChildByName('rwd') as ui.commonUI.item.RewardItemUI;
            cell.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            cell.num.visible = false;
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(id);
            cell.txtName.visible = true;
            cell.txtName.text = clientCore.ItemsInfo.getItemName(id).replace('苏尔之恋', '');
            box.getChildByName('get')['visible'] = xls.get(xls.itemCloth).has(id) && clientCore.LocalInfo.checkHaveCloth(id);
        }

        private onTipsListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(this.tips.list.getCell(idx), { id: this.tips.list.getItem(idx) });
            }
        }

        private _tmpIdx: number;
        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let cell = this.listBook.getCell(idx);
                if (!cell['txtDate'].visible) {
                    this._tmpIdx = idx;
                    let aniId = xls.get(xls.eventFeature).get(idx + 1)?.movie.toString();
                    if (aniId)
                        clientCore.AnimateMovieManager.showAnimateMovie(aniId, this, this.onAniOver);
                    else
                        this.onAniOver();
                }
            }
        }

        private onAniOver() {
            if (!this._rewardState[this._tmpIdx])
                net.sendAndWait(new pb.cs_set_sun_legend_read_status({ id: this._tmpIdx + 1 })).then((data: pb.sc_set_sun_legend_read_status) => {
                    alert.showReward(clientCore.GoodsInfo.createArray(data.items));
                    this._rewardState[this._tmpIdx] = true;
                    this.listBook.startIndex = this.listBook.startIndex;
                })
        }

        private _rotating: boolean;
        private _tening: boolean;
        private startRotate(times: number) {
            if (this._rotating || this._tening) {
                alert.showFWords('点的太急啦！');
                return;
            }
            //神叶不足
            let haveLeaf = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID);
            let needLeaf = times == 1 ? 198 : 1680;
            if ((times == 1 && this._todayFreeTimes == 0 && haveLeaf < 198) || (times == 10 && haveLeaf < 1680)) {
                alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                    alert.AlertLeafEnough.showAlert(needLeaf - haveLeaf);
                }));
                return;
            }

            let buyFunc: Function = () => {
                if (times == 10) {
                    this._tening = true;
                }
                net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 1002, times: times })).then((data: pb.sc_common_activity_draw) => {
                    if (data.times == 1) {
                        if (data.item[0]) {
                            if (this._todayFreeTimes > 0)
                                util.RedPoint.reqRedPointRefresh(7401);
                            let godTreeInfo = data.item[0];
                            let clockId = _.findIndex(REWARD_MAP, (arr) => { return arr.indexOf(godTreeInfo.id) > -1 })
                            if (clockId > -1) {
                                this.playRotateAni(clockId).then(() => {
                                    this.setUI();
                                    let xlsInfo = xls.get(xls.godTree).get(godTreeInfo.id);
                                    if (xlsInfo) {
                                        let rwdPair = clientCore.LocalInfo.sex == 1 ? xlsInfo.item : xlsInfo.itemMale
                                        if (xlsInfo.type == 3)
                                            alert.showDrawClothReward(rwdPair.v1);
                                        else
                                            alert.showReward([clientCore.GoodsInfo.create(rwdPair)]);
                                    }
                                })
                            }
                            else {
                                let xlsInfo = xls.get(xls.godTree).get(godTreeInfo.id);
                                if (xlsInfo) {
                                    let rwdPair = clientCore.LocalInfo.sex == 1 ? xlsInfo.item : xlsInfo.itemMale
                                    alert.showReward([clientCore.GoodsInfo.create(rwdPair)]);
                                }
                                else {
                                    console.log('找不到godTreeid' + godTreeInfo.id);
                                }
                                this.setUI();
                            }
                        }
                    }
                    else {
                        this._tenPanel = this._tenPanel || new SunTenPanel();
                        this._tenPanel.showReward(data.item);
                        this.setUI();
                        Laya.timer.once(1000, this, this.onDelayOver);
                    }
                    this._todayFreeTimes = data.freeTimes;
                    this.setUI();
                })
            }

            if (times == 1) {
                buyFunc();
            }
            else {
                alert.showSmall(`是否花费${needLeaf}神叶寻觅？`, {
                    callBack: {
                        caller: this,
                        funArr: [() => {
                            buyFunc();
                        }]
                    }
                })
            }
        }

        private onDelayOver() {
            this._tening = false;
        }

        private playRotateAni(toId: number) {
            this._rotating = true;
            this.imgRotate.visible = true;
            this.imgRotate.rotation = this.imgRotate.rotation % 360;
            let nowId = Math.floor(this.imgRotate.rotation / 30);
            let diff = toId > nowId ? toId - nowId : toId - nowId + 12;
            let angle = diff * 30 + this.imgRotate.rotation + _.random(5, 8, false) * 360;
            return new Promise((ok) => {
                Laya.Tween.to(this.imgRotate, { rotation: angle }, angle / 360 * 300, Laya.Ease.cubicInOut, new Laya.Handler(this, () => {
                    this._rotating = false;
                    ok();
                }));
            });
        }

        private onDetail() {
            this._detailPanel = this._detailPanel || new SunDetailPanel();
            this._detailPanel.show();
        }

        private onSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', SUIT_ID);
        }

        private _tipsCell: Laya.Sprite;
        private showTips(idx: number, e: Laya.Event) {
            let godTreeIds = REWARD_MAP[idx];
            let xlsMap = xls.get(xls.godTree);
            if (godTreeIds) {
                let rwdIds = _.map(_.filter(godTreeIds, (id) => { return xlsMap.has(id) }), (godTreeid) => {
                    return clientCore.LocalInfo.sex == 1 ? xlsMap.get(godTreeid).item : xlsMap.get(godTreeid).itemMale;
                }).map((pair) => { return pair.v1 });
                this._tipsCell = e.currentTarget;
                this.tips.x = this._tipsCell.x + this._tipsCell.width / 2;
                this.tips.y = this._tipsCell.y + this._tipsCell.height / 2;
                this.tips.list.dataSource = rwdIds;
                this.tips.list.repeatX = this.tips.list.length;
                this.tips.width = _.clamp(this.tips.list.width + 50, 300, 450);
                this.tips.visible = true;
                Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onStageClick);
            }
        }

        private onStageClick() {
            if (this.tips.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY)) {
                return;
            }
            if (this._tipsCell && this._tipsCell.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY))
                return;
            this.tips.visible = false;
            Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.onStageClick);
        }

        private onOpenBgShow() {
            // this._bgShowPanel = this._bgShowPanel || new SunBgShowPanel();
            // this._bgShowPanel.show();

            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: BG_ID, condition: '集齐{苏尓之恋套装}可获得', limit: '' });
        }

        private onOpenProb() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 3);
        }

        private onClose() {
            if (!this._rotating) {
                this.destroy();
            }
        }

        private onGetSuitRwd() {
            let allGet = clientCore.SuitsInfo.getSuitInfo(SUIT_ID).allGet;
            if (!allGet) {
                alert.showFWords('收集齐套装才可领取');
                return;
            }
            if (clientCore.BgShowManager.instance.getDecoInfoById(BG_ID).srvInfo == undefined) {
                net.sendAndWait(new pb.cs_get_sun_legend_colection_reward({ index: 2 })).then((data: pb.sc_get_sun_legend_colection_reward) => {
                    alert.showReward(clientCore.GoodsInfo.createArray(data.reward));
                    this.setUI();
                    util.RedPoint.reqRedPointRefresh(7402);
                })
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnOne, Laya.Event.CLICK, this, this.startRotate, [1]);
            BC.addEvent(this, this.btnTen, Laya.Event.CLICK, this, this.startRotate, [10]);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnSuit, Laya.Event.CLICK, this, this.onSuit);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.imgBgShow, Laya.Event.CLICK, this, this.onOpenBgShow);
            BC.addEvent(this, this.btnProb, Laya.Event.CLICK, this, this.onOpenProb);
            BC.addEvent(this, this.btnGetBg, Laya.Event.CLICK, this, this.onGetSuitRwd);
            for (let i = 0; i < 12; i++) {
                if (SPECIAL_CLOCK_IDX.indexOf(i) > -1)
                    BC.addEvent(this, this['imgBot_' + SPECIAL_CLOCK_IDX.indexOf(i)], Laya.Event.MOUSE_DOWN, this, this.showTips, [i]);
                else
                    BC.addEvent(this, this['rwd_' + i], Laya.Event.MOUSE_DOWN, this, this.showTips, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.Tween.clearAll(this.imgRotate);
            Laya.timer.clear(this, this.onDelayOver);
            Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.onStageClick);
        }

        destroy() {
            super.destroy();
            this._tenPanel?.destroy();
            this._detailPanel?.destroy();
            clientCore.UIManager.releaseCoinBox();
        }
    }
}