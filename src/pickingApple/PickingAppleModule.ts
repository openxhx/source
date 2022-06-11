namespace pickingApple{
    /**
     * 双人采苹果
     * pickingApple.PickingAppleModule
     */
    export class PickingAppleModule extends ui.pickingApple.PickingAppleModuleUI{


        public readonly BASE_SPEED: number = 0.26;

        private _behaviors: Behavior[];
        private _bones: clientCore.Bone[];
        private _timeLines: Laya.TimeLine[];
        private _model: PickingAppleModel;
        private _control: PickingAppleControl;
        private _endTime: number;
        private _t: time.GTime;
        private _place: number;//我的位置
        private _index: number;
        private _gameOver: boolean;
        private _items: number[];
        private _waiting: boolean;

        constructor(){ super(); }
        init(data: {msg: pb.sc_notify_map_game_pick_items_begin,players: pb.IMapPlayer[]}): void{
            this.sign = clientCore.CManager.regSign(new PickingAppleModel(),new PickingAppleControl());
            this._model = clientCore.CManager.getModel(this.sign) as PickingAppleModel;
            this._control = clientCore.CManager.getControl(this.sign) as PickingAppleControl;

            this._behaviors = [];
            this._bones = [];
            this._timeLines = [];
            this._items = data.msg.itemIds;
            this._gameOver = false;

            //创建人物信息
            _.forEach(data.players,(element: pb.IMapPlayer)=>{ 
                this.createBone(element.place,element.player.sex);
                this.createBehavior(element.place);
                let nameLab: Laya.Text = this['name_'+element.place];
                nameLab.color = element.player.userid == clientCore.LocalInfo.uid ? '#ccff33' : '#ffffff';
                nameLab.changeText(element.player.nick);
                this['source_'+element.place].changeText('0');
                if(element.player.userid == clientCore.LocalInfo.uid) this._place = element.place;
            });
            //注册时间器
            this._endTime = data.msg.eTime;
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON,1000,this,this.onTime);
            //注册动画
            this.createAnimate();
            //设置道具
            this.createItems(data.msg.itemIds);
        }

        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.onExit);
            BC.addEvent(this,this,Laya.Event.CLICK,this,this.onHook);
            net.listen(pb.sc_notify_map_game_use_pick_pole,this,this.synUseTool);
            net.listen(pb.sc_notify_map_game_user_pick_items,this,this.synPickingItem);
            net.listen(pb.sc_notify_map_game_pick_items_finished,this,this.gameOver);
        }

        removeEventListeners(): void{
            BC.removeEvent(this);
            net.unListen(pb.sc_notify_map_game_use_pick_pole,this,this.synUseTool);
            net.unListen(pb.sc_notify_map_game_user_pick_items,this,this.synPickingItem);
            net.unListen(pb.sc_notify_map_game_pick_items_finished,this,this.gameOver);
        }

        popupOver(): void{
            clientCore.Logger.sendLog('2021年3月26日活动', '【游戏】果香的对决', '进入游戏');
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.UserInfoTip.hideTips();
            this._t.start();
        }

        destroy(): void{
            for(let i:number=0; i<2; i++){
                this._behaviors[i].dispose();
                this._bones[i].dispose();
                this._timeLines[i].destroy();
            }
            this._t?.dispose();
            this._t = null;
            this._bones.length = 0;
            this._timeLines.length = 0;
            this._behaviors.length = 0;
            this._bones = this._timeLines = this._behaviors = null;
            this._model = this._control = null;
            this._items.length = 0;
            this._items = null;
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
        }

        private onTime(): void{
            let now: number = clientCore.ServerManager.curServerTime;
            if(now >= this._endTime){
                this.clearTime();
                return;
            }
            this.timeTxt.changeText(`${this._endTime - now}`);
        }

        private clearTime(): void{
            this._t?.dispose();
            this._t = null;
            this.timeTxt.changeText('0');
        }

        private gameOver(msg: pb.sc_notify_map_game_pick_items_finished): void{
            alert.showReward(msg.items);
            this._gameOver = true;
            this.clearTime();
            this.destroy();
        }

        private onExit(): void{
            if(!this._gameOver){
                alert.showFWords('正在游戏中，不能退出哦~');
                return;
            }
            this.destroy();
        }

        /** 出钩子*/
        private async onHook(): Promise<void>{
            if(this._waiting)return;
            this._index = -1;
            this._waiting = true;
            let tool: Laya.Image = this[`tool_${this._place}`];
            let index: number = this._place - 1;
            let timeLine: Laya.TimeLine = this._timeLines[index];
            timeLine.pause();
            this._control.useTool(tool.rotation);
            let behavior: Behavior = this._behaviors[index];
            await behavior.elongation(this.BASE_SPEED,this,this.checkResult);
            if(this._closed)return;
            //计算信息
            let source: number = 0;
            let speed: number = this.BASE_SPEED * 0.6;
            if(this._index != -1){
                let cfg: xls.miniCatcher = xls.get(xls.miniCatcher).get(this._items[this._index]);
                speed = this.BASE_SPEED * cfg.dragTime / 10;
                source = cfg.catchPoint;
            }
            //拖回
            await behavior.takeBack(speed);
            if(this._closed)return;
            timeLine.resume();
            this._waiting = false;
            //加分
            if(source == 0)return;
            let lab: Laya.Text = this['source_' + this._place];
            lab.changeText(`${parseInt(lab.text) + source}`);
        }

        /** 使用工具的通知*/
        private synUseTool(msg: pb.sc_notify_map_game_use_pick_pole): void{
            let place: number = this._place == 1 ? 2 : 1;
            let tool: Laya.Image = this[`tool_${place}`];
            let index: number = place - 1;
            let timeLine: Laya.TimeLine = this._timeLines[index];
            let behavior: Behavior = this._behaviors[index];
            behavior.clearSpoil();
            behavior.clearTimer();
            timeLine.pause();
            tool.height = 91;
            tool.rotation = msg.angle;
            behavior.elongation(this.BASE_SPEED,this,this.checkResult).then(async(ret: number)=>{
                if(this._closed)return;
                if(ret == 1){
                    await behavior.takeBack(this.BASE_SPEED * 0.6);
                    timeLine.resume();
                }
            });
        }
  
        /** 获得物品的通知*/
        private async synPickingItem(msg: pb.sc_notify_map_game_user_pick_items): Promise<void>{
            let place: number = this._place == 1 ? 2 : 1;
            let tool: Laya.Image = this['tool_'+place];
            let behavior: Behavior = this._behaviors[place - 1];
            behavior.clearTimer();
            this.setAction(place,'happy');
            this.createSpoil(tool,msg.posId);
            let cfg: xls.miniCatcher = xls.get(xls.miniCatcher).get(this._items[msg.posId]);
            await behavior.takeBack(this.BASE_SPEED * cfg.dragTime / 10);
            if(this._closed)return;
            this._timeLines[place - 1]?.resume();
            this['source_' + place].changeText(`${msg.scores}`);
        }

        private createBone(place: number,sex: number): void{
            let bone: clientCore.Bone = clientCore.BoneMgr.ins.play(`res/animate/orchard/player${sex == 1 ? 'F' : 'M'}.sk`,'idle',true,this.spBone);
            bone.y = 657;
            bone.x = place == 1 ? 287 : 1034;
            bone.scaleX = place == sex ? -1 : 1;
            this._bones[place - 1] = bone;
        }

        private createBehavior(place: number): void{
            this._behaviors[place - 1] = new Behavior(this['tool_' + place],place);;
        }

        private createAnimate(): void{
            for(let i:number=1; i<=2; i++){
                let tool: Laya.Image = this['tool_' + i];
                tool.rotation = -60;
                let timeLine: Laya.TimeLine = new Laya.TimeLine();
                timeLine.to(tool,{rotation: 60},3000);
                timeLine.to(tool,{rotation: -60},3000);
                timeLine.play(0,true);
                this._timeLines.push(timeLine);
            }
        }

        /**
         * 判断结果
         * @param place
         * @return 1-出界 
         */
        private checkResult(place: number,height: number): number{
            //判断是否出界
            let tool: Laya.Image = this[`tool_${place}`];
            let angle: number = util.tofix(tool.rotation,2) * Math.PI / 180;
            let offset: number = clientCore.LayerManager.OFFSET;
            let x: number = tool.x - tool.width/2 + height * Math.sin(angle);
            let y: number = tool.y - height * Math.cos(angle);
            if(x < -offset || x > (1334 + offset) || y < 0){
                this.setAction(place,'scare');
                return 1;
            }
            //判断是否抓到物品、只有自己判断啊
            if(this._place == place && this.checkPick(angle,place,height))return 2;
            return 0;
        }

        /** 判断是否抓到物品*/
        private checkPick(angle: number,place: number,height: number): boolean{
            let tool: Laya.Image = this['tool_' + place];
            let x: number = tool.x + (height - 20)*Math.sin(angle);
            let y: number = tool.y - (height - 20)*Math.cos(angle);
            let len: number = this.boxItem.numChildren;
            let rect: Laya.Rectangle = Laya.Rectangle.create();
            for(let i:number=0; i<len; i++){
                let img: Laya.Image = this.boxItem.getChildAt(i) as Laya.Image;
                if(img.visible == false)continue;
                rect.setTo(img.x + this.boxItem.x,img.y + this.boxItem.y,img.width*img.scaleX,img.height*img.scaleY);
                if(rect.contains(x,y)){
                    this._index = i;
                    this._control.pickItem(i);
                    this.createSpoil(tool,i);
                    this.setAction(place,'happy');
                    return true;
                }
            }
            return false;
        }

        private createSpoil(tool: Laya.Image,index: number): void{
            let img: Laya.Image = this.boxItem.getChildAt(index) as Laya.Image;
            img.visible = false;
            let newImg: Laya.Image = new Laya.Image(img.skin);
            newImg.scaleX = img.scaleX;
            newImg.scaleY = img.scaleY;
            newImg.anchorX = 0.5;
            newImg.anchorY = 0.6;
            newImg.name = 'spoil';
            newImg.pos(tool.width/2,0);
            tool.addChild(newImg);
        }

        /**
         * 播放动作
         * @param place 
         * @param action 
         */
        private setAction(place: number,action: string): void{
            let bone: clientCore.Bone = this._bones[place - 1];
            if(!bone)return;
            bone.play(action,false,new Laya.Handler(this,()=>{ bone.play('idle',true); }));
        }

        /** 创建道具*/
        private createItems(ids: number[]): void{
            let len: number = this.boxItem.numChildren;
            for(let i:number=0; i<len; i++){
                let id: number = ids[i];
                let cfg: xls.miniCatcher = xls.get(xls.miniCatcher).get(id);
                let type: number = cfg.type;
                let img: Laya.Image = this.boxItem.getChildAt(i) as Laya.Image;
                img.skin = `pickingApple/${type < 4 ? 'da' : 'maomaochong'}.png`;
                switch(type){
                    case 1:
                    case 4:
                        img.scaleX = img.scaleY = 1;
                        break;
                    case 2:
                        img.scaleX = img.scaleY = 43 / 67;
                        break;
                    case 3:
                        img.scaleX = img.scaleY = 32 / 67;
                        break;

                }
            }
        }
    }
}