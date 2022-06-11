namespace linkageWithFilm {
    /**
     * 小花仙大电影联动
     * 2021.8.13
     * linkageWithFilm.LinkageWithFilmModule
     */
    export class LinkageWithFilmModule extends ui.linkageWithFilm.LinkageWithFilmModuleUI {
        private _magicalCodePanel: MagicalCodePanel;

        popupOver() {
            this.btnZhanfang.mouseEnabled = !clientCore.ItemsInfo.checkHaveItem(4500005);
        }

        private showMagicalCodePanel(e: Laya.Event) {
            if (!this._magicalCodePanel) {
                this._magicalCodePanel = new MagicalCodePanel();
            }
            clientCore.DialogMgr.ins.open(this._magicalCodePanel);
        }

        private zhanfang() {
            if (!clientCore.ItemsInfo.checkHaveItem(4500004)) {
                alert.showFWords('还未获得小不灭忍');
                return;
            }
            if (!clientCore.ItemsInfo.checkHaveItem(9900213)) {
                alert.showFWords('还需要心之水晶');
                return;
            }
            this.btnZhanfang.mouseEnabled = false;
            net.sendAndWait(new pb.cs_get_hua_film_reward()).then((msg: pb.sc_get_hua_film_reward) => {
                alert.showReward(msg.item);
            })
        }

        private showRewardTip(id: number) {
            let sp = id == 4500004 ? this.pet1 : (id == 9900213 ? this.itemIcon : this.pet2);
            clientCore.ToolTip.showTips(sp, { id: id });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnZhanfang, Laya.Event.CLICK, this, this.zhanfang);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.showMagicalCodePanel);
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.pet1, Laya.Event.CLICK, this, this.showRewardTip, [4500004]);
            BC.addEvent(this, this.pet2, Laya.Event.CLICK, this, this.showRewardTip, [4500005]);
            BC.addEvent(this, this.itemIcon, Laya.Event.CLICK, this, this.showRewardTip, [9900213]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this._magicalCodePanel?.destroy();
            this._magicalCodePanel = null;
        }
    }
}