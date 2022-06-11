namespace mapBean {

    export class OrchardRoom {

        private _listener: OrchardListener;
        private _opening: boolean;//是否开放中
        private _id: number; //处于树ID
        private _owner: pb.IMapPlayer;
        private _opponent: pb.IMapPlayer;//对手信息 有可能是空值
        private _started: boolean;

        constructor() { }

        init(listener: OrchardListener): void {
            this._listener = listener;
        }

        enter(id: number, players: pb.IMapPlayer[]): void {
            this.addEvents();
            clientCore.OrchardMgr.open = true;
            this._opening = true;
            this._id = id;

            _.forEach(players, (element: pb.IMapPlayer) => {
                if (element.player.userid == clientCore.LocalInfo.uid) {
                    this._owner = element;
                } else {
                    this._opponent = element;
                }
            })

            this._listener?.onEnter(id, this._owner.place);
            this._opponent && this.start();
        }

        start(): void {
            if (this._started) return;
            let msg: pb.MapRoom = new pb.MapRoom();
            msg.id = this._id;
            msg.players = [this._owner, this._opponent];
            this._started = true;
            this._listener?.onStart();
            this._listener?.onUpdate(msg);
            clientCore.OrchardMgr.start = true;
        }

        exit(): void {
            clientCore.OrchardMgr.start = false;
            clientCore.OrchardMgr.open = false;
            this.removeEvents();
            this._opening = false;
            this._started = false;
            this._owner = this._opponent = null;
            this._listener?.onExit(this._id);
        }

        leave(): void {
            this._opening && net.sendAndWait(new pb.cs_prepare_for_map_games({ type: 3 })).then((msg: pb.sc_prepare_for_map_games) => { EventManager.event(globalEvent.ORCHARD_PREPARE_OUT, [msg.rooms]); })
        }

        dispose(): void {
            this._listener?.dispose();
            this._listener = null;
        }

        get opening(): boolean {
            return this._opening;
        }

        get id(): number {
            return this._id;
        }

        private addEvents(): void {
            net.listen(pb.sc_notify_map_player_preparation, this, this.synOpponent);
            net.listen(pb.sc_notify_map_game_pick_items_begin, this, this.synGameBegin);
            BC.addEvent(this, EventManager, globalEvent.ORCHARD_EXIT, this, this.leave);
        }

        private removeEvents(): void {
            net.unListen(pb.sc_notify_map_player_preparation, this, this.synOpponent);
            net.unListen(pb.sc_notify_map_game_round_begin, this, this.synGameBegin);
            BC.removeEvent(this);
        }

        /**
         * 同步对手情况
         * type: 1确认准备 2取消准备 3离开房间 4进入房间
         */
        private synOpponent(msg: pb.sc_notify_map_player_preparation): void {
            switch (msg.type) {
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    this._opponent = msg.player;
                    this.start();
                    break;
            }
        }

        /**
         * 回合开始通知
         * @param msg 
         */
        private synGameBegin(msg: pb.sc_notify_map_game_pick_items_begin): void {
            if (!this._opening) return;
            clientCore.ModuleManager.open('pickingApple.PickingAppleModule',{msg: msg,players: [this._owner,this._opponent]});
        }

        private static _instance: OrchardRoom;
        public static get instance(): OrchardRoom {
            return this._instance || (this._instance = new OrchardRoom());
        }
    }
}