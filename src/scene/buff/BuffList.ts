namespace scene.buff {
    /**
     * buff列表
     */
    export class BuffList {
        private _array: util.HashMap<Buff>;
        constructor() {
            this._array = new util.HashMap<Buff>();
        }

        public addBuff(BF: Buff): void {
            // 清理旧Buff
            let _maxLayer: number = BF.msg.layer;
            let _buff: Buff = this._array.get(BF.msg.buffId);
            if (_buff) {
                _buff.dispose();
                _maxLayer = _buff.maxLayer;
            }
            // 添加新buff
            BF.maxLayer = _maxLayer;
            this._array.add(BF.msg.buffId, BF);
            let len: number = this._array.length - 1;
            let x: number = (BF.binder.x - 61) + 35 * (len % 5);
            let y: number = (BF.binder.y - 230) - 35 * (Math.floor(len / 5));
            BF.start(x, y);
        }

        public removeBuff(buffID: number): void {
            let _buff: Buff = this._array.get(buffID);
            if (_buff) {
                _buff.dispose();
                this._array.remove(buffID);
            } else {
                console.warn("buff remove", "将要清理的buff并不存在哦~");
            }
        }

        public removeBuffs(): void {
            let _list: Buff[] = this._array.getValues();
            _.forEach(_list, (element: Buff) => {
                element && this.removeBuff(element.msg.buffId);
            })
        }

        public getBuff(id: number): Buff {
            return this._array.get(id);
        }

        public changeProp(name:string,value:any): void{
            let array:Buff[] = this._array.getValues();
            _.forEach(array,(element:Buff)=>{
                element?.changeProp(name,value);
            })
        }
        
    }
}