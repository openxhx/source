namespace heartPrison{
    /**
     * 故事探索界面
     */
    export class StoryPanel extends ui.heartPrison.panel.StoryPanelUI{
        private _model: HeartPrisonModel;
        private _storySel: number = -1;
        constructor(){
            super();
            //头像
            this.headList.hScrollBarSkin = "";
            this.headList.scrollBar.elasticBackTime = 200;
            this.headList.scrollBar.elasticDistance = 100;
            this.headList.selectEnable = true;
            this.headList.renderHandler = new Laya.Handler(this,this.headRender,null,false);
            this.headList.selectHandler = new Laya.Handler(this,this.headSelect,null,false);
            //剧情
            this.plotList.vScrollBarSkin = "";
            this.plotList.scrollBar.elasticBackTime = 200;
            this.plotList.scrollBar.elasticDistance = 200;
            this.plotList.selectEnable = true;
            this.plotList.renderHandler = new Laya.Handler(this,this.plotRender,null,false);
            this.plotList.selectHandler = new Laya.Handler(this,this.plotSelect,null,false);
        }
        show(sign: number): void{
            this._model = clientCore.CManager.getModel(sign) as HeartPrisonModel;
            this.headList.array = this._model.getKeys();
            this.headList.selectedIndex = 0;
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.imgBig,Laya.Event.MOUSE_DOWN,this,this.onStartDrag);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        destroy(): void{
            this._model = null;
            super.destroy();
        }
    
        private headRender(item: ui.heartPrison.render.HeadRenderUI,index: number): void{
            let npcId: number = this.headList.array[index];
            item.imgIcon.skin = this._model.checkPlot(npcId) ? `res/secretroom/head/${npcId}.png` : 'heartPrison/touxiangweiz.png';
            item.imgSelect.visible = index == this.headList.selectedIndex;
        }
        private headSelect(index: number): void{
            let key: string = this.headList.array[index];
            if(!this._model.checkPlot(key)){
                alert.showFWords('暂未解锁');
                this.headList.selectedIndex = this._storySel;
                return;
            }
            this._storySel = index;
            this.plotList.array = this._model.getValues(key);
            this.plotList.selectedIndex = -1;
            this.plotList.selectedIndex = 0;
        }

        private plotRender(item: ui.heartPrison.render.PlotRenderUI,index: number): void{
            let cfg: xls.escapeRoomPlot = this.plotList.array[index];
            item.nameTxt.changeText(cfg.name);
            item.fromTxt.changeText(['卧室','书房','杂物间','阁楼','神秘房间'][cfg.roomId-1]);
            item.plotTxt.changeText(`剧情点：${cfg.plotNum}`);
            item.imgIcon.skin = `res/secretroom/icon/${cfg.itemId}.png`;
            item.imgSelect.visible = index == this.plotList.selectedIndex;
        }
        private plotSelect(index: number): void{
            if(index == -1)return;
            let cfg: xls.escapeRoomPlot = this.plotList.array[index];
            this.imgBig.visible = this.valueTxt.visible = cfg != null;
            if(!cfg)return;
            this.valueTxt.text = cfg.description;
            this.imgBig.skin = '';
            this.imgBig.skin = `res/secretroom/bigIcon/${cfg.itemId}.png`;
            this.imgBig.pos(364.5-this.imgBig.width/2,134.5 - this.imgBig.height/2);
        }
        private onStartDrag(): void{
            let x: number = 729 >= this.imgBig.width ? 0 : 729 - this.imgBig.width;
            let y: number = 269 >= this.imgBig.height ? 0 : 269 - this.imgBig.height;
            this.imgBig.startDrag(new Laya.Rectangle(x,y,Math.abs(729 - this.imgBig.width),Math.abs(269 - this.imgBig.height)),true,100);
        }
    }
}