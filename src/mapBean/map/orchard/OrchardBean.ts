namespace mapBean {

    const POINTS: number[][] = [
        [100, 0],
        [1500, 0],
        [800, 350],
        [100, 700],
        [1500, 700]
    ]
    /**
     * 春日果园活动Bean
     */
    export class OrchardBean implements core.IMapBean {

        private _treeMap: Map<number, Tree>;

        async start(ui?: any, data?: any): Promise<void> {
            let msg: pb.sc_get_players_map_games_info = await this.getGameInfo();
            this.init(msg);
            this.addEvents();
        }
        touch(): void {

        }
        redPointChange(): void {

        }
        destroy(): void {
            clientCore.OrchardMgr.open = clientCore.OrchardMgr.start = false;
            OrchardRoom.instance.leave();
            this._treeMap.forEach((value: Tree) => { value?.destroy(); });
            this._treeMap.clear();
            this._treeMap = null;
            this.removeEvents();
        }

        private init(msg: pb.sc_get_players_map_games_info): void {
            clientCore.Logger.sendLog('2021年3月26日活动', '【游戏】果香的对决', '进入地图');
            this._treeMap = new Map();
            _.forEach(msg.rooms, (element: pb.IMapRoom) => { this.createTree(element); })
            let listener: AnswerListener = new AnswerListener();
            listener.onEnter = (id: number, place: number) => {
                let tree: Tree = this._treeMap.get(id);
                if (tree) {
                    let x: number = place == 1 ? tree.x + 143 : tree.x + 304;
                    let y: number = tree.y + 350;
                    let palyer: clientCore.Player = clientCore.PeopleManager.getInstance().player;
                    palyer.pos(x, y);
                    net.send(new pb.cs_move_in_map({ pos: { x: x, y: y } }));
                }
            }
            listener.onStart = () => {
            }
            listener.onFinish = (id: number) => {
                if (this._treeMap.has(id)) {
                    this._treeMap.get(id).room = null;
                }
            }
            listener.onExit = (id: number) => {
                let tree: Tree = this._treeMap.get(id);
                if (tree) {
                    let y: number = tree.y + 350;
                    let palyer: clientCore.Player = clientCore.PeopleManager.getInstance().player;
                    palyer.y -= 30;
                    net.send(new pb.cs_move_in_map({ pos: { x: palyer.x, y: palyer.y } }));
                }
            }
            listener.onUpdate = (msg: pb.MapRoom) => {
                if (!msg) return;
                this._treeMap.has(msg.id) && (this._treeMap.get(msg.id).room = msg);
            }
            OrchardRoom.instance.init(listener);
        }

        private addEvents(): void {
            net.listen(pb.sc_notify_map_game_rooms_changed, this, this.synChangeRoom);
            BC.addEvent(this, EventManager, globalEvent.ORCHARD_PREPARE_OUT, this, this.onOrchadOpt);
        }

        private removeEvents(): void {
            net.unListen(pb.sc_notify_map_game_rooms_changed, this, this.synChangeRoom);
            BC.removeEvent(this);
        }

        private getGameInfo(): Promise<pb.sc_get_players_map_games_info> {
            return net.sendAndWait(new pb.cs_get_players_map_games_info()).then((msg: pb.sc_get_players_map_games_info) => {
                return Promise.resolve(msg);
            })
        }

        private createTree(data: pb.IMapRoom): void {
            let tree: Tree = new Tree();
            let point: number[] = POINTS[data.id - 1];
            tree.pos(point[0], point[1]);
            tree.init(data);
            clientCore.MapManager.downLayer.addChild(tree);
            this._treeMap.set(data.id, tree);
        }

        /**
         * 房间变化通知
         */
        private synChangeRoom(msg: pb.sc_notify_map_game_rooms_changed): void {
            _.forEach(msg.rooms, (element: pb.IMapRoom) => {
                let tree: Tree = this._treeMap.get(element.id);
                tree.room = element;
                this.autoLeave(element);
            })
        }

        private autoLeave(data: pb.IMapRoom): void {
            if (OrchardRoom.instance.opening && data.id == OrchardRoom.instance.id) {
                let player: pb.IMapPlayer = _.find(data.players, (element) => { return element.player.userid == clientCore.LocalInfo.uid; });
                !player && OrchardRoom.instance.exit();
            }
        }

        private onOrchadOpt(rooms: pb.IMapRoom): void {
            OrchardRoom.instance.exit();
            _.forEach(rooms, (element: pb.IMapRoom) => {
                let tree: Tree = this._treeMap.get(element.id);
                tree.room = element;
            })
        }
    }
}