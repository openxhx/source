namespace mapBean {

    const POINTS: number[][] = [
        [100, 0],
        [1500, 0],
        [800, 350],
        [100, 700],
        [1500, 700]
    ]
    /**
     * 心有灵夕答题活动
     */
    export class AnswerBean implements core.IMapBean {

        private _msg: pb.sc_get_players_map_games_info;
        private _stations: Map<number, StationUI>;
        private _light: clientCore.Bone;

        async start(ui?: any, data?: any): Promise<void> {
            await clientCore.ModuleManager.loadatlas('answer');
            await this.getGameInfo();
            this.init();
            this.addEvents();
        }
        touch(): void {

        }
        redPointChange(): void {

        }
        destroy(): void {
            clientCore.AnswerMgr.debug = false;
            AnswerRoom.instance.leave();
            this._stations.forEach((value: StationUI) => { value?.dispose(); });
            this._stations.clear();
            this._stations = null;
            this._light?.dispose();
            this._light = null;
            this.removeEvents();
        }

        private init(): void {
            this._light = clientCore.BoneMgr.ins.play('res/animate/activity/light.sk', 0, true, clientCore.MapManager.downLayer);
            this._light.pos(Laya.stage.width, Laya.stage.height);
            this._stations = new Map();
            _.forEach(this._msg.rooms, (element: pb.IMapRoom) => { this.createStation(element); })
            let listener: AnswerListener = new AnswerListener();
            listener.onEnter = (id: number, place: number) => {
                let station = this._stations.get(id);
                if (station) {
                    let x: number = place == 1 ? station.x + 143 : station.x + 451;
                    let y: number = station.y + 250;
                    let palyer: clientCore.Player = clientCore.PeopleManager.getInstance().player;
                    palyer.pos(x, y);
                    net.send(new pb.cs_move_in_map({ pos: { x: x, y: y } }));
                }
            }
            listener.onStart = () => {
            }
            listener.onFinish = (id: number) => {
                if (this._stations.has(id)) {
                    this._stations.get(id).room = null;
                }
            }
            listener.onExit = (id: number) => {
                let station = this._stations.get(id);
                if (station) {
                    let y: number = station.y + 250;
                    let palyer: clientCore.Player = clientCore.PeopleManager.getInstance().player;
                    palyer.y -= 30;
                    net.send(new pb.cs_move_in_map({ pos: { x: palyer.x, y: palyer.y } }));
                }
            }
            listener.onUpdate = (msg: pb.MapRoom) => {
                if (!msg) return;
                this._stations.has(msg.id) && (this._stations.get(msg.id).room = msg);
            }
            AnswerRoom.instance.init(listener);
        }

        private addEvents(): void {
            net.listen(pb.sc_notify_map_game_rooms_changed, this, this.synChangeRoom);
            BC.addEvent(this, EventManager, globalEvent.ANSWER_PREPARE_OUT, this, this.onAnswerOpt);
        }

        private removeEvents(): void {
            net.unListen(pb.sc_notify_map_game_rooms_changed, this, this.synChangeRoom);
            BC.removeEvent(this);
        }

        private getGameInfo(): Promise<void> {
            return net.sendAndWait(new pb.cs_get_players_map_games_info()).then((msg: pb.sc_get_players_map_games_info) => {
                this._msg = msg;
                clientCore.AnswerMgr.times = 3 - msg.counts;
            })
        }

        private createStation(data: pb.IMapRoom): void {
            let station: StationUI = new StationUI();
            let point: number[] = POINTS[data.id - 1];
            station.pos(point[0], point[1]);
            station.init(data);
            clientCore.MapManager.upLayer.addChild(station);
            this._stations.set(data.id, station);
        }

        /**
         * 房间变化通知
         */
        private synChangeRoom(msg: pb.sc_notify_map_game_rooms_changed): void {
            _.forEach(msg.rooms, (element: pb.IMapRoom) => {
                let station: StationUI = this._stations.get(element.id);
                station.room = element;
                this.autoLeave(element);
            })
        }

        private autoLeave(data: pb.IMapRoom): void {
            if (AnswerRoom.instance.opening && data.id == AnswerRoom.instance.id) {
                let player: pb.IMapPlayer = _.find(data.players, (element) => { return element.player.userid == clientCore.LocalInfo.uid; });
                !player && AnswerRoom.instance.exit();
            }
        }

        private onAnswerOpt(rooms: pb.IMapRoom): void {
            AnswerRoom.instance.exit();
            _.forEach(rooms, (element: pb.IMapRoom) => {
                let station: StationUI = this._stations.get(element.id);
                station.room = element;
            })
        }
    }
}