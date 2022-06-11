
namespace clientCore {
    import PeopleManager = clientCore.PeopleManager;
    //视角限定框参数:飞行时人物只会在边框内移动,超框时移背景

    export class MobileImp implements BaseMoveImp {
        // private playerBody: Laya.Sprite;
        // private playerBone: clientCore.Person;
        private player: Player;
        //单指拖动
        private touchDownState: boolean;//单指按下标记
        private preTouchPos: Laya.Point;
        private mapOriPos: Laya.Point;
        //两指缩放
        private touchDown2State: boolean;//两指按下标记
        private mapOriDis2: number; //两指按下时距离（缩放前）
        private zoomCenter: Laya.Point;//缩放中心（两指按下时记录）
        //摇杆移动
        private joy: util.JoyStick;
        private joyMovingFlg: boolean;

        private _slowDownAcceleration: number = 0.8;//用来平滑减速的加速度

        private MAX_SPEED: number = 14;//人物移动速度
        private MAP_MOVE_RATIO: number = 0.1;//地图移动弹簧系数

        private _playerVelocity: util.Vector2D;

        private _peoplePos: Laya.Point;
        private _preMapPos: Laya.Point;
        private _startPos: Laya.Point; //开始飞行的位置

        private _joyView: ui.main.JoyStickUI;

        constructor() {
            this.player = PeopleManager.getInstance().player;
            this.zoomCenter = new Laya.Point(0, 0);
            this.mapOriPos = new Laya.Point(0, 0);
            this.preTouchPos = new Laya.Point(0, 0);
            this.createJoy();
            this._startPos = new Laya.Point(0, 0);
            this._playerVelocity = new util.Vector2D(0, 0);
        }

        private createJoy() {
            this._joyView = new ui.main.JoyStickUI();
            this._joyView.name = "JoyStickUI";
            let initPos = new Laya.Point(120, 436);
            this.joy = new util.JoyStick(initPos, this._joyView, LayerManager.joyLayer);
            this.joy.on(Laya.Event.START, this, this.onJoyStart);
            this.joy.on(Laya.Event.END, this, this.onJoyEnd);

            EventManager.on(globalEvent.MAIN_UI_CHANGE_SHOW_STATE, this, this.onMainUIShowStateChange);
        }

        private onJoyStart() {
            if(LocalInfo.onLimit){
                // alert.showFWords("雪人状态禁止移动~");
                return;
            }
            if (MapManager.isPickingMapItem) {
                alert.showSmall("采集期间不能移动，是否退出采集？", {
                    callBack: { caller: this, funArr: [() => { UserPickManager.ins.stopPick(); }] },
                    btnType: alert.Btn_Type.SURE_AND_CANCLE,
                    needMask: true,
                    clickMaskClose: true
                });
                return;
            }

            if (AnswerMgr.open) {
                alert.showSmall2('当前正在答题准备中，是否退出？', new Laya.Handler(this, () => { EventManager.event(globalEvent.ANSWER_EXIT); }));
                return;
            }

            if (OrchardMgr.open) {
                alert.showSmall2('当前正在果园采摘匹配中，是否退出？', new Laya.Handler(this, () => { EventManager.event(globalEvent.ORCHARD_EXIT); }));
                return;
            }

            if (TurkeyInfoManeger.ins.catching) {
                alert.showSmall('正在捕捉火鸡，不能移动！');
                return;
            }
            this._startPos.setTo(this.player.x, this.player.y);
            this.joyMovingFlg = true;
            Laya.timer.frameLoop(1, this, this.update);
            this.joy.on(Laya.Event.CHANGE, this, this.onJoyChange);
            this.player.flyAcceleration();
            UIManager.enabledBtns = false;
            EventManager.event(globalEvent.JOY_STICK_START);
            LayerManager.uiLayer.mouseEnabled = false;
            /** 引导部分 */
            let guideMainID = clientCore.GuideMainManager.instance.curGuideInfo.mainID;
            if (guideMainID == 1 || guideMainID == 23)
                this._peoplePos = PeopleManager.getInstance().getMyPosition();
            console.log("joy move start!");
            // if(UIManager.showUIFlag)
        }

