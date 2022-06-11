namespace snowNightFestival {
    /**
    * 雪夜梦幻祭item
    * snowNightFestival.SnowNightFestivalRender
    */
    export class SnowNightFestivalRender {
        private _data: any;

        private _panel: ui.snowNightFestival.render.FyzcItemRenderUI;

        constructor(p: any) {
            this._panel = p;
        }

        public init(d: any): void {
            this._data = d;
            this._panel.ico.skin = clientCore.ItemsInfo.getItemIconUrl(this._data.awards[0].v1);
            this.isSelect(false);
            this.isReceive(false);
        }

        public isSelect(value: boolean): void {
            this._panel.imgSelect.visible = value;
        }

        public isReceive(value: boolean): void {
            this._panel.imgReceive.visible = value;
        }

        public hasAward(id: number): boolean {
            if (this._data.hasAward) {
                return;
            }
            let awards = this._data.awards;
            for (let i = 0; i < awards.length; i++) {
                if (awards[i].v1 == id) {
                    this._data.hasAward = true;
                    return true;
                }
            }
            return false;
        }

        public isHasAward(): boolean {
            let awards = this._data.awards;
            for (let i = 0; i < awards.length; i++) {
                if (clientCore.ItemsInfo.getItemNum(awards[i].v1) > 0) {
                    return true;
                }
            }
            return false;
        }

        public get panel(): core.BaseModule {
            return this._panel;
        }

        public get awards(): Array<any> {
            return this._data.awards;
        }

        public destroy(): void {
            this._data = null;
            this._panel = null;
        }
    }
}