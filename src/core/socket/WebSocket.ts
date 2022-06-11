namespace net {
    export class HuaWebSocket extends Laya.EventDispatcher {
        private _ws: WebSocket;
        private _isConnected: boolean = false;
        private _seq: number = 0;
        private _uid: number;
        private _addr: string;

        constructor() { super(); }

        get isConnected(): boolean {
            return this._isConnected;
        }

        public connect(addr: string, uid: number) {
            this._uid = core.SignMgr.useSign ? core.SignMgr.uid : uid;
            this._addr = addr;
            this._isConnected = false;
            let ws = new WebSocket(addr);
            ws.onclose = this.onClose.bind(this);
            ws.onerror = this.onError.bind(this);
            ws.onopen = this.onOpen.bind(this);
            ws.onmessage = this.onMessage.bind(this);
            this._ws = ws;
        }
        public close() {
            if (this._isConnected)
                this._ws.close();
        }
        private onMessage(e: any) {
            let buffer = new Laya.Byte(e.data);
            while (buffer.bytesAvailable > 0) {
                let len = buffer.getUint32();
                let headLen = buffer.getUint32();
                let zip = buffer.getUint8();
                let head = JSON.parse(buffer.readUTFBytes(headLen - 5));
                let body = buffer.readUint8Array(buffer.pos, len - headLen - 4);
                this.event(Laya.Event.MESSAGE, { head: head, body: body });
            }
        }
        public nextSeq(): number {
            return this._seq + 1;
        }
        public send(cmd: string, data: any) {
            if (!this._isConnected || this._ws.readyState > 1) {
                return 0;
            }
            this._seq++;
            let head = {};
            head['cmd'] = cmd;
            head['type'] = 0;
            head['seq'] = this._seq;
            head['ret'] = 0;
            head['uid'] = this._uid;
            let headBuffer = new Laya.Byte();
            headBuffer.writeUTFBytes(JSON.stringify(head));
            let buff = new Laya.Byte();
            buff.writeUint32(0);//总长占位
            buff.writeUint32(headBuffer.length + 5);//headLen
            buff.writeUint8(0);//zip 默认发0
            buff.writeArrayBuffer(headBuffer.buffer);//head字段
            buff.writeArrayBuffer(data);//data字段
            buff.pos = 0;//移到第一位
            buff.writeUint32(buff.length);//写个总长
            this._ws.send(buff.buffer);
        }
        private onOpen(e: any) {
            this._isConnected = true;
            this._ws.binaryType = "arraybuffer";
            this.event(Laya.Event.OPEN, e);
        }
        private onClose(e: any) {
            this._isConnected = false;
            this.event(Laya.Event.CLOSE, e);
        }
        private onError(e: any) {
            this._isConnected = false;
            this.event(Laya.Event.ERROR, e);
        }

        /** 重新连接*/
        public reconnect(): void {
            this._ws = null;
            this.connect(this._addr, this._uid);
        }
    }
}