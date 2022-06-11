namespace adventureAct {
    import AdventureActManager = clientCore.AdventureActManager;
    import Money = clientCore.MoneyManager;
    /**试炼（活动）副本 
     * 参数 章节id
    */
    export class AdventureActModule extends ui.adventureAct.AdventureActModuleUI {
        private _detailPanel: ActDetailPanel;
        private _posArr: Laya.Point[];
        private _fightInfo: MoneyFightInfo;
        //boss相关
        private _targetTimeRange: number[];
        private _isBossDead: boolean;
        private _bossRender: ui.adventureAct.render.ActRenderUI;
        private _bossTimePanel: ActBossTimePanel;

        private _page: number = 0;
        init(d: any) {
            super.init(d);
            this._posArr = [];
            for (let i = 0; i < 6; i++) {
                this._posArr.push(new Laya.Point(this['mc_' + i].x, this['mc_' + i].y));
            };
            this.addPreLoad(xls.load(xls.bossReward));
            this.addPreLoad(AdventureActManager.instance.loadXml());
            this.addPreLoad(AdventureActManager.instance.reqAllActChatperInfo());
            this.addPreLoad(clientCore.ModuleManager.loadUnpack('adventure'));
            //boss是否开放
            this.addPreLoad(clientCore.BossManager.ins.getBossInfo().then((data) => {
                this._targetTimeRange = [data.openTime, data.closeTime];
                this._isBossDead = data.showTime > 0;
            }))
            clientCore.UIManager.setMoneyIds([0, Money.FAIRY_BEAN_MONEY_ID, Money.LEAF_MONEY_ID, Money.HEALTH_ID])
            clientCore.UIManager.showCoinBox();
        }

        onPreloadOver() {
            this.layoutBtn();
            this.onTimer();
            Laya.timer.loop(1000, this, this.onTimer);
        }

        popupOver() {
            if (this._data) {
                this.openDetailPanel(this._data);
            }
        }

        private layoutBtn() {
            //先按是否开放排个序
            let actXlsArr = _.filter(xls.get(xls.chapterBase).getValues(), (c) => { return c.activity == 1 });
            actXlsArr = _.sortBy(actXlsArr, (o) => {
                return !this.checkIsOpenNow(o);
            });
            let totalPage = Math.ceil(actXlsArr.length / 6);
            this._page = _.clamp(this._page, 0, totalPage);
            this.btnPrev.visible = this._page > 0;
            this.btnNext.visible = this._page < totalPage - 1;
            //开始设置UI
            for (let i = 0; i < 6; i++) {
                this.setRender(this['mc_' + i], actXlsArr[i + this._page * 6]);
            }
        }

        private setRender(cell: ui.adventureAct.render.ActRenderUI, xlsInfo: xls.chapterBase) {
            if (!cell)
                return;
            if (!xlsInfo) {
                cell.visible = false;
                return;
            }
            cell.visible = true;
            let isOpen = this.checkIsOpenNow(xlsInfo);
            cell.txtName.text = xlsInfo.name;
            cell.img.skin = 'res/adventure/actDungeon/' + xlsInfo.chapter_id + '.png';
            cell.img.gray = !isOpen;
            cell.mouseEnabled = isOpen;
            cell.dataSource = xlsInfo.chapter_id;
            cell.imgRwd.skin = clientCore.ItemsInfo.getItemIconUrl(xlsInfo.disRwd);
            cell.btnRule.visible = false;
            if (isOpen) {
                cell.boxLockDay.visible = cell.boxLockTime.visible = false;
            }
            else {
                if (xlsInfo.openingday.length > 0) {
                    cell.boxLockDay.visible = true;
                    cell.boxLockTime.visible = false;
                    cell.txtDay.text = _.map(xlsInfo.openingday, (day) => { return '周' + util.StringUtils.num2Chinese(day) }).join('、').replace('七', '日') + '开启';
                }
                if (xlsInfo.openingtime.length > 0) {
                    cell.boxLockDay.visible = false;
                    cell.boxLockTime.visible = true;
                    cell.txtTime.text = '开启时间\n' + xlsInfo.openingtime.join('\n').replace(/_/g, '-');
                }
            }
            cell.boxBoss.visible = false;
            if (xlsInfo.chapter_id == 401) {
                cell.boxBoss.visible = true;
                this._bossRender = cell;
                cell.btnRule.visible = true;
            }
        }


        private checkIsOpenNow(chp: xls.chapterBase) {
            let open = false;
            let now = util.TimeUtil.formatSecToDate(clientCore.ServerManager.curServerTime);
            let day = now.getDay();
            day = day == 0 ? 7 : day;
            let hour = now.getHours();
            let min = now.getMinutes();

            //常驻开放
            if (chp.resident == 1)
                return true;
            //常驻关闭
            if (chp.resident == 3)
                return false;
            //resident == 2 开始判断日期
            if (chp.openingday.length > 0) {
                open = chp.openingday.indexOf(day) > -1;
                //天数不符合 直接false
                if (!open)
                    return false;
            }
            //日期符合，开始判断时间
            if (chp.openingtime.length > 0) {
                for (const chunk of chp.openingtime) {
                    //小时 例如chunk: 12:00_13:00
                    let h = _.map(chunk.split('_'), (s) => { return parseInt(s.split(':')[0]) });//[12,13]
                    if (_.inRange(hour, h[0], h[1])) {
                        open = true;
                        break;
                    }
                    //分钟
                    let m = _.map(chunk.split('_'), (s) => { return parseInt(s.split(':')[1]) });//[00,00]
                    if (_.inRange(min, m[0], m[1])) {
                        open = true;
                        break;
                    }

                }
            }
            return open;
        }

        private onClick(e: Laya.Event) {
            let id = e.currentTarget['dataSource'];
            this.openDetailPanel(id);
        }

        private async openDetailPanel(chapter_id: number) {
            if (chapter_id == 501) {
                //金币副本 特殊处理
                let path: string = "atlas/fightInfo.atlas";
                if (!Laya.loader.getRes(path)) {
                    clientCore.LoadingManager.showSmall();
                    await Promise.all([xls.load(xls.monsterBase), xls.load(xls.goldStage)]);
                    await res.load(path, Laya.Loader.ATLAS);
                    clientCore.LoadingManager.hideSmall();
                }
                this._fightInfo = this._fightInfo || new MoneyFightInfo();
                this._fightInfo.show();
            }
            else if (chapter_id == 401) { //boss战 也特殊处理
                let data: pb.sc_get_world_boss_info = await clientCore.BossManager.ins.getBossInfo();
                let currT: number = clientCore.ServerManager.curServerTime;
                if (currT < data.prepareTime || currT > data.closeTime) {
                    this._bossTimePanel = this._bossTimePanel || new ActBossTimePanel();
                    this._bossTimePanel.show();
                }
                else {
                    if (clientCore.LocalInfo.userLv < 20)
                        alert.showFWords('20级才能进入')
                    else
                        clientCore.MapManager.enterWorldMap(15);
                }
            }
            else if (chapter_id == 402) { 
                clientCore.ToolTip.gotoMod(168);
            }
            else {
                this._detailPanel = this._detailPanel || new ActDetailPanel();
                await AdventureActManager.instance.reqOneActInfo(chapter_id);
                this._detailPanel.show(AdventureActManager.instance.getOneActChapterInfo(chapter_id));
                clientCore.DialogMgr.ins.open(this._detailPanel);
            }
        }

        private onOpenShop() {

        }

        private onTimer() {
            if (this._targetTimeRange) {
                let now = clientCore.ServerManager.curServerTime;
                let open: boolean;
                let nextTime = now;
                if (this._isBossDead) {
                    open = false;
                    nextTime = this._targetTimeRange[0] + 24 * 3600;//下一场的时间
                }
                else {
                    //时间内
                    if (_.inRange(now, this._targetTimeRange[0], this._targetTimeRange[1])) {
                        open = true;
                        nextTime = this._targetTimeRange[1];
                    }
                    else if (now < this._targetTimeRange[0]) {
                        open = false;
                        nextTime = this._targetTimeRange[0];
                    }
                    else {
                        open = false;
                        nextTime = now > this._targetTimeRange[1] ? (this._targetTimeRange[0] + 24 * 3600) : this._targetTimeRange[1];
                    }
                }
                this._bossRender.imgBossState.skin = open ? 'adventureAct/di_zhandouzhong.png' : 'adventureAct/di_xiayichang.png';
                this._bossRender.txtBossTime.text = util.StringUtils.getDateStr2(nextTime - now, '{hour}:{min}:{sec}');
            }

            //中秋话剧倒计时
            // let time = clientCore.OperaManager.timeToOperaStart();
            // this.boxOpera.visible = time > 0;
            // this.bigActivivy.skin = time > 0 ? 'adventureAct/1.png' : 'adventureAct/2.png'
            // if (time > 0) {
            //     let timeArr = util.StringUtils.getDateStr2(time).split(':');
            //     for (let i = 0; i < 3; i++) {
            //         this['txt_' + i].value = timeArr[i];
            //     }
            // }
        }

        private changePage(diff: number) {
            this._page = this._page + diff;
            this.layoutBtn();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnShop, Laya.Event.CLICK, this, this.onOpenShop);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.bigActivivy, Laya.Event.CLICK, this, this.onBigActivity);
            BC.addEvent(this, this.btnPrev, Laya.Event.CLICK, this, this.changePage, [-1]);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.changePage, [1]);
            for (let i = 0; i < 6; i++) {
                BC.addEvent(this, this['mc_' + i], Laya.Event.CLICK, this, this.onClick);
                BC.addEvent(this, this['mc_' + i]["btnRule"], Laya.Event.CLICK, this, this.onRuleClick);
            }
        }
        private onRuleClick(e: Laya.Event) {
            e.stopPropagation();
            let id = e.currentTarget.parent['dataSource'];
            if (id == 401) {
                this._bossTimePanel = this._bossTimePanel || new ActBossTimePanel();
                this._bossTimePanel.show();
            }
        }
        private onBigActivity(): void {
            clientCore.ToolTip.gotoMod(96);
        }

        removeEventListeners() {
            Laya.timer.clear(this, this.onTimer);
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this._bossTimePanel?.destroy();
            if (this._detailPanel) {
                clientCore.DialogMgr.ins.close(this._detailPanel, false)
                this._detailPanel = null;
            }
            if (this._fightInfo) {
                clientCore.DialogMgr.ins.close(this._fightInfo, false);
                this._fightInfo = null;
            }
            AdventureActManager.instance.clearActInfos();
            clientCore.UIManager.releaseCoinBox();
        }
    }
}