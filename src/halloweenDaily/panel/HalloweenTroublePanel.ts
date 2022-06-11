namespace halloweenDaily {
    export class HalloweenTroublePanel extends ui.halloweenDaily.HalloweenTroublePanelUI {
        private container: Laya.Sprite;
        private interactionArea: Laya.Sprite;
        private di: Laya.Sprite;
        private historyPoints: number[][];
        private tempPoints: number[];
        private imgArr: Laya.Sprite[];
        private max: number;
        private tomato1: clientCore.Bone;
        private tomato2: clientCore.Bone;
        private tomato3: clientCore.Bone;
        private alert: clientCore.Bone;
        constructor() {
            super();
            clientCore.LayerManager.disableClickEffect();
            this.getReady();
        }

        onPreloadOver() {
        }

        /**下一步 */
        private next() {
            if (!this.imgOut.visible && !this.imgTrouble.visible) {
                this.imgOut.visible = true;
            } else if (this.imgOut.visible) {
                this.imgOut.visible = false;
                this.imgTrouble.visible = true;
                this.alert = clientCore.BoneMgr.ins.play("res/animate/halloween/daoluan.sk", "animation", true, this);
                this.alert.pos(870, 150);
            } else if (this.imgTrouble.visible) {
                this.alert?.dispose();
                this.alert = null;
                this.imgTrouble.visible = false;
                this.setTomato();
            }
        }

        /**擦除准备 */
        private getReady() {
            // 容器
            this.container = new Laya.Sprite();
            // 设置容器为画布缓存
            this.container.cacheAs = "bitmap";
            this.container.width = this.width;
            this.container.height = this.height;
            this.addChild(this.container);
            //绘制底图
            this.di = new Laya.Sprite();
            this.di.width = this.width;
            this.di.height = this.height;
            // maskArea.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
            this.container.addChild(this.di);
            //绘制擦除区域，利用叠加模式，从底图擦除像素
            this.interactionArea = new Laya.Sprite();
            this.interactionArea.width = this.width;
            this.interactionArea.height = this.height;
            //设置叠加模式

            // this.interactionArea.blendMode = "destination-out";
            this.container.addChild(this.interactionArea);
            this.historyPoints = [];
            this.tempPoints = [];
        }

        /**扔番茄 */
        private async setTomato() {
            BC.removeEvent(this, Laya.stage, Laya.Event.CLICK, this, this.next);
            this.imgArr = [];
            await res.load("unpack/halloweenDaily/candy.png");
            let tex = res.get("unpack/halloweenDaily/candy.png");
            //460,127
            for (let i = 0; i < 3; i++) {
                this["tomato" + i] = clientCore.BoneMgr.ins.play("res/animate/halloween/tomato.sk", "animation", false, this);
                let posX = Math.floor(Math.random() * 460);
                let posY = Math.floor(Math.random() * 127);
                this["tomato" + i].pos(posX + 462, posY + 313);
                this["tomato" + i].once(Laya.Event.COMPLETE, this, (x, y, idx) => {
                    core.SoundManager.instance.playSound(this.getMusicUrl("tomato"));
                    let img = new Laya.Image('unpack/halloweenDaily/candy.png');
                    img.pos(x, y);
                    this.imgArr.push(img);
                    this.di.addChild(img);
                    this["tomato" + idx].dispose();
                }, [posX, posY, i]);
                await util.TimeUtil.awaitTime(200);
            }
            await util.TimeUtil.awaitTime(500);
            // this.max = this.getPointCount();
            BC.addEvent(this, this, Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        }

        private getMusicUrl(str: string): string {
            return `res/sound/${str}.ogg`;
        }

        private onChecking: boolean;

        private async over() {
            clientCore.Logger.sendLog('2020年10月30日活动', '【付费】糖果万圣节', '赶走库库鲁');
            clientCore.MedalManager.setMedal([{ id: MedalDailyConst.KUKULU_VISIT_DAILY, value: 1 }]);
            this.di.graphics.clear();
            BC.removeEvent(this, this, Laya.Event.MOUSE_UP, this, this.onMouseUp);
            BC.removeEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            BC.removeEvent(this, this, Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.imgEnd.visible = true;
            await util.TimeUtil.awaitTime(500);
            BC.addOnceEvent(this, this, Laya.Event.CLICK, this, this.closeAll);
        }

        private closeAll() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
        }

        private onMouseDown(e: Laya.Event) {
            BC.addEvent(this, this, Laya.Event.MOUSE_UP, this, this.onMouseUp);
            BC.addEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.tempPoints.push(e.target.mouseX, e.target.mouseY);
            // this.interactionArea.graphics.drawCircle(e.target.mouseX, e.target.mouseY, 20, "#00ffff");
        }

        private onMouseMove(e: Laya.Event) {
            this.tempPoints.push(e.target.mouseX, e.target.mouseY);
            this.drawLine();
        }

        private drawLine() {
            if(this.imgArr.length == 0){
                this.tempPoints.length = 0;
                return;
            }
            // this.interactionArea.graphics.clear();
            let len = this.tempPoints.length;
            if (len < 150) {
                this.imgArr[0].alpha = 1 - len / 150;
            }
            else if (len < 300) {
                this.imgArr[1].alpha = 1 - (len - 150) / 150;
            }
            else if (len < 450) {
                this.imgArr[2].alpha = 1 - (len - 300) / 150;
            }
            else if (len >= 400) {
                this.over();
            }

            // for (let i: number = 0; i < this.historyPoints.length; i++) {
            //     if (this.historyPoints[i].length > 2) {
            //         this.interactionArea.graphics.drawCircle(this.historyPoints[i][0], this.historyPoints[i][1], 20, "#00ffff");
            //         this.interactionArea.graphics.drawLines(0, 0, this.historyPoints[i], "#00ffff", 40);
            //         this.interactionArea.graphics.drawCircle(this.historyPoints[i][this.historyPoints[i].length - 2], this.historyPoints[i][this.historyPoints[i].length - 1], 20, "#00ffff");
            //     }
            //     else this.interactionArea.graphics.drawCircle(this.historyPoints[i][0], this.historyPoints[i][1], 20, "#00ffff");
            // }
            // if (this.tempPoints.length > 0) this.interactionArea.graphics.drawCircle(this.tempPoints[0], this.tempPoints[1], 20, "#00ffff");
            // if (this.tempPoints.length > 2) this.interactionArea.graphics.drawLines(0, 0, this.tempPoints, "#00ffff", 40);
        }

        private onMouseUp() {
            // this.historyPoints.push(this.tempPoints.slice());
            // this.tempPoints = [];
            this.drawLine();
            // this.checkLeftover();
            BC.removeEvent(this, this, Laya.Event.MOUSE_UP, this, this.onMouseUp);
            BC.removeEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        }

        addEventListeners() {
            BC.addEvent(this, Laya.stage, Laya.Event.CLICK, this, this.next);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.tomato1?.dispose();
            this.tomato2?.dispose();
            this.tomato3?.dispose();
            this.alert?.dispose();
            this.tomato1 = this.tomato2 = this.tomato3 = this.alert = null;
            this.imgArr = null;
            super.destroy();
        }
    }
}