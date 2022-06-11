namespace mapBean {
    /**
     * 站台
     */
    export class StationUI extends ui.answer.panel.PlatformPanelUI {
        private _room: pb.IMapRoom;
        private _full: boolean; //是否满人了
        private _units: clientCore.OtherUnit[];

        constructor() { super(); }
        init(data: pb.IMapInfo): void {
            this.addEvents();
            this._units = [];
            this.room = data;
        }
        addEvents(): void {
            BC.addEvent(this, this.hitArea_1, Laya.Event.CLICK, this, this.onClick, [1]);
            BC.addEvent(this, this.hitArea_2, Laya.Event.CLICK, this, this.onClick, [2]);
        }
        removeEvents(): void {
            BC.removeEvent(this);
        }
        dispose(): void {
            this._units = this.room = null;
            this.removeEvents();
        }

        get room(): pb.IMapRoom {
            return this._room;
        }

        set room(value: pb.IMapRoom) {
            this._room = null;
            this._room = value;
            this._full = value && value.players.length >= 2;
            this.answer_1.visible = !this._full;
            this.answer_2.visible = this._full;

            //先清理台上创建的人物
            let len: number = this._units.length;
            for (let i: number = 0; i < len; i++) {
                this._units[i]?.dispose();
            }
            this._units.length = null;

            //没有在地图内的则自我创建
            value && _.forEach(value.players, (element: pb.IMapPlayer) => {
                let uid: number = element.player.userid;
                let x: number = element.place == 1 ? this.x + 143 : this.x + 451;
                let y: number = this.y + 250;
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

        private onClick(place: number): void {
            if (clientCore.AnswerMgr.times <= 0) {
                alert.showFWords('小花仙，你的次数不足了哟！');
                return;
            }

            if (!clientCore.AnswerMgr.checkActivity()) {
                alert.showFWords('未在活动时间内！');
                return;
            }

            let answerR: AnswerRoom = AnswerRoom.instance;
            if (answerR.opening) {
                if (answerR.id != this._room.id) return;
                alert.showSmall2('是否确认离开花灯', new Laya.Handler(this, () => {
                    answerR.leave();
                }))
            } else {
                if (this._full || answerR.opening) return;
                if (_.find(this._room.players, (ele) => { return ele.place == place; })) {
                    alert.showFWords('小花仙，该位置已经有人了哟~');
                    return;
                }

                net.sendAndWait(new pb.cs_enter_map_games_room({ id: this._room.id, place: place })).then((msg: pb.sc_enter_map_games_room) => {
                    this.room = msg.room;
                    //0成功 1房间被占用 2次数用完
                    switch (msg.result) {
                        case 0:
                            answerR.enter(this._room.id, msg.room.players);
                            core.SoundManager.instance.playSound('res/sound/countStand.ogg');
                            break;
                        case 1:
                            alert.showFWords('小花仙，该位置已经有人了哟~');
                            break;
                        case 2:
                            clientCore.AnswerMgr.times = 0;
                            alert.showFWords('小花仙，你的次数不足了哟~');
                            break;
                        default:
                            break;
                    }
                })
            }
        }
    }
}