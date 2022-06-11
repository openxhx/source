namespace clientCore {
    export class MapExpandBtn extends ui.mapExpand.mapExpandBtnUI {
        private _areaId: number;
        private _canExpandFlag: boolean;

        constructor(id: number) {
            super();
            this.areaId = id;
            this.canExpandFlag = false;
            this.currFocus = false;
        }

        public set areaId(id: number) {
            this._areaId = id;
        }

        public get canExpandFlag(): boolean {
            return this._canExpandFlag;
        }

        public set canExpandFlag(flag: boolean) {
            this._canExpandFlag = flag;
            this.visible = flag;
        }

        public get areaId(): number {
            return this._areaId;
        }

        public set currFocus(b: boolean) {
            this.imgExpand.visible = b;
            this.imgFlg.skin = b ? 'expandUI/close.png' : 'expandUI/open.png';
        }

        public get currFocus() {
            return this.imgExpand.visible;
        }
        
    }
}