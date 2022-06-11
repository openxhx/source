namespace mapBean {

    export class AnswerRoom {

        private _listener: AnswerListener;
        private _opening: boolean;//是否开放中
        private _id: number; //处于站台ID
        private _owner: pb.IMapPlayer;
        private _opponent: pb.IMapPlayer;//对手信息 有可能是空值
        private _started: boolean;

        constructor() { }

        init(listener: AnswerListener): void {
            this._listener = listener;
        }

        enter(id: number, players: pb.IMapPlayer[]): void {
            clientCore.AnswerMgr.open = true;
            this.addEvents();
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
            //TODO 这里触发确认弹窗
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.AnswerMgr.sureTime = clientCore.ServerManager.curServerTime + 10;
            clientCore.ModuleManager.open('answer.AnswerSureModule', msg.players);
        }

        exit(): void {
            clientCore.AnswerMgr.open = false;
            this.removeEvents();
            this._opening = false;
            this._started = false;
            this._owner = this._opponent = null;
            this._listener?.onExit(this._id);
        }

        leave(): void {
            this._opening && net.sendAndWait(new pb.cs_prepare_for_map_games({ type: 3 })).then((msg: pb.sc_prepare_for_map_games) => { EventManager.event(globalEvent.ANSWER_PREPARE_OUT, [msg.rooms]); })
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
            net.listen(pb.sc_notify_map_game_round_begin, this, this.synGameRoundBegin);
            net.listen(pb.sc_notify_map_game_round_result, this, this.synGameRoundResult);
            net.listen(pb.sc_notify_map_game_finished, this, this.synGameFinish);
            BC.addEvent(this, EventManager, globalEvent.ANSWER_EXIT, this, this.leave);
        }

        private removeEvents(): void {
            net.unListen(pb.sc_notify_map_player_preparation, this, this.synOpponent);
            net.unListen(pb.sc_notify_map_game_round_begin, this, this.synGameRoundBegin);
            net.unListen(pb.sc_notify_map_game_round_result, this, this.synGameRoundResult);
            net.unListen(pb.sc_notify_map_game_finished, this, this.synGameFinish);
            BC.removeEvent(this);
        }

        /**
         * 同步对手情况
         * type: 1确认准备 2取消准备 3离开房间 4进入房间
         */
        private synOpponent(msg: pb.sc_notify_map_player_preparation): void {
            switch (msg.type) {
                case 1:
                    EventManager.event(globalEvent.ANSWER_PREPARE_OPP_SURE, msg.player.place);
                    break;
                case 2:
                    alert.showFWords('有玩家取消了准备状态');
                    EventManager.event(globalEvent.CLSOE_ANSWER_MODULE);
                    //更新地图房间
                    this._started = false;
                    this._opponent = null;
                    let room: pb.MapRoom = new pb.MapRoom();
                    room.id = this._id;
                    room.players = [this._owner];
                    this._listener?.onUpdate(room);
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
        private synGameRoundBegin(msg: pb.sc_notify_map_game_round_begin): void {
            if (!this._opening) return;
            clientCore.ModuleManager.checkModuleOpen2('answer.AnswerGameModule')
                ?
                EventManager.event(globalEvent.ANSWER_UPDATE_Q, msg)
                :
                clientCore.ModuleManager.open('answer.AnswerGameModule', { msg: msg, players: [this._owner, this._opponent] });
        }

        /**
         * 回合结算通知
         * @param msg 
         */
        private synGameRoundResult(msg: pb.sc_notify_map_game_round_result): void {
            EventManager.event(globalEvent.ANSWER_UPDATE_A, msg);
        }

        /**
         * 游戏结束通知
         * @param msg 
         */
        private synGameFinish(msg: pb.sc_notify_map_game_finished): void {
            console.log('synGameFinish：close game panel.');
            EventManager.event(globalEvent.CLSOE_ANSWER_MODULE);
            clientCore.AnswerMgr.times--;
            clientCore.ModuleManager.open('answer.AnswerResultModule', msg);
            this._listener?.onFinish(this._id);
            this.exit();
        }

        private static _instance: AnswerRoom;
        public static get instance(): AnswerRoom {
            return this._instance || (this._instance = new AnswerRoom());
        }
    }
}