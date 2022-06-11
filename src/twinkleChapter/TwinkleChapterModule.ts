namespace twinkleChapter {
    /**
     * 闪耀变身关卡
     * twinkleChapter.TwinkleChapterModule
     * 策划案：\\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0122\【系统】闪耀变身舞台20210122_Inory.docx
     */
    export class TwinkleChapterModule extends ui.twinkleChapter.TwinkleChapterModuleUI {

        private _chapter: Chapter;
        private _isOver: boolean;
        init(data: { chapter: number, currentChapter: number }): void {
            super.init(data);
            this.addPreLoad(Promise.all([
                res.load('res/json/twinkle/chapter.json', Laya.Loader.JSON),
                xls.load(xls.shineTripStage),
                xls.load(xls.shineTripChapter)
            ]));
            //获取体力
            net.send(new pb.cs_shine_change_get_energy());
            if (data.chapter >= 100) {//获取排名
                let rankId = 1001;
                let cur = util.TimeUtil.floorWeekTime(clientCore.ServerManager.curServerTime);
                let start = util.TimeUtil.formatTimeStrToSec("2021-10-4 00:00:00");
                if (cur > start) {
                    rankId += Math.round((cur - start) / (7 * util.TimeUtil.DAYTIME));
                }
                this.addPreLoad(clientCore.RankManager.ins.getUserRank(rankId, clientCore.LocalInfo.uid).then((data) => {
                    this.labRank.text = data?.msg?.ranking == 0 ? '默默无闻' : data?.msg?.ranking.toString();
                }));
                this.listStyle.renderHandler = new Laya.Handler(this, this.styleRender);
                this.listTag.renderHandler = new Laya.Handler(this, this.tagRender);
            }
        }

        onPreloadOver(): void {
            this.imgTitle.skin = this._data.chapter >= 100?"twinkleChapter/title_100.png":`twinkleChapter/title_${this._data.chapter}.png`;
            this.btnAct.visible = this.btnChapter.visible = this._data.chapter < 100;
            this.btnShowShop.visible = this.boxRank.visible = this.boxShow.visible = this._data.chapter >= 100;
            this.resizeView();
            if (this._data.chapter < 100) {
                clientCore.UIManager.setMoneyIds([9900120, 9900119]);
                clientCore.UIManager.showCoinBox();
            } else {
                let config = xls.get(xls.shineTripChapter).get(this._data.chapter);
                this.listStyle.repeatX = config.chapterStyle.length;
                this.listStyle.array = config.chapterStyle;
                this.listTag.repeatX = config.chapterTag.length;
                this.listTag.array = config.chapterTag;
            }
        }

        addEventListeners(): void {
            BC.addEvent(this, this.boxRank, Laya.Event.CLICK, this, this.openShowRank);
            BC.addEvent(this, this.btnTemplet, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnClothShop, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnTwinkleShop, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnChapter, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnAct, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onBtnClose);
            BC.addEvent(this, this.btnShowShop, Laya.Event.CLICK, this, this.openShowShop);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.UIManager.releaseCoinBox();
            util.TweenUtils.over('TwinkleChapterModule');
            this._chapter?.destroy();
            this._chapter = null;
            super.destroy();
        }
        /**打开闪耀秀场商店 */
        private openShowShop() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('commonShop.CommonShopModule', 9);
        }

        private onBtnClose() {
            this.destroy();
            clientCore.ModuleManager.open('twinkleTransfg.TwinkleTransfgModule');
        }

        private styleRender(item: Laya.Image) {
            let id = item.dataSource;
            item.skin = `twinkleChapter/style${id}.png`;
        }

        private tagRender(item: Laya.Image) {
            let id = item.dataSource;
            item.skin = `twinkleChapter/tag${id}.png`;
        }

        async seqPreLoad(): Promise<void> {
            await this.getInfo(this._data.chapter);
            if (this._data.chapter < 100) await this.getInfo(this._data.currentChapter);
        }

        private getInfo(id: number): Promise<void> {
            return net.sendAndWait(new pb.cs_shine_change_level_panel({ chapterId: id })).then((msg: pb.sc_shine_change_level_panel) => {
                if (id == this._data.chapter) {
                    this._chapter = new Chapter();
                    this.addChildAt(this._chapter, 0);
                    id != 1 && (this._chapter.y = -200);
                    this._chapter.init(this._data, msg.passInfo);
                    if (id == this._data.currentChapter) {
                        let array: xls.shineTripStage[] = _.filter(xls.get(xls.shineTripStage).getValues(), (element: xls.shineTripStage) => { return element.requireCharpter == this._data.currentChapter; });
                        this._isOver = array.length == msg.passInfo.length;
                    }
                } else if (id == this._data.currentChapter) {
                    let array: xls.shineTripStage[] = _.filter(xls.get(xls.shineTripStage).getValues(), (element: xls.shineTripStage) => { return element.requireCharpter == this._data.currentChapter; });
                    this._isOver = array.length == msg.passInfo.length;
                }
            });
        }

        private onClick(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnTemplet:
                    clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.ModuleManager.open('familyTailor.FamilyTailorModule');
                    break;
                case this.btnClothShop:
                    clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.ModuleManager.open('sellStore.SellStoreModule');
                    break;
                case this.btnTwinkleShop:
                    if (this._data.chapter >= 100) {
                        let chapter = 100;
                        let cur = util.TimeUtil.floorWeekTime(clientCore.ServerManager.curServerTime);
                        let start = util.TimeUtil.formatTimeStrToSec("2021-10-4 00:00:00");
                        if (cur > start) {
                            chapter += Math.round((cur - start) / (7 * util.TimeUtil.DAYTIME)) % 2;
                        }
                        clientCore.ModuleManager.open('twinkleShop.TwinkleShopModule', chapter);
                    } else {
                        clientCore.ModuleManager.open('twinkleShop.TwinkleShopModule', this._isOver ? this._data.currentChapter + 1 : this._data.currentChapter);
                    }
                    break;
                case this.btnChapter:
                    clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.ModuleManager.open('twinkleTransfg.TwinkleTransfgModule');
                    break;
                case this.btnAct: //成就
                    clientCore.ModuleManager.open('twinkleAct.TwinkleActModule');
                    break;
                default:
                    break;
            }
        }

        /**打开闪耀秀场排行榜 */
        private openShowRank() {
            clientCore.ModuleManager.open('twinkleRank.TwinkleRankModule');
        }

        private resizeView(): void {
            let len: number = this.numChildren;
            for (let i: number = 0; i < len; i++) {
                let child: Laya.Sprite = this.getChildAt(i) as Laya.Sprite;
                if (child.x < 544) {
                    child.x -= clientCore.LayerManager.OFFSET;
                } else if (child.x > 790) {
                    child.x += clientCore.LayerManager.OFFSET;;
                }
            }
            this.imgBottom.width = Laya.stage.width;
        }
    }
}