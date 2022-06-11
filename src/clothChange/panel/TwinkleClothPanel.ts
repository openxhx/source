namespace clothChange {
    /**
        性感	sexy	与清纯互斥
        清纯	pure	与性感互斥
        优雅	grace	与可爱互斥
        可爱	lovely	与优雅互斥
        华丽	gorgeous	与简约互斥
        简约	simple	与华丽互斥
        -------------------------------
        现代	modern	与古风互斥
        古风	ancient	与现代互斥
        清凉	cool	与保暖互斥
        保暖	warm	与清凉互斥
        校园	school	与魔幻互斥
        礼服	dress	与校园互斥
        幻想	fantasy	与魅力互斥
        魅力	charm	与幻想互斥
     */
    export enum newTag {
        sexy = 'sexy',
        pure = 'pure',
        grace = 'grace',
        lovely = 'lovely',
        gorgeous = 'gorgeous',
        simple = 'simple',
        //-------------------------
        modern = 'modern',
        ancient = 'ancient',
        cool = 'cool',
        warm = 'warm',
        school = 'school',
        dress = 'dress',
        fantasy = 'fantasy',
        charm = 'charm',
        activity = 'activity'
    }

    export class TwinkleClothPanel extends ClothPanel {
        private _overlayUI: ui.clothChange.twinkle.OverlayUI | ui.clothChange.twinkle.TwinkleShowUI;
        private _clothArr: clientCore.ClothInfo[];
        private _cfg: xls.shineTripStage;
        private _selectIdx: number;
        private curPickTag: newTag[] = [];
        /**tag两两互斥 */
        private pairTag: newTag[][] = [
            [newTag.sexy, newTag.pure],
            [newTag.grace, newTag.lovely],
            [newTag.gorgeous, newTag.simple],
            //-------------------------------
            [newTag.modern, newTag.ancient],
            [newTag.cool, newTag.warm],
            [newTag.school, newTag.dress],
            [newTag.fantasy, newTag.charm]
        ];
        private reqStyle: newTag[];
        private reqTag: newTag[];
        constructor(ui: any) {
            super(ui);
        }

        destroy(): void {
            this.curPickTag = null;
            this.pairTag = null;
            this.reqStyle = null;
            this.reqTag = null;
            this._cfg = null;
            if (this._clothArr) this._clothArr.length = 0;
            this._clothArr = null;
            this.removeEvents();
            this._overlayUI?.destroy();
            this._overlayUI = null;
            super.destroy();
        }

        public configure(data: { cfg: xls.shineTripStage, noData: boolean }): void {
            this.mainUI.imgOk.disabled = false;
            this.mainUI.boxSearch.visible = this.mainUI.btnDownAll.visible = false;
            this._selectIdx = 0;
            this._cfg = data.cfg;
            if (this._cfg.requireCharpter >= 100) {//闪耀秀场
                this._overlayUI = new ui.clothChange.twinkle.TwinkleShowUI();
                let allStyle = [newTag.sexy, newTag.pure, newTag.grace, newTag.lovely, newTag.gorgeous, newTag.simple];
                let allTag = [newTag.modern, newTag.ancient, newTag.cool, newTag.warm, newTag.school, newTag.dress, newTag.fantasy, newTag.charm];
                this.reqStyle = [];
                this.reqTag = [];
                let mainValue: number = 0;
                for (let i = 0; i < this._cfg.judge3.length; i++) {
                    if (this._cfg.judge3[i].v2 > mainValue) {
                        mainValue = this._cfg.judge3[i].v2;
                        this.reqStyle.unshift(allStyle[this._cfg.judge3[i].v1 - 1]);
                    } else {
                        this.reqStyle.push(allStyle[this._cfg.judge3[i].v1 - 1]);
                    }
                }
                for (let i = 0; i < this._cfg.judgeTag.length; i++) {
                    this.reqTag.push(allTag[this._cfg.judgeTag[i].v1 - 1]);
                }
                this._overlayUI.listReqType.repeatX = this._cfg.judge3.length;
                this._overlayUI.listReqTag.repeatX = this._cfg.judgeTag.length;
                this._overlayUI.listType.renderHandler = new Laya.Handler(this, this.newTagRender);
                this._overlayUI.listType.mouseHandler = new Laya.Handler(this, this.newTagClick, ['type']);
                this._overlayUI.listType.array = [newTag.sexy, newTag.grace, newTag.gorgeous, newTag.pure, newTag.lovely, newTag.simple];
                this._overlayUI.listTag.renderHandler = new Laya.Handler(this, this.newTagRender);
                this._overlayUI.listTag.mouseHandler = new Laya.Handler(this, this.newTagClick, ['tag']);
                this._overlayUI.listTag.array = [newTag.modern, newTag.cool, newTag.school, newTag.ancient, newTag.warm, newTag.dress, newTag.fantasy, newTag.charm];
                this._overlayUI.listReqType.dataSource = _.map(this._cfg.judge3, (element: xls.pair, index: number) => { return { 'skin': `clothChange/twinkle/${allStyle[element.v1 - 1]}.png`, 'x': 108 * index }; });
                this._overlayUI.listReqTag.dataSource = _.map(this._cfg.judgeTag, (element: xls.pair, index: number) => { return { 'skin': `clothChange/twinkle/${allTag[element.v1 - 1]}.png`, 'x': 108 * index }; });
            } else {
                this._overlayUI = new ui.clothChange.twinkle.OverlayUI();
                this._overlayUI.list.dataSource = _.map(_.sortBy(this._cfg.judge3, (e: xls.pair) => { return -e.v2; }), (element: xls.pair, index: number) => { return { 'skin': `clothChange/${element.v1}.png`, 'x': 71 * index }; });
                this._overlayUI.titleTxt.changeText(this._cfg.title);
                this._overlayUI.taskTxt.text = this._cfg.desc;
            }
            this._overlayUI.pos(114, -13);
            this._overlayUI.btnTop.disabled = data.noData;
            this.mainUI.addChild(this._overlayUI);
            this.addEvents();
        }

        private addEvents(): void {
            if (this._cfg.requireCharpter < 100) {
                this._overlayUI = this._overlayUI as ui.clothChange.twinkle.OverlayUI;
                let len: number = this._overlayUI.tab.numChildren;
                for (let i: number = 1; i < len; i++) {
                    BC.addEvent(this, this._overlayUI.tab.getChildAt(i), Laya.Event.CLICK, this, this.onTab, [i - 1]);
                }
                BC.addEvent(this, this._overlayUI.btnStyle, Laya.Event.CLICK, this, this.onStyle);
            } else {
                this._overlayUI = this._overlayUI as ui.clothChange.twinkle.TwinkleShowUI;
                BC.addEvent(this, this._overlayUI.btnExample, Laya.Event.CLICK, this, this.creatExample);
                BC.addEvent(this, this._overlayUI.btnShowTool, Laya.Event.CLICK, this, this.showTool);
            }
            BC.addEvent(this, this._overlayUI.btnTop, Laya.Event.CLICK, this, this.onTop);
        }
        private removeEvents(): void {
            BC.removeEvent(this);
        }

        /**推荐阵容 */
        private creatExample() {
            Laya.stage.mouseEnabled = false;
            let result: number[] = [];
            let typeArr = _.concat(TAB_CLOTH_CHILDREN.slice(), TAB_JEWERY_CHILDREN.slice());
            for (let i = 0; i < typeArr.length; i++) {
                let type = typeArr[i];
                let have = ClothChangeModel.instance.getInfoByType(type);
                if (have.length > 0) {
                    let array = _.sortBy(have, (o) => { return -this.getPoint(o) });
                    let haveTag = _.find(array, (o) => { return this.checkTag(o) })
                    if (haveTag) result.push(haveTag.id);
                    else result.push(array[0].id);
                }
            }
            ClothChangeModel.instance.person.upByIdArr(result);
            this.mainUI.clothList.startIndex = this.mainUI.clothList.startIndex;
            this.mainUI.searchList.startIndex = this.mainUI.searchList.startIndex;
            this.mainUI.skinList.startIndex = this.mainUI.skinList.startIndex;
            Laya.stage.mouseEnabled = true;
        }

        private getPoint(cloth: clientCore.ClothInfo): number {
            let score = 0;
            for (let i = 0; i < this.reqStyle.length; i++) {
                score += cloth.xlsInfo[this.reqStyle[i]];
            }
            return score;
        }

        private checkTag(cloth: clientCore.ClothInfo): boolean {
            for (let i = 0; i < this.reqTag.length; i++) {
                if (cloth.xlsInfo[this.reqTag[i]] == 0) {
                    return false;
                }
            }
            return true;
        }

        /**打开检索工具 */
        private showTool(e: Laya.Event) {
            this._overlayUI = this._overlayUI as ui.clothChange.twinkle.TwinkleShowUI;
            this._overlayUI.boxTool.visible = !this._overlayUI.boxTool.visible;
            e?.stopPropagation();
            if (this._overlayUI.boxTool.visible) BC.addEvent(this, Laya.stage, Laya.Event.CLICK, this, this.checkClick);
            else BC.removeEvent(this, Laya.stage, Laya.Event.CLICK, this, this.checkClick);
        }

        private checkClick(e: Laya.Event) {
            this._overlayUI = this._overlayUI as ui.clothChange.twinkle.TwinkleShowUI;
            if (this._overlayUI.boxTool?.hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY))
                return;
            if (this._overlayUI.btnShowTool?.hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                return;
            }
            this.showTool(null);
        }

        private newTagRender(item: ui.clothChange.twinkle.ClothTagUI) {
            this._overlayUI = this._overlayUI as ui.clothChange.twinkle.TwinkleShowUI;
            let data: newTag = item.dataSource;
            item.imgTag.skin = `clothChange/twinkle/${data}.png`;
            item.imgSel.visible = this.curPickTag.indexOf(data) >= 0;
        }

        private newTagClick(flag: 'type' | 'tag', event: Laya.Event, idx: number) {
            if (event.type == Laya.Event.CLICK) {
                this._overlayUI = this._overlayUI as ui.clothChange.twinkle.TwinkleShowUI;
                let data: newTag
                if (flag == 'type') data = this._overlayUI.listType.array[idx];
                else data = this._overlayUI.listTag.array[idx];
                let curIdx = this.curPickTag.indexOf(data);
                if (curIdx >= 0) {
                    this.curPickTag.splice(curIdx, 1);
                } else {
                    for (let i: number = 0; i < this.pairTag.length; i++) {
                        let selfIdx = this.pairTag[i].indexOf(data);
                        if (selfIdx >= 0) {
                            _.remove(this.curPickTag, (o) => { return o == this.pairTag[i][1 - selfIdx] });
                            this.curPickTag.push(data);
                            break;
                        }
                    }
                }
                if (flag == 'type') this._overlayUI.listType.refresh();
                else this._overlayUI.listTag.refresh();
                this.showPickResult();
            }
        }

        /**刷新检索结果 */
        private showPickResult() {
            this._overlayUI = this._overlayUI as ui.clothChange.twinkle.TwinkleShowUI;
            let all: clientCore.ClothInfo[] = this._clothArr;
            for (let i: number = 0; i < this.curPickTag.length; i++) {
                let tagName: string = this.curPickTag[i];
                all = _.filter(all, (o) => {
                    return o.xlsInfo[tagName] > 0;
                });
            }
            if (this.curPickTag.length > 0) {
                this.mainUI.clothList.array = _.sortBy(all, (o) => {
                    if (!this.checkTag(o)) return 999;
                    return -this.getPoint(o);
                });
            } else {
                this.mainUI.clothList.array = all;
            }
        }

        private onStyle(): void {
            this._overlayUI = this._overlayUI as ui.clothChange.twinkle.OverlayUI;
            this._overlayUI.tab.visible = !this._overlayUI.tab.visible;
        }

        private onTab(index: number, changeStyle: boolean = true): void {
            this._overlayUI = this._overlayUI as ui.clothChange.twinkle.OverlayUI;
            this._selectIdx = index;
            changeStyle && this.onStyle();
            this._overlayUI.btnStyle.skin = `clothChange/${index}.png`;
            if (index == 0) {
                this.mainUI.clothList.array = this._clothArr;
                return;
            }
            let type: string = ['sexy', 'pure', 'grace', 'lovely', 'gorgeous', 'simple'][index - 1];
            this.mainUI.clothList.array = _.filter(this._clothArr, (element: clientCore.ClothInfo) => {
                return element.xlsInfo[type] > 1;
            })
        }

        protected onClothTypeChange(clothType: number) {
            super.onClothTypeChange(clothType);
            this._clothArr = this.mainUI.clothList.array;
            if (!this._overlayUI) return;
            if (this._cfg.requireCharpter < 100) {
                this._overlayUI = this._overlayUI as ui.clothChange.twinkle.OverlayUI;
                this._overlayUI.tab.visible = false;
                this.onTab(this._selectIdx, false);
            } else {
                this._overlayUI = this._overlayUI as ui.clothChange.twinkle.TwinkleShowUI;
                this.showPickResult();
            }
            this.mainUI.imgOk.disabled = false;
        }

        protected onClothListRender(cell: ui.clothChange.render.ClothRenderUI, idx: number) {
            super.onClothListRender(cell, idx);
            let info: clientCore.ClothInfo = cell.dataSource;
            cell.styleList.visible = true;
            cell.tagList.visible = true;
            let styleArray: number[] = [info.xlsInfo.sexy, info.xlsInfo.pure, info.xlsInfo.grace, info.xlsInfo.lovely, info.xlsInfo.gorgeous, info.xlsInfo.simple];
            let styleList: { key: number, value: number }[] = _.sortBy(_.map(styleArray, (element: number, index: number) => { return { key: index + 1, value: -element }; }), 'value');
            styleList.length > 2 && (styleList = _.slice(styleList, 0, 2));
            cell.styleList.dataSource = _.map(styleList, (element: { key: number, value: number }, index: number) => {
                return { 'skin': `clothChange/${element.key}.png`, 'x': 71 * index };
            });
            let tagArray: number[] = [info.xlsInfo.modern, info.xlsInfo.ancient, info.xlsInfo.cool, info.xlsInfo.warm, info.xlsInfo.school, info.xlsInfo.dress, info.xlsInfo.fantasy, info.xlsInfo.charm];
            let tagList: { key: number, value: number }[] = _.sortBy(_.map(tagArray, (element: number, index: number) => { return { key: index + 1, value: -element }; }), 'value');
            tagList.length > 2 && (tagList = _.slice(tagList, 0, 2));
            cell.tagList.dataSource = _.map(tagList, (element: { key: number, value: number }, index: number) => {
                return { 'skin': `clothChange/twinkle/tag${element.key}.png`, 'y': 35 * index };
            });
        }
        //评分
        protected onSave(): void {
            if (this._cfg.requireCharpter >= 100 && !this.checkCharpter(this._cfg.requireCharpter)) {
                alert.showSmall("赛季已更新！");
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.ModuleManager.open('twinkleTransfg.TwinkleTransfgModule');
                return;
            }
            net.sendAndWait(new pb.cs_shine_change_score({ customsId: this._cfg.id, chapterId: this._cfg.requireCharpter, clothIdList: ClothChangeModel.instance.person.getWearginIds() })).then((msg: pb.sc_shine_change_score) => {
                let config = this._cfg;
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.ModuleManager.open('twinkleResult.TwinkleResultModule', { chapter: config, msg: msg });
            });
        }

        /** 回忆最高分*/
        private onTop(): void {
            net.sendAndWait(new pb.cs_shine_change_remind_pass_info({ customsId: this._cfg.id })).then((msg: pb.sc_shine_change_remind_pass_info) => {
                if (!msg.clothIdList || msg.clothIdList.length == 0) return;
                ClothChangeModel.instance.person.replaceByIdArr(msg.clothIdList);
            });
        }

        private checkCharpter(curChapter: number) {
            let chapter = 100;
            let cur = util.TimeUtil.floorWeekTime(clientCore.ServerManager.curServerTime);
            let start = util.TimeUtil.formatTimeStrToSec("2021-10-4 00:00:00");
            if (cur > start) {
                chapter += Math.floor((cur - start) / (7 * util.TimeUtil.DAYTIME));
            }
            return chapter == curChapter;
        }
    }
}