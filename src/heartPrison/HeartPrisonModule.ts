namespace heartPrison{
    /**
     * 万圣节主活动-心灵之囚 heartPrison.HeartPrisonModule
     */
    export class HeartPrisonModule extends ui.heartPrison.HeartPrisonModuleUI{

        private _storyPanel: StoryPanel;
        private _exchangePanel: ExchangePanel;
        private _selectPanel: SelectPanel;

        private _model: HeartPrisonModel;
        private _control: HeartPrisonControl;
        private _t: time.GTime;
        private _lock: number[];
        private _goRoom: boolean = false;

        private _bone: clientCore.Bone;

        constructor(){ super(); }
        init(): void{
            this.sign = clientCore.CManager.regSign(new HeartPrisonModel(),new HeartPrisonControl());
            this._model = clientCore.CManager.getModel(this.sign) as HeartPrisonModel;
            this._control = clientCore.CManager.getControl(this.sign);
            //资源预加载
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.commonBuy));
            this.addPreLoad(xls.load(xls.escapeRoomLimit));
            this.addPreLoad(xls.load(xls.escapeRoomPlot));
            this.addPreLoad(net.sendAndWait(new pb.cs_halloween_get_room_status()).then((msg: pb.sc_halloween_get_room_status)=>{
                this._model.select = msg.status;
            }));
            // 播放背景音乐
            core.SoundManager.instance.playBgm('res/music/bgm/secretroom.mp3',true);
            //
            this.resizeView();
        }
        onPreloadOver(): void{
            this._model.formatData();
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnBack,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnRule,Laya.Event.CLICK,this,this.onRule);
            BC.addEvent(this,this.btnStory,Laya.Event.CLICK,this,this.onStory);
            BC.addEvent(this,this.btnExchange,Laya.Event.CLICK,this,this.onExchange);

            for(let i: number=1; i<7; i++){
                BC.addEvent(this,this[`room_${i}`],Laya.Event.CLICK,this,this.onClick,[i]);
            }
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        destroy(): void{
            this.dispose();
            super.destroy();
        }

        popupOver(): void{
            this._lock = [];
            for(let i:number=1; i<6; i++){
                let open: boolean = this.checkOpen(i) == 0;
                this.updateRoom(i,open ? 1 : 0);
                !open && this._lock.push(i);
            }
            // 还有被锁住的房间
            if(this._lock.length > 0){
                this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON,1000,this,this.onTime);
                this._t.start();
            }
            // 检查大门是否开启 需要房间2通关
            this.updateDoorLamp(this.checkRoom(2));
            // 检查结果
            this.updateResult();
            clientCore.Logger.sendLog('2020年10月30日活动', '【主活动】心灵之囚', '打开活动界面');
        }

        private resizeView(): void{
            let len: number = this.numChildren;
            for(let i:number=0; i<len; i++){
                let sp: Laya.Sprite = this.getChildAt(i) as Laya.Sprite;
                sp.x >= 1261 && (sp.x += clientCore.LayerManager.OFFSET);
            }
        }

        private dispose(): void{
            !this._goRoom && core.SoundManager.instance.playBgm('res/music/bgm/home.mp3',true);
            this._t?.dispose();
            this._t = null;
            this._bone?.dispose();
            this._bone = null;
            this._lock.length = 0;
            this._lock = null;
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = this._storyPanel = this._exchangePanel = this._selectPanel = null;
        }

        private onClick(index: number): void{
            if(index == 6){ //大门
                let ret: number = this.getResult();
                switch(ret){
                    case 0:
                        alert.showFWords('大门似乎被锁上了');
                        break;
                    case 1:
                        this._selectPanel = this._selectPanel || new SelectPanel();
                        this._selectPanel.show(new Laya.Handler(this,(type: number)=>{
                            clientCore.SecretroomMgr.instance.write(73,clientCore.ItemEnum.IS_COM);
                            if(type == 1){ //选择离开
                                this.ani1.gotoAndStop(2);
                                this._bone = clientCore.BoneMgr.ins.play('res/animate/activity/door.sk',0,false,this.spDoor);
                                this._bone.pos(0,0);
                                this._bone.once(Laya.Event.COMPLETE,this,()=>{ 
                                    clientCore.AnimateMovieManager.showAnimateMovie(this._model.FINISH_STORY_1,this,this.updateResult,1);
                                });
                            }else{
                                clientCore.AnimateMovieManager.showAnimateMovie(this._model.FINISH_STORY_2,null,null,1);
                                this.updateResult();
                            }
                        }));
                        break;
                    default:
                        break;
                }
                return;
            }
            if(this.checkOpen(index) != 0)return;
            this.goSecretroom(index);
        }

        private goSecretroom(id: number): void{
            //如果是第五个房间 需要消耗钥匙
            if(id == 5 && clientCore.SecretroomMgr.instance.read(16) == clientCore.ItemEnum.IN_BAG){
                clientCore.SecretroomMgr.instance.write(16,clientCore.ItemEnum.IS_COM);   
            }
            this._goRoom = true;
            clientCore.DialogMgr.ins.closeAllDialog();
            this.destroy();
            clientCore.ModuleManager.open('secretroom.SecretroomModule',id);
        }

        private onTime(): void{
            let len: number = this._lock.length;
            let isTime: boolean = false;
            for(let i:number=0; i<len; i++){
                let id: number = this._lock[i];
                let ret: number = this.checkOpen(id);
                if(ret == 0){
                    this._lock.splice(i,1);
                    this.updateRoom(id,1);
                }else if(!isTime && ret > 0){
                    isTime = true;
                    this.updateTime(this._lock[i],ret);
                }
            }
            // 设置时间显示
            this.timeTxt.visible = isTime;
            // 清理定时器
            if(this._lock.length == 0){
                this._t?.dispose();
                this._t = null;
            }
        }

        private updateTime(id: number,dt: number): void{
            let door: Laya.Image = this['room_'+id];
            this.timeTxt.pos(door.x+21.5,door.y + 119.5);
            this.timeTxt.text = util.StringUtils.getDateStr2(dt,'{hour}:{min}:{sec}') + '后开启';
        }

        private onRule(): void{
            alert.showRuleByID(1101);
        }

        private onStory(): void{
            if(!this._model.checkAny()){
                alert.showFWords('当前暂未获得剧情道具，请前往房间内探索');
                return;
            }
            this._storyPanel = this._storyPanel || new StoryPanel();
            this._storyPanel.show(this.sign);
        }

        private onExchange(): void{
            this._exchangePanel = this._exchangePanel || new ExchangePanel();
            this._exchangePanel.show(this.sign);
        }

        /**
         * 更新房间状态
         * @param id 房间ID 
         * @param status 房间状态 0-未开启 1-开启了
         */
        private updateRoom(id: number,status: number): void{
            this[`room_${id}`].skin = `heartPrison/${id}-${status}.png`;
            this[`candle_${id}`].imgDark.visible = status == 0;
            this[`candle_${id}`].imgLight.visible = status == 1;
        }

        /**
         * 检查房间开启状态
         * @param id 房间ID
         * @return -1 玩家上个房间没有开启 >0 房间未到开启时间返回的是开启剩余时间 0房间开启了
         */
        private checkOpen(id: number): number{
            let cfg: xls.escapeRoomLimit
            // 检查开启时间
            cfg = xls.get(xls.escapeRoomLimit).get(id);
            let dt: number = util.TimeUtil.formatTimeStrToSec(cfg.openTime) - clientCore.ServerManager.curServerTime;
            if(dt > 0)return dt;
            // 检查上个房间
            if(id > 1 && !this.checkRoom(id - 1))return -1;
            return 0;
        }

        /**
         * 检查房间是否通关了
         * @param id 
         */
        private checkRoom(id: number): boolean{
            let cfg:xls.escapeRoomLimit  = xls.get(xls.escapeRoomLimit).get(id);
            let array: string[] = cfg.itemNeed.split('/');
            let key: string = array[0];
            let status: string = clientCore.SecretroomMgr.instance.read(key);
            return _.findIndex(_.slice(array,1),(element: string)=>{ return element == status; }) != -1;
        }

        /**
         * 更新大门的灯
         */
        private updateDoorLamp(open: boolean): void{
            this.candle_6_1.imgLight.visible  = this.candle_6_2.imgLight.visible = open;
            this.candle_6_1.imgDark.visible = this.candle_6_2.imgDark.visible = !open;
        }

        private updateResult(): void{
            let ret: number = this.getResult();
            this.ani1.gotoAndStop(ret);
        }

        private getResult(): number{
            let ret: string = clientCore.SecretroomMgr.instance.read(73);
            let select: number = this._model.select;
            if(ret == void 0)return 0; //无钥匙
            if(ret == clientCore.ItemEnum.IN_BAG)return 1;//有钥匙
            if(select != 2)return 3; //做出选择
        }
    }
}