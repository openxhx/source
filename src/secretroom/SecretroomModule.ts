namespace secretroom{
    /**
     * 密室 secretroom.SecretroomModule
     */
    export class SecretroomModule extends ui.secretroom.SecretroomModuleUI{
        public needOpenMod = 'heartPrison.HeartPrisonModule';
        /** 地图层级*/
        private _mapLayer: Laya.Sprite;
        private _alertLayer: Laya.Sprite;
        /** 房间*/
        private _room: IRoom;
        private _model: SecretroomModel;
        private _control: SecretroomControl;
        /** 一些状态值*/
        private _bagStatus:boolean;

        constructor(){ super(); }

        init(data:any): void{
            super.init(data);
            this.ani1.gotoAndStop(0);
            this.sign = clientCore.CManager.regSign(new SecretroomModel(),new SecretroomControl());
            this._model = clientCore.CManager.getModel(this.sign) as SecretroomModel;
            this._control = clientCore.CManager.getControl(this.sign) as SecretroomControl;
            this._alertLayer = this.addChildAt(new Laya.Sprite(),0) as Laya.Sprite;
            this._alertLayer.x = -clientCore.LayerManager.OFFSET;
            this.addChildAt(this.btnBack,0);
            this._mapLayer = this.addChildAt(new Laya.Sprite(),0) as Laya.Sprite;
            // 弹窗配置
            DialogMgr.configure(this.sign,this._alertLayer);
            // 背包初始化
            ItemBag.instance.init(this.list);
            // 资源加载
            this.addPreLoad(
                Promise.all([
                    res.load('res/json/secretroom/item.json',Laya.Loader.JSON),
                    xls.load(xls.escapeRoomLimit),
                    xls.load(xls.escapeRoomPlot)
                ])
            );
            // 播放背景音乐
            core.SoundManager.instance.playBgm('res/music/bgm/secretroom.mp3');
            // 适配
            this.resizeView();
        }

        onPreloadOver(): void{
            this._model.jsonData = res.get('res/json/secretroom/item.json');
            if(!this._model.jsonData){
                alert.showFWords('数据载入失败，无法进入房间.');
                this.destroy();
                return;
            }
            this.openRoom(this._data);
        }
        
        addEventListeners(): void{
            BC.addEvent(this,this.btnAnalysis,Laya.Event.CLICK,this,this.onAnalysis);
            BC.addEvent(this,this.btnBack,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnBag,Laya.Event.CLICK,this,this.onBag);
            BC.addEvent(this,this.btnRule,Laya.Event.CLICK,this,this.onRule);
            BC.addEvent(this,EventManager,Constant.FLY_TO_BAG,this,this.flyBag);
            BC.addEvent(this,EventManager,Constant.TRIGGER_TARGET,this,this.updateComplete);
            BC.addEvent(this,EventManager,Constant.UPDATE_STORY_POINT,this,this.updateStoryPoint);
        }

        removeEventListeners(): void{
            BC.removeEvent(this);
        }

        destroy(): void{
            util.TweenUtils.over('SecretroomModule');
            super.destroy();
            this._room?.exit();//退出房间
            this._room = this._model = this._control = null;
            clientCore.CManager.unRegSign(this.sign);
            DialogMgr.clear();
            ItemBag.instance.clear();
        }

        private resizeView(): void{
            let len: number = this.numChildren;
            for(let i: number=0; i<len; i++){
                let sp: Laya.Sprite = this.getChildAt(i) as Laya.Sprite;
                sp.x >= 1164 && sp.y <= 39 && (sp.x += clientCore.LayerManager.OFFSET);
            }
        }

        private async openRoom(id: number): Promise<void>{
            this._room?.exit();
            this._room = null;
            this._room = new Room();
            await this._room.enter(this.sign,id,this._mapLayer);
            let level: number = this._model.getLevel(id);
            if(level == void 0){
                level = await this._control.getLevel(id);
                this._model.setLevel(id,level);
            }
            let data: xls.escapeRoomLimit = xls.get(xls.escapeRoomLimit).get(id);
            this.targetTxt.changeText(data.targetDesc);
            this.updateStoryPoint();
            this.updateAnalysis(id,level);
            this._room.target = data.itemNeed;
            this.checkComplete();
            //播放第一次剧情
            await clientCore.MedalManager.getMedal([MedalConst['SECRETROOM_'+id]]).then((msg: pb.ICommonData[])=>{
                if(msg[0].value == 0){
                    clientCore.MedalManager.setMedal([{id: msg[0].id,value: 1}]);
                    clientCore.AnimateMovieManager.setParam({ selectArr: [], forceSkipOpt: 0, bgAlpha: 0.5 });
                    clientCore.AnimateMovieManager.showAnimateMovie(data.startAnimation,null,null,1);
                }
            });
        }

        private checkComplete(): boolean{
            let array: string[] = this._room.target.split('/');
            let key: string = array[0];
            let status: string = clientCore.SecretroomMgr.instance.read(key);
            let result: boolean = _.findIndex(_.slice(array,1),(element: string)=>{ return element == status}) != -1;
            this.imgYes.visible = result;
            return result;
        }
        
        private updateComplete(): void{
            if(this.imgYes.visible)return;
            if(this.checkComplete()){
                //播放结束动画
                let cfg: xls.escapeRoomLimit = xls.get(xls.escapeRoomLimit).get(this._room.id);
                if(cfg){
                    clientCore.Logger.sendLog('2020年10月30日活动', '【主活动】心灵之囚', `通关第${this._room.id}个房间`);
                    clientCore.AnimateMovieManager.setParam({ selectArr: [], forceSkipOpt: 0, bgAlpha: 0.5 });
                    clientCore.AnimateMovieManager.showAnimateMovie(cfg.endAnimation,null,null,1);
                }
            }
        }

        /**
         * 更新提示等级 
         * @param level 0-初级 1-中级 2-高级
         * @param data 
         */
        private updateAnalysis(id: number,level: number): void{
            let data: xls.escapeRoomLimit = xls.get(xls.escapeRoomLimit).get(id);
            this.btnAnalysis.visible = level < 2;
            this.tipsTxt.changeText(data['hintDesc'+[level+1]]);
        }

        /** 深入解析*/
        private onAnalysis(): void{
            let level: number = this._model.getLevel(this._room.id);
            if(level == void 0)return;
            let cfg: xls.globaltest = clientCore.GlobalConfig.config;
            let cost: xls.pair = level == 0 ? cfg.middleHintCost : cfg.highHintCost;
            let name: string = clientCore.ItemsInfo.getItemName(cost.v1);
            alert.showSmall(`是否消耗${cost.v2}${name}获得本房间内通关目标的进一步提示？`,{
                callBack:{
                    caller: this,
                    funArr: [async()=>{
                        if(!clientCore.ItemsInfo.checkItemsEnough([{itemID: cost.v1,itemNum: cost.v2}])){
                            alert.showFWords(`${name}不足哦~`);
                            return;
                        }
                        let id: number = this._room.id;
                        let level: number = await this._control.upLevel(id);
                        if(this._closed)return;
                        this._model.setLevel(id,level);
                        this.updateAnalysis(id,level);
                    }]
                }
            });
        }

        private onRule(): void{
            alert.showRuleByID(1103);
        }

        private onBag(): void{
            this._bagStatus = !this._bagStatus;
            this.ani1.wrapMode = this._bagStatus ?  Laya.AnimationBase.WRAP_POSITIVE : Laya.AnimationBase.WRAP_REVERSE;
            this.ani1.play(0,false);
        }

        /**
         * 道具飞到背包
         * @param id 道具ID
         */
        private flyBag(id: string): void{
            let img: Laya.Image = new Laya.Image(`res/secretroom/icon/${id}.png`);
            img.anchorX = img.anchorY = 0.5;
            img.pos(Laya.stage.width/2,Laya.stage.height/2);
            clientCore.LayerManager.upMainLayer.addChild(img);
            util.TweenUtils.creTween(img,{x: 1227 + 2*clientCore.LayerManager.OFFSET,y: 68},1200,Laya.Ease.cubicInOut,this,()=>{
                img?.destroy(); 
            },'SecretroomModule');
        }

        /** 更新剧情点*/
        private updateStoryPoint(): void{
            let array: xls.escapeRoomPlot[] = _.filter(xls.get(xls.escapeRoomPlot).getValues(),(element: xls.escapeRoomPlot)=>{ return element.roomId == this._room.id; } );
            if(array.length <= 0)return;
            let max: number = 0;
            let value: number = 0;
            _.forEach(array,(element: xls.escapeRoomPlot)=>{
                max += element.plotNum;
                clientCore.SecretroomMgr.instance.read(element.itemId+'') && (value += element.plotNum);
            });
            this.pointTxt.changeText(Math.floor(value/max*100)+'%');
        }
    }
}