        private update() {
            var realVel: util.Vector2D = this._playerVelocity.clone().divide(MapInfo.mapScale);
            this.movePlayer({ x: realVel.x, y: realVel.y });
            /** 引导部分 */
            let guideMainID = clientCore.GuideMainManager.instance.curGuideInfo.mainID;
            if ((guideMainID == 1 || guideMainID == 23) && !this._peoplePos)
                this._peoplePos = PeopleManager.getInstance().getMyPosition();
        }

        private onJoyChange(diff: { x: number, y: number }) {
            var force: util.Vector2D = new util.Vector2D(diff.x, diff.y);
            this._playerVelocity = force.normalize().multiply(this.MAX_SPEED);
            EventManager.event(globalEvent.JOY_STICK_CHANGE);
        }

        private movePlayer(diff: { x: number, y: number }) {
            if (OnsenRyokanManager.ins.selfBeginTime) {
                diff.x /= 5;
                diff.y /= 5;
            }
            //角色相对于屏幕的坐标 
            let now = MapManager.peopleLayer.localToGlobal(new Laya.Point(this.player.x, this.player.y));
            if (OnsenRyokanManager.ins.selfBeginTime) {
                this.checkMove('x', now.x, diff.x, [0, Laya.stage.width], [672, 1530]);
            } else {
                this.checkMove('x', now.x, diff.x, [0, Laya.stage.width], [0, MapInfo.mapWidth]);
            }
            if (MapInfo.type == 3) {//派对的上面位置不能飞
                this.checkMove('y', now.y, diff.y, [0, Laya.stage.height], [505, MapInfo.mapHeight]);
            }
            else if (OnsenRyokanManager.ins.selfBeginTime) {//在温泉里
                this.checkMove('y', now.y, diff.y, [0, Laya.stage.height], [660, 770]);
            }
            else {
                this.checkMove('y', now.y, diff.y, [0, Laya.stage.height], [0, MapInfo.mapHeight]);
            }

            // this.playerBone.scaleX = diff.x > 0 ? -PeopleManager.BASE_SCALE : PeopleManager.BASE_SCALE;
            this.player.reversal(diff.x > 0);
            MapManager.clampMap();
            if (!this.joyMovingFlg) {
                let tmpPos = new Laya.Point(LayerManager.mapLayer.x, LayerManager.mapLayer.y);
                if (!this._preMapPos || tmpPos.distance(this._preMapPos.x, this._preMapPos.y) < 0.5) {
                    Laya.timer.clear(this, this.update);
                }
                else {
                    this._preMapPos = tmpPos;
                }
            }
            else {
                this._preMapPos = new Laya.Point(LayerManager.mapLayer.x, LayerManager.mapLayer.y);
            }
        }

        private checkMove(axis: 'x' | 'y', now: number, move: number, boundStage: number[], boundMap: number[]) {
            if (this.joyMovingFlg) {
                //第一步 需要重新计算move了多少（传入的move是偏移量，还需要加入地图边界限定)
                let will = _.clamp(this.player[axis] + move, boundMap[0], boundMap[1]);//移动后坐标（限定在地图范围,这里不能用now,now是相对于屏幕的坐标）
                will = MapManager.peopleLayer.localToGlobal(new Laya.Point(will, will))[axis];//转回屏幕坐标系
                move = will - now;
                //人物移动
                this.player[axis] += (move / MapInfo.mapScale);
            }
            //镜头跟随
            let playerLocalPos = this.player[axis];
            let playerStagePos = MapManager.peopleLayer.localToGlobal(new Laya.Point(playerLocalPos, playerLocalPos))[axis];
            let diff = playerStagePos - boundStage[1] / 2;
            let dir = diff > 0 ? -1 : 1;
            let camSpeed = dir * Math.abs(diff) * this.MAP_MOVE_RATIO;
            this.moveMap(camSpeed / MapInfo.mapScale, axis);
            return camSpeed;
        }

        private moveMap(move: number, axis: 'x' | 'y') {
            clientCore.LayerManager.mapLayer[axis] += move;
        }

