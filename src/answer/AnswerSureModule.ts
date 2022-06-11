namespace answer {
    /**
     * 答题确认
     */
    export class AnswerSureModule extends ui.answer.game.StartPanelUI {
        private _t: time.GTime;
        private _time: number;
        private _sure: boolean;
        private _place: number; //我的位置
        constructor() { super(); }
        init(data: pb.MapPlayer[]): void {
            _.forEach(data, (element: pb.MapPlayer) => {
                this.updateView(element.place, element);
            })
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onClick, [1]);
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.onClick, [2]);
            BC.addEvent(this, EventManager, globalEvent.ANSWER_PREPARE_OPP_SURE, this, this.sureGame);
            BC.addEvent(this, EventManager, globalEvent.CLSOE_ANSWER_MODULE, this, this.destroy);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        popupOver(): void {
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
            this._t.start();
            this._time = clientCore.AnswerMgr.sureTime - clientCore.ServerManager.curServerTime;
            this._time < 0 && this.onClick(2);
            this._sure = false;
        }

        destroy(): void {
            this._t?.dispose();
            this._t = null;
            super.destroy();
        }

        private onClick(type: number): void {
            if (this._sure) return;
            net.sendAndWait(new pb.cs_prepare_for_map_games({ type: type })).then((msg: pb.sc_prepare_for_map_games) => {
                if (type == 1) {
                    this.sureGame(this._place);
                    this._sure = true;
                    return;
                }
                this.destroy();
                EventManager.event(globalEvent.ANSWER_PREPARE_OUT, [msg.rooms]);
            })
        }

        private onTime(): void {
            if (--this._time < 0) {
                if (this._sure) {
                    alert.showFWords('对方未及时准备，请继续稍后！');
                    this.destroy()
                } else {
                    this.onClick(2); //没有确认则直接默认取消啦
                }
                return;
            }
            this.timeTxt.changeText('' + this._time);
        }

        private updateView(index: number, data: pb.MapPlayer): void {
            let view: ui.answer.render.UserRenderUI = this['head_' + index];
            if (!view) return;
            view.imgSure.visible = data.status == 1;
            view.nameTxt.changeText(data.player.nick);
            view.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(data.player.headImage);
            view.imgFrame.skin = clientCore.ItemsInfo.getItemIconUrl(data.player.headFrame);
            data.player.userid == clientCore.LocalInfo.uid && (this._place = data.place);
        }

        private sureGame(index: number): void {
            this['head_' + index].imgSure.visible = true;
            this.checkAllSure();
        }

        private checkAllSure(): void {
            this.head_1.imgSure.visible && this.head_2.imgSure.visible && this.destroy();
        }
    }
}