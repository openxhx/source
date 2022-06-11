namespace clothChange {

    export class ActivityClothPanel extends ClothPanel {
        private _overlayUI: ui.clothChange.activity.ActivityShowUI;
        private _clothArr: clientCore.ClothInfo[];
        private curPickTag: newTag[] = [];
        private _data: { activity: number, frist: number, second: number, history: number };
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
        constructor(ui: any) {
            super(ui);
        }

        destroy(): void {
            this._data = null;
            this.curPickTag = null;
            this.pairTag = null;
            if (this._clothArr) this._clothArr.length = 0;
            this._clothArr = null;
            this.removeEvents();
            this._overlayUI?.destroy();
            this._overlayUI = null;
            super.destroy();
        }

        public configure(data: { activity: number, frist: number, second: number, history: number }): void {
            this._data = data;
            this.mainUI.imgOk.disabled = false;
            this.mainUI.boxSearch.visible = this.mainUI.btnDownAll.visible = false;
            this._overlayUI = new ui.clothChange.activity.ActivityShowUI();
            let allType = [newTag.sexy, newTag.pure, newTag.grace, newTag.lovely, newTag.gorgeous, newTag.simple];
            let reqStyle = [allType[data.frist - 1], allType[data.second - 1]];
            this._overlayUI.listReqType.repeatX = reqStyle.length;
            this._overlayUI.listType.renderHandler = new Laya.Handler(this, this.newTagRender);
            this._overlayUI.listType.mouseHandler = new Laya.Handler(this, this.newTagClick, ['type']);
            this._overlayUI.listType.array = allType;
            this._overlayUI.listTag.renderHandler = new Laya.Handler(this, this.newTagRender);
            this._overlayUI.listTag.mouseHandler = new Laya.Handler(this, this.newTagClick, ['tag']);
            this._overlayUI.listTag.array = [newTag.modern, newTag.ancient, newTag.cool, newTag.warm, newTag.school, newTag.dress, newTag.fantasy, newTag.charm, newTag.activity];
            this._overlayUI.listReqType.dataSource = _.map(reqStyle, (element: newTag, index: number) => { return { 'skin': `clothChange/twinkle/${element}.png`, 'x': 108 * index }; });
            this._overlayUI.pos(114, -13);
            this._overlayUI.btnTop.disabled = data.history == 0;
            this.mainUI.addChild(this._overlayUI);
            this.addEvents();
        }

        private addEvents(): void {
            BC.addEvent(this, this._overlayUI.btnShowTool, Laya.Event.CLICK, this, this.showTool);
            BC.addEvent(this, this._overlayUI.btnTop, Laya.Event.CLICK, this, this.onTop);
        }

        private removeEvents(): void {
            BC.removeEvent(this);
        }

        /**打开检索工具 */
        private showTool(e: Laya.Event) {
            this._overlayUI.boxTool.visible = !this._overlayUI.boxTool.visible;
            e?.stopPropagation();
            if (this._overlayUI.boxTool.visible) BC.addEvent(this, Laya.stage, Laya.Event.CLICK, this, this.checkClick);
            else BC.removeEvent(this, Laya.stage, Laya.Event.CLICK, this, this.checkClick);
        }

        private checkClick(e: Laya.Event) {
            if (this._overlayUI.boxTool?.hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY))
                return;
            if (this._overlayUI.btnShowTool?.hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                return;
            }
            this.showTool(null);
        }

        private newTagRender(item: ui.clothChange.twinkle.ClothTagUI) {
            let data: newTag = item.dataSource;
            item.imgTag.skin = `clothChange/twinkle/${data}.png`;
            item.imgSel.visible = this.curPickTag.indexOf(data) >= 0;
        }

        private newTagClick(flag: 'type' | 'tag', event: Laya.Event, idx: number) {
            if (event.type == Laya.Event.CLICK) {
                let data: newTag
                if (flag == 'type') data = this._overlayUI.listType.array[idx];
                else data = this._overlayUI.listTag.array[idx];
                let curIdx = this.curPickTag.indexOf(data);
                if (curIdx >= 0) {
                    this.curPickTag.splice(curIdx, 1);
                } else {
                    this.curPickTag.push(data);
                    for (let i: number = 0; i < this.pairTag.length; i++) {
                        let selfIdx = this.pairTag[i].indexOf(data);
                        if (selfIdx >= 0) {
                            _.remove(this.curPickTag, (o) => { return o == this.pairTag[i][1 - selfIdx] });
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
            this.mainUI.clothList.array = all;
        }

        protected onClothTypeChange(clothType: number) {
            super.onClothTypeChange(clothType);
            this._clothArr = this.mainUI.clothList.array;
            if (!this._overlayUI) return;
            this.showPickResult();
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
            net.sendAndWait(new pb.cs_get_show_clothing_score({ activityId: this._data.activity, frist: this._data.frist, second: this._data.second, clothIdList: ClothChangeModel.instance.person.getWearginIds() })).then((msg: pb.sc_get_show_clothing_score) => {
                let cloth = ClothChangeModel.instance.person.getWearginIds();
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.ModuleManager.open('christmasShow.ChristmasShowModule', { newscore: msg.score, cloth: cloth, addition1: msg.addition1, addition2: msg.addition2, addition3: msg.addition3 , initial:msg.initial});
            });
        }

        /** 回忆最高分*/
        private onTop(): void {
            net.sendAndWait(new pb.cs_show_clothing_score_remember({ activityId: this._data.activity })).then((msg: pb.sc_show_clothing_score_remember) => {
                if (!msg.clothIdList || msg.clothIdList.length == 0) return;
                ClothChangeModel.instance.person.replaceByIdArr(msg.clothIdList);
            });
        }
    }
}