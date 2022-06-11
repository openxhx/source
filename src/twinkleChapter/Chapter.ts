namespace twinkleChapter {
    /**
     * 章节
     */
    export class Chapter extends Laya.Sprite {

        private _currentChapter: number; //当前通关到的章节
        private _lvMgs: pb.IcustomsInfo[];
        private _id: number;
        private _showId: number;//闪耀秀场用来显示章节资源
        private _levelPanel: LevelPanel;
        private _isHold: boolean;
        private _topUI: ui.twinkleChapter.panel.TopScorePanelUI;
        private _length: number; //本章节长度
        private _zeroPos: number[];
        private _defaultPos: number[];

        async init(info: { chapter: number, currentChapter: number }, msg: pb.IcustomsInfo[]): Promise<void> {
            this._id = info.chapter;
            this._showId = this._id >= 100 ? 100 : this._id;
            this._currentChapter = info.currentChapter;
            let path: string = `res/twinkleTransfg/bg/${this._showId}/data.json`;
            await res.load(path, Laya.Loader.JSON);
            let data: object = res.get(path);
            let row: number = data['row'];
            let col: number = data['col'];
            let childw: number = data['childSize'][0];
            let childh: number = data['childSize'][1];
            this.width = data['size'][0];
            this.height = data['size'][1];
            for (let i: number = 0; i < row; i++) {
                for (let j: number = 0; j < col; j++) {
                    this.graphics.loadImage(`res/twinkleTransfg/bg/${this._showId}/${i}_${j}.png`, j * childw, i * childh, childw, childh);
                }
            }
            this.createLevels(msg);
            if (this._id < 10) {
                this.createStart();
                this.createEnd();
            }
            this.on(Laya.Event.MOUSE_DOWN, this, this.onStartDrag);
        }

        destroy(): void {
            this._topUI?.destroy();
            this._topUI = null;
            this._levelPanel = null;
            this._lvMgs.length = 0;
            this._lvMgs = null;
            BC.removeEvent(this);
            super.destroy();
        }

        /** 创建所有关卡*/
        private createLevels(msg: pb.IcustomsInfo[]): void {
            this._lvMgs = msg;
            let data: object = res.get('res/json/twinkle/chapter.json');
            let points: number[][] = data[this._showId];
            let array: xls.shineTripStage[] = _.filter(xls.get(xls.shineTripStage).getValues(), (element: xls.shineTripStage) => { return element.requireCharpter == this._id; });
            this._length = array.length;
            this._zeroPos = points[0];
            for (let i: number = 0; i < this._length; i++) {
                this.createLevel(i, array[i], points[i], msg[i]);
            }
            if (!this._defaultPos) this._defaultPos = this._zeroPos;
            this.setDefaultPos();
        }

        /** 创建一个关卡*/
        private createLevel(index: number, cfg: xls.shineTripStage, point: number[], data: pb.IcustomsInfo): void {
            let item: ui.twinkleChapter.item.LevelItemUI = new ui.twinkleChapter.item.LevelItemUI();
            item.imgLv.skin = `twinkleChapter/${index + 1}.png`;
            item.imgBG.skin = `twinkleChapter/level_${this._showId}.png`;
            item.infoTxt.changeText(cfg.title);
            item.pos(point[0], point[1]);
            this.addChild(item);
            for (let i: number = 1; i < 4; i++) {
                item['star_' + i].visible = data && data.star >= i;
            }
            if (data && data.star > 0) {
                this._defaultPos = point;
            }
            let next: pb.IcustomsInfo = this._lvMgs[index - 1];
            if (index != 0 && (!next || next.star <= 0)) {
                item.imgBG.gray = true;
                // return;
            }
            BC.addEvent(this, item, Laya.Event.MOUSE_DOWN, this, this.onMouseDown, [index, cfg.id]);
        }

        private setDefaultPos() {
            let minX: number = Laya.stage.width - this.width - clientCore.LayerManager.OFFSET;
            let minY: number = Laya.stage.height - this.height;
            let maxX = minX + Math.abs(Laya.stage.width - this.width);
            let maxY = minY + Math.abs(Laya.stage.height - this.height);
            let posX = this.x - (this._defaultPos[0] - this._zeroPos[0]);
            let posY = this.y - (this._defaultPos[1] - this._zeroPos[1]);
            posX = _.clamp(posX, minX, maxX);
            posY = _.clamp(posY, minY, maxY);
            this.pos(posX, posY);
        }


        private readonly endParams: number[][] = [
            [2541, 1073],
            [2478, 836],
            [2644, 473]
        ]

        private readonly startParams: number[][] = [
            [218, 319],
            [202, 473]
        ]

        private createStart(): void {
            if (this._id == 1) return;
            let param: number[] = this.startParams[this._id - 2];
            let sp: Laya.Sprite = new Laya.Sprite();
            sp.size(370, 222);
            sp.pos(param[0], param[1]);
            this.addChild(sp);
            BC.addEvent(this, sp, Laya.Event.CLICK, this, this.goLast);
        }

        private goLast(): void {
            clientCore.ModuleManager.closeModuleByName('twinkleChapter');
            clientCore.ModuleManager.open('twinkleChapter.TwinkleChapterModule', { chapter: this._id - 1, currentChapter: this._currentChapter });
        }

        /**
         * x,y,w,h
         * 1-2541,1073,370,222
         * 2-2478,836,370,222
         * 3-2644,473,370,222
         */
        private createEnd(): void {
            let param: number[] = this.endParams[this._id - 1];
            let sp: Laya.Sprite = new Laya.Sprite();
            sp.size(370, 222);
            sp.pos(param[0], param[1]);
            this.addChild(sp);
            BC.addEvent(this, sp, Laya.Event.CLICK, this, this.goNext);
        }

        private goNext(): void {
            if (this._currentChapter > this._id && this._id < 3) {
                clientCore.ModuleManager.closeModuleByName('twinkleChapter');
                clientCore.ModuleManager.open('twinkleChapter.TwinkleChapterModule', { chapter: this._id + 1, currentChapter: this._currentChapter });
                return;
            }
            alert.showFWords('你还不能前往下一章');
        }

        private onMouseDown(index: number, id: number): void {
            let item: Laya.Sprite = this.getChildAt(index) as Laya.Sprite;
            Laya.timer.once(1000, this, this.onHold, [index]);
            BC.addEvent(this, item, Laya.Event.MOUSE_UP, this, this.onMouseUp, [index, id]);
            BC.addEvent(this, item, Laya.Event.MOUSE_OUT, this, this.onMouseOut, [index]);
        }

        private onHold(index: number): void {
            this._isHold = true;
            if (this._topUI == null) {
                this._topUI = new ui.twinkleChapter.panel.TopScorePanelUI();
            }
            if (this._topUI.parent == null) {
                this.addChild(this._topUI);
            }
            let item: Laya.Sprite = this.getChildAt(index) as Laya.Sprite;
            let score: number = this._lvMgs[index] ? this._lvMgs[index].topScore : 0;
            this._topUI.pos(item.x + item.width, item.y + item.height / 2);
            this._topUI.scale(0, 0);
            this._topUI.scoreTxt.changeText(score + '');
            util.TweenUtils.creTween(this._topUI, { scaleX: 1, scaleY: 1 }, 200, Laya.Ease.backOut, null, null, 'TwinkleChapterModule');
        }

        private onMouseUp(index: number, id: number): void {
            let item: Laya.Sprite = this.getChildAt(index) as Laya.Sprite;
            if (this._isHold) {
                this._isHold = false;
                this._topUI?.removeSelf();
            } else {
                let msg: pb.IcustomsInfo = this._lvMgs[index - 1];
                index == 0 || (msg && msg.star > 0) ? this.onClick(id, this._lvMgs[index] == null) : alert.showFWords('需要至少1星通关上一关后解锁');
                Laya.timer.clear(this, this.onHold);
            }
            BC.removeEvent(this, item, Laya.Event.MOUSE_UP, this, this.onMouseUp);
            BC.removeEvent(this, item, Laya.Event.MOUSE_OUT, this, this.onMouseOut);
        }

        private onMouseOut(item: Laya.Sprite): void {
            this._isHold = false;
            this._topUI?.removeSelf();
            Laya.timer.clear(this, this.onHold);
            BC.removeEvent(this, item, Laya.Event.MOUSE_UP, this, this.onMouseUp);
            BC.removeEvent(this, item, Laya.Event.MOUSE_OUT, this, this.onMouseOut);
        }

        private onStartDrag(): void {
            let x: number = Laya.stage.width - this.width;
            let y: number = Laya.stage.height - this.height;
            this.startDrag(new Laya.Rectangle(x - clientCore.LayerManager.OFFSET, y, Math.abs(x), Math.abs(y)));
        }

        private onClick(id: number, noData: boolean): void {
            let cfg: xls.shineTripStage = xls.get(xls.shineTripStage).get(id);
            if (this._id >= 100) {//闪耀秀场
                net.sendAndWait(new pb.cs_shine_change_start_level({ customsId: cfg.id, chapterId: cfg.requireCharpter })).then(() => {
                    clientCore.ModuleManager.closeModuleByName('twinkleChapter');
                    clientCore.ModuleManager.open('clothChange.ClothChangeModule', { cfg: cfg, noData: noData });
                });
                return;
            }
            this._levelPanel = this._levelPanel || new LevelPanel();
            this._levelPanel.show(cfg, noData);
            this._levelPanel.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([9900120, 9900119]);
                clientCore.UIManager.showCoinBox();
            });
        }
    }
}