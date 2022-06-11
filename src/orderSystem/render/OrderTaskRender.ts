namespace orderSystem {
    const SkinList = ["orderSystem/13.png", "orderSystem/9.png", "orderSystem/12.png", "orderSystem/10.png"];
    export enum STATE {
        SHOW,
        HIDE
    }
    export class OrderTaskRender {
        public ui: ui.orderSystem.render.OrderTaskRenderUI;
        private _state: STATE;
        private _data: OrderData;

        constructor(ui: ui.orderSystem.render.OrderTaskRenderUI) {
            this.ui = ui;
            for (let i: number = 0; i < 3; i++) {
                this.ui['imgStar_' + i].visible = false;
            }
            //一共20帧 完成事件加在5帧上
            this.ui.create.addLabel('complete', 5);
            this.ui.remove.addLabel('complete', 5);
            this.ui.imgBg.skin = SkinList[0];
            this._state = STATE.HIDE;
            this.ui.visible = false;
        }

        public async setOrderUI(data: OrderData, needAni: boolean) {
            if (!data) {
                this.ui.visible = false;
                this._state = STATE.HIDE;
                return;
            }
            this.ui.visible = true;
            this.ui.imgOk.visible = data.checkItem() && data.data.refreshInterval <= 0;
            this._data = data;
            this.changeState(data ? STATE.SHOW : STATE.HIDE, needAni);
        }

        //设置头像 星级需要单独处理（影藏在出现的动画 需要在两动画中间setHead）
        private setHead() {
            if (this._data.data.refreshInterval > 0) {
                //等待刷新的订单
                Laya.timer.frameLoop(15, this, this.refreshTime);
                this.refreshTime();
                this.ui.boxTime.visible = true;
                this.ui.imgBg.skin = SkinList[0];
                this.ui.imgHead.visible = false;
                this.setStar(0);
            }
            else {
                Laya.timer.clear(this, this.refreshTime);
                this.ui.boxTime.visible = false;
                let quality = this._data.config.orderQuality;
                this.ui.imgBg.skin = SkinList[quality];
                this.ui.imgHead.visible = true;
                this.ui.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(this._data.config.publishNPC);
                this.setStar(quality);
            }
        }

        private refreshTime() {
            let timeArr = this._data.getRemainTime();
            this.ui.txtTime.text = timeArr[1] + ':' + timeArr[2];
            if(this._data.checkTime()){
                EventManager.event("ORDER_ITEM_TIME_REFRESH_OUT",this._data); 
                Laya.timer.clear(this, this.refreshTime);
            }
        }

        private setStar(star: number) {
            for (let i: number = 0; i < 3; i++) {
                this.ui['imgStar_' + i].visible = i < star;
                this.ui['imgStar_' + i].x = ((103 - 33 * star - 1) >> 1) + i * 33;
            }
        }

        private async changeState(state: STATE, needAni: boolean) {
            if (needAni) {
                if (this._state == STATE.SHOW && state == STATE.SHOW) {
                    //之前是显示的 先播放隐藏动画 再播放出现
                    await this.remove();
                    this.setHead();
                    await this.create();
                }
                else if (this._state == STATE.HIDE && state == STATE.SHOW) {
                    //播放出现动画
                    this.setHead();
                    await this.create();
                }
                else if (this._state == STATE.SHOW && state == STATE.HIDE) {
                    //播放隐藏动画
                    await this.remove();
                }
            }
            else {
                this.setHead();
                let size = state == STATE.SHOW ? 1 : 0;
                this.ui.scale(size, size);
            }
            this._state = state;
        }

        private async create() {
            this.ui.visible = true;
            return new Promise((ok) => {
                this.ui.create.once(Laya.Event.COMPLETE, this, ok);
                this.ui.create.play(0, false);
            })
        }

        private async remove() {
            return new Promise((ok) => {
                this.ui.remove.once(Laya.Event.COMPLETE, this, () => {
                    ok();
                    this.ui.visible = false;
                });
                this.ui.remove.play(0, false);
            })
        }
    }
}