        private onJoyEnd() {
            if (Math.floor(this._startPos.x) == Math.floor(this.player.x) && Math.floor(this._startPos.y) == Math.floor(this.player.y)) { //玩家一像素之间的位移忽略
                return;
            }
            LayerManager.uiLayer.mouseEnabled = true;
            this.joyMovingFlg = false;
            this.touchDownState = false;
            this.player.flySlowDown();
            UIManager.enabledBtns = true;
            EventManager.event(globalEvent.JOY_STICK_END);
            this.joy.off(Laya.Event.CHANGE, this, this.onJoyChange);
            net.send(new pb.cs_move_in_map({ pos: { x: this.player.x, y: this.player.y } }));

            /** 引导部分 */
            //  let guideMainID = clientCore.GuideMainManager.instance.curGuideInfo.mainID;
            //  let subStepID = clientCore.GuideMainManager.instance.curGuideInfo.stepID;
            // if (guideMainID == 1 ) {
            if (clientCore.GuideMainManager.instance.isGuideAction && clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "operateJoystickMove") {
                let tmpPos = PeopleManager.getInstance().getMyPosition();
                if (this._peoplePos && this._peoplePos.distance(tmpPos.x, tmpPos.y) > 100) {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }
            if (!UIManager.showUIFlag) {
                this._joyView.alpha = 0;
            }
            console.log("joy move end!");
        }

        mouseDown(e: Laya.Event) {
            if (this.joyMovingFlg)
                return;
            //按下时（无论下列哪种状况 都要停止镜头跟踪）
            Laya.timer.clear(this, this.update);
            if (e.touches && e.touches.length == 2) {
                //两指缩放
                this.touchDown2State = true;
                this.mapOriDis2 = this.getDisByToTouches(e.touches[0], e.touches[1]);
                this.zoomCenter.setTo(e.touches[0].stageX + e.touches[1].stageX, e.touches[0].stageY + e.touches[1].stageY);
                this.zoomCenter.x /= 2;
                this.zoomCenter.y /= 2;
            }
            else {
                //鼠标拖动地图
                this.touchDownState = true;
                this.mapOriPos.setTo(clientCore.LayerManager.mapLayer.x, clientCore.LayerManager.mapLayer.y);
                this.preTouchPos.setTo(Laya.stage.mouseX, Laya.stage.mouseY);
            }
        }

        mouseMove(e: Laya.Event) {
            if (this.joyMovingFlg)
                return;
            //多点触控，手机上地图缩放操作
            if (e.touches && e.touches.length == 2 && this.touchDown2State) {
                let dis = this.getDisByToTouches(e.touches[0], e.touches[1]);
                let diff = dis - this.mapOriDis2; //两指移动后距离和指按下时距离插值
                MapManager.zoom(this.zoomCenter.x, this.zoomCenter.y, diff / 5);
            }
            else if (this.touchDownState) {
                //移动地图
                let curTouchPos = new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY);
                let disx: number = curTouchPos.x - this.preTouchPos.x;
                let disy: number = curTouchPos.y - this.preTouchPos.y;
                clientCore.LayerManager.mapLayer.x = this.mapOriPos.x + disx;
                clientCore.LayerManager.mapLayer.y = this.mapOriPos.y + disy;
                MapManager.clampMap();
            }
        }

        mouseUpOrOut(e: Laya.Event) {
            if (this.joyMovingFlg)
                return;
            this.touchDownState = false;
            this.touchDown2State = false;
        }

        enableMove() {
            this.joy.enable = true;
        }

        disableMove() {
            this.joy.enable = false;
        }

        mouseWheel(e: Laya.Event) {
            Laya.timer.clear(this, this.update);
            MapManager.zoom(Laya.stage.mouseX, Laya.stage.mouseY, e.delta);
        }

        private getDisByToTouches(a: any, b: any): number {
            let x = a.stageX - b.stageX;
            let y = a.stageY - b.stageY;
            return x * x + y * y;
        }

        private onMainUIShowStateChange() {
            if (!this.joyMovingFlg) {
                this._joyView.alpha = UIManager.showUIFlag ? 0.7 : 0;
            }

        }
    }
}