namespace roleChain2 {
    /**
     * 约会副本的路线地图
     */
    export class AffairMap extends Laya.Panel {
        private _lines: Array<ui.roleChain2.render.FlowerLineUI> = [];
        private _items: Object = {};
        private _roleId: number;

        private _arrow: Laya.Image;
        private _parentSp: AffairPanel;
        private _fightInfo: FightInfoPanel;
        private _affairInfo: clientCore.AffairInfo;

        constructor(sp: AffairPanel) {
            super();
            this._parentSp = sp;
            this._arrow = new Laya.Image("affair/jiantou.png");
            this.width = 330;
            this.height = 327;
            this.vScrollBarSkin = "";
        }

        public setData(roleId: number, info: xls.date) {
            this.clearMap();
            this._roleId = roleId;
            this._affairInfo = clientCore.AffairMgr.ins.getSrvDateInfo(roleId, info.dateId);
            this.drawMap(info.position);
            this.drawLine(info.position);
            this.drawArrow();
        }

        /** 绘制地图*/
        private drawMap(array: xls.pair[]): void {
            _.forEach(array, (element: xls.pair) => {
                let point: Laya.Point = this.getPointByIndex(element.v1 - 1);
                let xlsData: xls.dateStage = xls.get(xls.dateStage).get(element.v2);
                let btn: component.HuaButton = new component.HuaButton();
                btn.skin = this.getItemIco(xlsData.stageId);
                btn.isScale = true;
                btn.pos(point.x, point.y);
                btn.disabled = !this._affairInfo.checkPass(xlsData.stageId) && this._affairInfo.currentStageId != xlsData.stageId;
                this._items[xlsData.stageId] = btn;
                this.addChild(btn);
                BC.addEvent(this, btn, Laya.Event.CLICK, this, this.onClick, [xlsData]);
            })
        }

        private drawLine(array: xls.pair[]): void {
            _.forEach(array, (element: xls.pair) => {
                let xlsData: xls.dateStage = xls.get(xls.dateStage).get(element.v2);
                let item: component.HuaButton = this._items[xlsData.require];
                if (item) {
                    // 上一关卡通过 & （当前关卡通过 或 正在进行）
                    let isHeight: boolean = this._affairInfo.checkPass(xlsData.require) && (this._affairInfo.checkPass(xlsData.stageId) || xlsData.stageId == this._affairInfo.currentStageId);
                    let x: number = item.x;
                    let y: number = item.y;
                    item = this._items[xlsData.stageId];
                    this.drawFlowerLine([item.x, item.y, x, y], isHeight);
                }
            })
        }

        private drawArrow(): void {
            this._arrow.visible = this._affairInfo.currentStageId != 0;
            if (this._arrow.visible) {
                let item: component.HuaButton = this._items[this._affairInfo.currentStageId];
                if (item) {
                    let tex: Laya.Texture = Laya.loader.getRes(item.skin);
                    this._arrow.pos(item.x - tex.width / 2, item.y - tex.height);
                    this.addChild(this._arrow);
                }
            }
        }

        /**
         * 剧情点击
         * @param data 
         */
        private onClick(data: xls.dateStage): void {
            let status: number = clientCore.AffairMgr.ins.getStageStatus(this._roleId, data.dateId, data.stageId);
            if (status != 1) {
                this._parentSp.updateSel(data.stageId, status == 2 && data.branchStage == 1 ? 2 : 0);
                return;
            }
            if (data.vim > clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.HEALTH_ID)) {
                alert.showFWords('四叶草不足！');
                return;
            }
            switch (data.type) {
                case 1:
                case 3: //战斗关卡
                    this._parentSp.updateSel(data.stageId, 1);
                    break;
                case 2: //剧情关卡
                    clientCore.AnimateMovieManager.showAnimateMovie("" + data.movie[0].v2, this, (arr) => {
                        if (data.branchStage == 1 && arr.length <= 0) return; //分支剧情关卡跳过不发协议了
                        let choice: number = arr.length == 0 ? null : arr[0] + 1;
                        net.send(new pb.cs_pass_engagement_story_stage({ engageId: data.dateId, stageId: data.stageId, choice: choice }));
                    });
                    break;
                case 4: //小游戏关卡
                    this.goMiniGame(data.stageId);
                    break;
                case 5: //宝箱关卡
                    net.sendAndWait(new pb.cs_pass_engagement_reward_stage({ engageId: data.dateId, stageId: data.stageId })).then((msg: pb.sc_pass_engagement_reward_stage) => {
                        alert.showReward(clientCore.GoodsInfo.createArray(msg.rewardInfo), '获得奖励！');
                    })
                    break;
                default:
                    break;
            }
        }

