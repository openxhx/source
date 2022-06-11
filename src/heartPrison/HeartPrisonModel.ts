namespace heartPrison {

    export class HeartPrisonModel implements clientCore.BaseModel {

        private _obj: object;
        /** 结局的剧情*/
        public readonly FINISH_STORY_1: number = 80407;
        public readonly FINISH_STORY_2: number = 80406;
        public msg: pb.sc_halloween_active_panel;
        public select: number; // 0-留下 1-离开 2-还未选择

        constructor() { }

        formatData(): void {
            this._obj = {};
            _.forEach(xls.get(xls.escapeRoomPlot).getValues(), (element: xls.escapeRoomPlot) => {
                let array: xls.escapeRoomPlot[] = this._obj[element.npcId];
                if (!array) {
                    array = [];
                    this._obj[element.npcId] = array;
                }
                array.push(element);
            })
        }

        getKeys(): string[] {
            let list: string[] = [];
            for (let key in this._obj) { list.push(key); }
            return _.sortBy(list, (element: string) => { return !this.checkPlot(element); });
        }

        getValues(id: number | string): xls.escapeRoomPlot[] {
            return _.filter(this._obj[id], (element: xls.escapeRoomPlot) => { return clientCore.SecretroomMgr.instance.read(element.itemId); })
        }

        dispose(): void {
            this.msg = this._obj = null;
        }

        /**
         * 检查这个人物是否开启了剧情
         * @param id 
         */
        checkPlot(id: number | string): boolean {
            let array: xls.escapeRoomPlot[] = this._obj[id];
            if (!array) return false;
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                if (clientCore.SecretroomMgr.instance.read(array[i].itemId)) return true;
            }
            return false;
        }

        /** 检查是否开启了任一剧情*/
        checkAny(): boolean {
            for (let key in this._obj) {
                if (this.checkPlot(key)) return true;
            }
            return false;
        }
    }
}