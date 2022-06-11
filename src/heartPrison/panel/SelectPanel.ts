namespace heartPrison{
    /**
     * 最终抉择
     */
    export class SelectPanel extends ui.heartPrison.panel.SelectPanelUI{
        private _handler: Laya.Handler;
        private _select: number;
        constructor(){ super(); }
        show(handler: Laya.Handler): void{
            this._handler = handler;
            this.onSelect(1);
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnSure,Laya.Event.CLICK,this,this.onSure);
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.imgSel_1,Laya.Event.CLICK,this,this.onSelect,[1]);
            BC.addEvent(this,this.imgSel_2,Laya.Event.CLICK,this,this.onSelect,[2]);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        destroy(): void{
            this._handler = null;
            super.destroy();
        }
        private onSure(): void{
            this._handler?.runWith(this._select);
            this.hide();
        }
        private onSelect(index: number): void{
            this._select = index;
            this.imgSel_1.skin = index == 1 ? 'heartPrison/xuanzhongzhuangtai.png' : 'heartPrison/weixuanzhongzhuangtai.png';
            this.imgSel_2.skin = index == 2 ? 'heartPrison/xuanzhongzhuangtai.png' : 'heartPrison/weixuanzhongzhuangtai.png';
        }
    }
}