        /**
         * 前往战斗
         * @param stageId 
         */
        public async goBattle(stageId: number) {
            let path: string = "atlas/fightInfo.atlas";
            if (!Laya.loader.getRes(path)) {
                clientCore.LoadingManager.showSmall();
                await xls.load(xls.monsterBase);
                await res.load(path, Laya.Loader.ATLAS);
                clientCore.LoadingManager.hideSmall();
            }
            this._fightInfo = this._fightInfo || new FightInfoPanel();
            this._fightInfo.show(stageId);
        }

        /** 前往小游戏*/
        private goMiniGame(stageId: number): void {
            clientCore.ModuleManager.closeModuleByName("roleChain2");
            let gameId: number = xls.get(xls.dateStage).get(stageId).miniGameId;
            let gameUrl = xls.get(xls.miniGameBase).get(gameId).gameUrl;
            clientCore.ModuleManager.open(gameUrl, { modelType: "dateStage", openType: "roleChain2", stageId: stageId, gameId: gameId, type: 1 }, { openWhenClose: "roleChain2.RoleChainModule", openData: 0 });
        }

        private clearMap(): void {
            BC.removeEvent(this);
            for (let key in this._items) {
                let element: component.HuaButton = this._items[key];
                element && element.destory();
                delete this._items[key];
            }
            for (let element of this._lines) {
                element && element.destroy();
            }
            this._lines.length = 0;
        }

        /**
         * 获取关卡ico
         * @param stageId 
         */
        private getItemIco(stageId: number): string {
            let xlsData: xls.dateStage = xls.get(xls.dateStage).get(stageId);
            let path: string = "";
            let status: number = clientCore.AffairMgr.ins.getStageStatus(this._roleId, xlsData.dateId, stageId);
            if (xlsData) {
                switch (xlsData.type) {
                    case 1:
                    case 3:
                        path = "affair/item_3.png";
                        break;
                    case 2:
                        path = ["affair/book1 _1.png", "affair/book1 _2.png", "affair/book1 _3.png"][status];
                        break;
                    case 4:
                        path = "affair/miniGame.png";
                        break;
                    case 5:
                        path = status == 2 ? "affair/treasurebox_2.png" : "affair/treasurebox_1.png";
                        break;
                }
            }

            if (path == "")
                debugger;

            return path;
        }

        private getPointByIndex(index: number): Laya.Point {
            let point: Laya.Point = Laya.Point.create();
            let row: number = Math.floor(index / 3);
            let column: number = index % 3;
            point.x = 30 + column * 120;
            point.y = 52 + row * 120;
            return point;
        }


        /** 绘制花之线条*/
        private drawFlowerLine(points: number[], isLastPass: boolean): void {
            let angle: number = 180 * Math.atan2(points[0] - points[2], points[1] - points[3]) / Math.PI - 90; //得到两点与原点的倾斜角
            let line: ui.roleChain2.render.FlowerLineUI = new ui.roleChain2.render.FlowerLineUI();
            line.anchorX = 0.5;
            line.pos((points[2] + points[0]) / 2, (points[3] + points[1]) / 2);
            line.rotation = angle;
            line.box.gray = !isLastPass;
            this.addChild(line);
            this._lines.push(line);
        }

        dispose(): void {
            this.clearMap();
            this._affairInfo = this._fightInfo = this._parentSp = this._items = this._lines = null;
        }
    }
}