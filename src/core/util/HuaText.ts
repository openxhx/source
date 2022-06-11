namespace util {

    export class HuaText extends Laya.Text {

        constructor() { super(); }

        public getWidth(): number {
            let len: number = 0;
            _.forEach(this._lineWidths, (ele: number) => {
                len += ele;
            });
            return len;
        }
    }
}