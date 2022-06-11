namespace mapBean {
    /**
     * 树
     */
    export class Tree extends Laya.Image {
        private _room: pb.IMapRoom;
        private _units: clientCore.OtherUnit[];
        private _imgState: Laya.Image;
        private _state: number; //房间状态 1-空闲 2-比赛中 3-等待中

        constructor() { super(); }
        init(data: pb.IMapInfo): void {
            this.initView();
            this.addEvents();
            this._units = [];
            this.room = data;
        }
        initView(): void{
            this.skin = 'orchard/tree.png';
            //创建状态
            this._imgState = new Laya.Image();
            this._imgState.anchorX = this._imgState.anchorY = 0.5;
            this._imgState.pos(232,281);
            this.addChild(this._imgState);
        }
        addEvents(): void {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.onClick);
        }
        removeEvents(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            this._imgState.destroy();
            this._imgState = null;
            this._units.length = 0;
            this._units = this.room = null;
            this.removeEvents();
            super.destroy();
        }

        get state(): number{
            return this._state;
        }

        set state(value: number){
            if(value == this._state)return;
            this._state = value;
            this._imgState.skin = `orchard/${value}.png`;
        }

        get room(): pb.IMapRoom {
            return this._room;
        }

        set room(value: pb.IMapRoom) {
            this._room = null;
            this._room = value;
            //先清理台上创建的人物
            let len: number = this._units.length;
            for (let i: number = 0; i < len; i++) {
                this._units[i]?.dispose();
            }
            this._units.length = 0;
            if(!value)return;
            //设置状态
            this.state = value.players.length == 0 ? 1 : (value.players.length == 1 ? 3 : 2);
            //没有在地图内的则自我创建
            _.forEach(value.players, (element: pb.IMapPlayer) => {
                let uid: number = element.player.userid;
                let x: number = element.place == 1 ? this.x + 143 : this.x + 304;
                let y: number = this.y + 350;
                if (!clientCore.PeopleManager.getInstance().checkInMap(uid)) {
                    let unit: clientCore.OtherUnit = clientCore.OtherUnit.create();
                    unit.init(element.player);
                    unit.pos(x, y);
                    this._units.push(unit);
                } else {
                    if (clientCore.LocalInfo.uid != uid) {
                        let unit: clientCore.OtherUnit = clientCore.PeopleManager.getInstance().getOther(uid);
                        unit?.pos(x, y);
                    }
                }
            })
        }

        private onClick(): void {
            if(this._state == 2)return;
            let instance: OrchardRoom = OrchardRoom.instance;
            if(instance.opening){
                if(this._room.id == instance.id)return;
                alert.showSmall('是否离开当前苹果树？',{
                    callBack: {
                        caller: this,
                        funArr: [()=>{ instance.leave(); }]
                    }
                })
            }else{
                //确定位置
                let place: number = this.mouseX < this.width / 2 ? 1 : 2;
                net.sendAndWait(new pb.cs_enter_map_games_room({ id: this._room.id, place: place})).then((msg: pb.sc_enter_map_games_room) => {
                    this.room = msg.room;
                    //0成功 1房间被占用 2次数用完
                    switch (msg.result) {
                        case 0:
                            instance.enter(this.room.id,this.room.players);
                            core.SoundManager.instance.playSound('res/sound/countStand.ogg');
                            break;
                        case 1:
                            alert.showFWords('该位置已经有人了哦~');
                            break;
                        default:
                            break;
                    }
                })
            }
        }
    }
}