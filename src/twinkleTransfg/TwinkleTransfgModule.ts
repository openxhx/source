namespace twinkleTransfg {
    /**
     * 闪耀变身
     * twinkleTransfg.TwinkleTransfgModule
     * 策划案：\\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0122\【系统】闪耀变身舞台20210122_Inory.docx
     */
    export class TwinkleTransfgModule extends ui.twinkleTransfg.TwinkleTransfgModuleUI {
        private _page: number;
        private _currentChapter: number; //当前所在章节
        private _lastTime: number; //上次体力变动时间戳
        private _isOver: boolean;
        constructor() { super(); }
        init(): void {
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender, null, false);
            this.list.selectHandler = new Laya.Handler(this, this.listSelect, null, false);
            this.addPreLoad(xls.load(xls.shineTripChapter));
            this.addPreLoad(xls.load(xls.shineTripStage));
            this.addPreLoad(this.getInfo());
            this.checkRedShow();
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnShop, Laya.Event.CLICK, this, this.onShop);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.onAchievement);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.onPage, [1]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.onPage, [2]);
            BC.addEvent(this, this.btnShow, Laya.Event.CLICK, this, this.openTwinkleShow);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        onPreloadOver(): void {
            clientCore.Logger.sendLog('活动', '闪耀变身之旅', '打开活动面板');
            this.checkOver();
            this._page = 0;
            this.updatePage();
        }
        destroy(): void {
            super.destroy();
        }

        private getInfo(): Promise<void> {
            return net.sendAndWait(new pb.cs_shine_change_panel()).then((msg: pb.sc_shine_change_panel) => {
                this._lastTime = msg.timeStamp;
                this._currentChapter = msg.chapter;
                this.labLimit.text = msg.dailyMax + "/500";
            });
        }

        private checkOver() {
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_shine_change_level_panel({ chapterId: this._currentChapter })).then((msgLevel: pb.sc_shine_change_level_panel) => {
                let array: xls.shineTripStage[] = _.filter(xls.get(xls.shineTripStage).getValues(), (element: xls.shineTripStage) => { return element.requireCharpter == this._currentChapter; });
                this._isOver = array.length == msgLevel.passInfo.length;
                this.mouseEnabled = true;
            })
        }

        private async checkRedShow() {
            let msg = await clientCore.MedalManager.getMedal([MedalConst.TWINKLE_SHOW_RED]);
            let flag = util.TimeUtil.floorWeekTime(clientCore.ServerManager.curServerTime);
            if (msg[0].value == 0 || flag > msg[0].changeTime) {
                this.redShow.visible = true;
            } else {
                this.redShow.visible = false;
            }
        }

        private listRender(item: ui.twinkleTransfg.item.ChapterItemUI, index: number): void {
            let data: xls.shineTripChapter = this.list.array[index];
            let isLock: boolean = data.id > this._currentChapter && data.id < 4;
            item.imgBg.skin = `res/twinkleTransfg/${data.id}.png`;
            item.boxLock.visible = isLock;
            if (isLock) {
                let next: xls.shineTripChapter = xls.get(xls.shineTripChapter).get(data.request);
                item.conTxt.changeText(`达成${next.starLimit}星且等级${data.levelLimit}`);
            }
        }

        private listSelect(index: number): void {
            let data: xls.shineTripChapter = this.list.array[index];
            if (data.id <= this._currentChapter || data.id >= 10) {
                this.destroy();
                clientCore.ModuleManager.open('twinkleChapter.TwinkleChapterModule', { chapter: data.id, currentChapter: this._currentChapter });
                switch (index) {
                    case 0:
                        if (this._page == 0) clientCore.Logger.sendLog('活动', '闪耀变身之旅', '点击进入万圣夜舞会章节');
                        else clientCore.Logger.sendLog('活动', '闪耀变身之旅', '点击进入星光偶像章节');
                        break;
                    case 1:
                        clientCore.Logger.sendLog('活动', '闪耀变身之旅', '点击进入学院之星章节');
                        break;
                    case 2:
                        clientCore.Logger.sendLog('活动', '闪耀变身之旅', '点击进入创意茶话会章节');
                        break;
                    default:
                        break;
                }
            }
        }

        /** 翻页*/
        private onPage(type: number): void {
            type == 1 ? this._page-- : this._page++;
            this.updatePage();
        }

        private updatePage(): void {
            let array: xls.shineTripChapter[] = xls.get(xls.shineTripChapter).getValues().slice(1, 4);
            let len: number = array.length;
            let page: number = Math.floor(len / 3);
            let start: number = this._page * 3;
            this.btnRight.visible = this._page == 0 && len > 3;
            this.btnLeft.visible = this._page == page && len > 3;
            this.list.array = _.slice(array, start, start + 3);
        }

        private onRule(): void {
            alert.showRuleByID(1125);
        }

        private onShop(): void {
            clientCore.Logger.sendLog('活动', '闪耀变身之旅', '点击闪耀商店按钮');
            clientCore.ModuleManager.open('twinkleShop.TwinkleShopModule', this._isOver ? this._currentChapter + 1 : this._currentChapter);
        }

        private onAchievement(): void {
            this.destroy();
            clientCore.Logger.sendLog('活动', '闪耀变身之旅', '点击成就按钮');
            clientCore.ModuleManager.open('twinkleAct.TwinkleActModule', null, { openWhenClose: 'twinkleTransfg.TwinkleTransfgModule' });
        }

        /**进入闪耀秀场 */
        private openTwinkleShow() {
            return;
            clientCore.Logger.sendLog('活动', '闪耀变身之旅', '打开闪耀秀场关卡面板');
            if (this.redShow.visible) {
                this.redShow.visible = false;
                clientCore.MedalManager.setMedal([{ id: MedalConst.TWINKLE_SHOW_RED, value: 1 }]);
            }
            let chapter = 100;
            let cur = util.TimeUtil.floorWeekTime(clientCore.ServerManager.curServerTime);
            let start = util.TimeUtil.formatTimeStrToSec("2021-10-4 00:00:00");
            if (cur > start) {
                chapter += Math.floor((cur - start) / (7 * util.TimeUtil.DAYTIME));
            }
            this.destroy();
            clientCore.ModuleManager.open('twinkleChapter.TwinkleChapterModule', { chapter: chapter });
        }
    }
}