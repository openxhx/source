namespace mapBean {
    /**
     * 中秋三仙女答题
     * mapBean.FairyAnswerBean
     */
    export class FairyAnswerBean implements core.IMapBean {
        private _destroy: boolean = false;
        private _mainUI: ui.fairyAnswerBean.FairyAnswerBeanUI;
        private _rightCnt: number;
        async start() {
            await Promise.all([
                clientCore.ModuleManager.loadatlas('fairyAnswerBean')
            ]);
            await net.sendAndWait(new pb.cs_three_fairy_gifts_info()).then((msg: pb.sc_three_fairy_gifts_info) => {
                this._rightCnt = msg.answerTime;
            })
            if (!this._destroy) {
                this.init();
            }
        }

        init() {
            this.CheckAnswerRole();
        }

        private CheckAnswerRole() {
            if (this._rightCnt >= 10) return;
            let fairy: number = 0;
            let curTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            let openTime = util.TimeUtil.formatTimeStrToSec('2021-9-19 00:00:00');
            if (curTime < openTime) return;
            for (let i: number = 0; i < 3; i++) {
                if(i == 1 && curTime == openTime + 5 * 86400){
                    fairy = 2;
                    break;
                }
                if (i != 1 && curTime == openTime + i * 86400) {
                    fairy = i + 1;
                    break;
                }
            }
            let curmap = clientCore.MapInfo.mapID;
            let map = fairy == 1 ? 11 : fairy == 2 ? 13 : 18;
            if (fairy > 0 && curmap == map) {
                this._mainUI = new ui.fairyAnswerBean.FairyAnswerBeanUI();
                this._mainUI.imgFairy.skin = `fairyAnswerBean/${fairy}.png`;
                let posArr = fairy == 3 ? [{ x: 573, y: 1352 }, { x: 1030, y: 1010 }, { x: 2520, y: 1038 }] : fairy == 2 ? [{ x: 549, y: 439 }, { x: 848, y: 931 }, { x: 2518, y: 758 }] : [{ x: 709, y: 590 }, { x: 1436, y: 563 }, { x: 2032, y: 978 }];
                let pos = posArr[Math.floor(Math.random() * 3)];
                this._mainUI.pos(pos.x, pos.y);
                clientCore.MapManager.curMap.upLayer.addChild(this._mainUI);
                BC.addEvent(this, this._mainUI, Laya.Event.CLICK, this, this.goEvent, [fairy]);
                EventManager.on('FAIRY_ANSWER_OVER',this,this.onOver);
            }
        }

        private onOver(){
            this._mainUI.visible = false;
        }

        private goEvent(fairy: number) {
            let name = fairy == 1 ? '露莎' : fairy == 2 ? '露娜' : '露露';
            clientCore.Logger.sendLog('2021年9月17日活动', '【主活动】中秋三仙女', `在场景中点击${name}仙女`);
            clientCore.ModuleManager.open('fairyAnswer.FairyAnswerModule', fairy);
        }

        touch(): void {
        }

        redPointChange(): void {
        }

        destroy(): void {
            EventManager.off('FAIRY_ANSWER_OVER',this,this.onOver);
            BC.removeEvent(this);
            this._destroy = true;
            this._mainUI?.removeSelf();
            this._mainUI?.destroy();
        }
    }
}