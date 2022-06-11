namespace awakeSpringGame {
    /**
     * 唤醒冬眠动物交互
     * awakeSpringGame.AwakeSpringGameModule
     */
    export class AwakeSpringGameModule extends ui.aweakSpringGame.AweakSpringGameModuleUI {
        private ani_name: string;
        private ani_animal: clientCore.Bone;
        private ani_light: clientCore.Bone;
        private ani_awake: clientCore.Bone;
        private ani_type: number;
        private points: number[][] = [
            [8, 9, 6, 2, 11, 4],
            [1, 3, 5, 8, 4, 11],
            [1, 5, 2, 8, 4, 10],
            [5, 8, 6, 3, 11, 4],
            [1, 5, 2, 3, 11, 7],
            [6, 8, 2, 3, 4, 11],
            [8, 9, 7, 2, 4, 3]
        ];

        private _points: number[];
        private _line: Laya.Image[];
        private _linePoints: number[];
        private showCd: number;
        private lineCd: number;
        private curLine: Laya.Image;
        private gameStart: boolean;
        private isMistake: boolean;
        private _waiting: boolean;
        init(type: number) {
            this.ani_type = type;
            this.ani_name = type == 1 ? "owl" : type == 2 ? "rabbit" : "tortoise";
            this.addPreLoad(res.load("res/animate/awakeSpring/huanxing.png"));
            this.addPreLoad(res.load(`res/animate/awakeSpring/${this.ani_name}.png`));
            let need = clientCore.AwakeSpringManager.ins.awakeCnt == 0 ? 4 : clientCore.AwakeSpringManager.ins.awakeCnt < 4 ? 5 : 6;
            let group = this.points[Math.floor(Math.random() * 6.9)];
            this._points = [];
            this._linePoints = [];
            this._line = [];
            for (let i = 1; i < 12; i++) {
                this["point" + i].visible = false;
            }
            for (let i = 0; i < need; i++) {
                let idx = Math.floor(Math.random() * group.length);
                let point = group.splice(idx, 1)[0];
                this._points.push(point);
                this["point" + point].visible = true;
            }
            this.box1.visible = type == 1;
            this.box2.visible = type == 2;
            this.box3.visible = type == 3;
            this[`animal${type}_1`].visible = true;
            this[`animal${type}_2`].visible = false;
            this.lineCd = 5;
            this.showCd = need + 2;
            this.labTime.text = "" + this.showCd;
        }

        async onPreloadOver() {
            Laya.timer.loop(1000, this, this.onTime);
        }

        private onTime() {
            if (this.showCd > 0) {
                this.showCd--;
                if (this.showCd == 0) {
                    this.imgTip.skin = "awakeSpringGame/tip.png";
                    this.labTime.text = "" + this.lineCd;
                    this.gameStart = true;
                    this.ani_light.dispose();
                    return;
                }
                if (this.showCd <= this._points.length) {
                    if (!this.ani_light) this.ani_light = clientCore.BoneMgr.ins.play("res/animate/awakeSpring/lightC.sk", 0, true, this.boxPoint);
                    let point = this._points[this._points.length - this.showCd];
                    this.ani_light.pos(this["point" + point].x, this["point" + point].y);
                }
                this.labTime.text = "" + this.showCd;
                return;
            }
            if (this.lineCd > 0 && this.gameStart) {
                this.lineCd--;
                this.labTime.text = "" + this.lineCd;
                if (this.lineCd == 0) {
                    this.destroy();
                }
            }
        }

        private mouseDown(e: Laya.Event) {
            if (!this.gameStart) return;
            BC.addEvent(this, this, Laya.Event.MOUSE_UP, this, this.mouseUp);
            BC.addEvent(this, this, Laya.Event.MOUSE_OUT, this, this.mouseUp);
            BC.addEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.mouseMove);
            let x = e.currentTarget.mouseX - this.boxPoint.x;
            let y = e.currentTarget.mouseY - this.boxPoint.y;
            this.checkTrigerPoint(x, y);
        }

        private mouseUp() {
            BC.removeEvent(this, this, Laya.Event.MOUSE_UP, this, this.mouseUp);
            BC.removeEvent(this, this, Laya.Event.MOUSE_OUT, this, this.mouseUp);
            BC.removeEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.mouseMove);
            this.lineOver();
        }

        private mouseMove(e: Laya.Event) {
            let x = e.currentTarget.mouseX - this.boxPoint.x;
            let y = e.currentTarget.mouseY - this.boxPoint.y;
            this.checkTrigerPoint(x, y);
            if (this.curLine) {
                let point = this._linePoints[this._linePoints.length - 1];
                let pointX = this["point" + point].x;
                let pointY = this["point" + point].y;
                let dx = x - pointX;
                let dy = y - pointY;
                this.curLine.width = Math.sqrt(dx * dx + dy * dy);
                let radian = Math.atan2(dy, dx);
                let angle = radian * 180 / Math.PI;
                this.curLine.rotation = angle;
            }
        }

        private checkTrigerPoint(x, y) {
            for (let i: number = 0; i < this._points.length; i++) {
                if (this._linePoints.indexOf(this._points[i]) >= 0) continue;
                let pointX = this["point" + this._points[i]].x;
                let pointY = this["point" + this._points[i]].y;
                if (x > pointX - 25 && x < pointX + 25 && y > pointY - 25 && y < pointY + 25) {
                    if (this.curLine) {
                        let dx = pointX - this.curLine.x;
                        let dy = pointY - this.curLine.y;
                        this.curLine.width = Math.sqrt(dx * dx + dy * dy);
                        let radian = Math.atan2(dy, dx);
                        let angle = radian * 180 / Math.PI;
                        this.curLine.rotation = angle;
                    }
                    this.curLine = new Laya.Image("awakeSpringGame/line.png");
                    this.curLine.anchorY = 0.5;
                    this.boxPoint.addChildAt(this.curLine, 0);
                    this.curLine.pos(pointX, pointY);
                    this._line.push(this.curLine);
                    this.isMistake = this.isMistake || this._linePoints.length != i;
                    if (this._linePoints.length == i) {
                        this["point" + this._points[i]].skin = "awakeSpringGame/zheng_que_xuan_ze.png";
                        core.SoundManager.instance.playSound('res/sound/normal.ogg');
                    } else {
                        this["point" + this._points[i]].skin = "awakeSpringGame/cuo_wu_xuan_ze.png";
                        core.SoundManager.instance.playSound('res/sound/error.ogg');
                    }
                    this._linePoints.push(this._points[i]);
                }
            }
            if (this._linePoints.length == this._points.length) this.mouseUp();
        }

        private resetAll() {
            for (let i = 0; i < this._points.length; i++) {
                this["point" + this._points[i]].skin = "awakeSpringGame/ji_ben_xiao_yuan_dian.png";
            }
            for (let i = 0; i < this._line.length; i++) {
                this._line[i].destroy();
            }
            this._linePoints = [];
            this._line = [];
            this.curLine = null;
            this.isMistake = false;
        }

        private lineOver() {
            if (this.isMistake || this._linePoints.length < this._points.length) {
                this.resetAll();
            } else {
                this.gameStart = false;
                this._waiting = true;
                this.ani_awake = clientCore.BoneMgr.ins.play("res/animate/awakeSpring/huanxing.sk", 0, false, this.boxAnimal);
                this.ani_awake.pos(104, 196);
                this.ani_awake.once(Laya.Event.COMPLETE, this, () => {
                    this.ani_awake.dispose();
                    this.ani_awake = null;
                    this[`animal${this.ani_type}_1`].visible = false;
                    this.ani_animal = clientCore.BoneMgr.ins.play(`res/animate/awakeSpring/${this.ani_name}.sk`, 0, false, this["box" + this.ani_type]);
                    let x = this.ani_type == 1 ? 100 : this.ani_type == 2 ? 107 : 83;
                    let y = this.ani_type == 1 ? 272 : this.ani_type == 2 ? 251 : 194;
                    this.ani_animal.pos(x, y);
                    core.SoundManager.instance.playSound('res/sound/rare.ogg');
                    this.ani_animal.once(Laya.Event.COMPLETE, this, () => {
                        this.ani_animal.dispose();
                        this.ani_animal = null;
                        this[`animal${this.ani_type}_2`].visible = true;
                        net.sendAndWait(new pb.cs_new_spring_mini_game({ result: 1 })).then((msg: pb.sc_new_spring_mini_game) => {
                            alert.showReward(msg.items);
                            clientCore.AwakeSpringManager.ins.awakeCnt++;
                            clientCore.AwakeSpringManager.ins.removeCurAni();
                            this._waiting = false;
                        })
                    })
                })
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this, Laya.Event.MOUSE_DOWN, this, this.mouseDown);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTime);
        }

        destroy() {
            if (this._waiting) return;
            this.ani_light?.dispose();
            this.ani_animal?.dispose();
            this.ani_awake?.dispose();
            this.resetAll();
            super.destroy();
        }
    }
}