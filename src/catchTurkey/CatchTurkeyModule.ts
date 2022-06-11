namespace catchTurkey {
    /**
     * 2022.3.25
     * catchTurkey.CatchTurkeyModule
     * 二周年庆典
     */
    export class CatchTurkeyModule extends ui.catchTurkey.CatchTurkeyModuleUI {
        private _msg: pb.sc_halloween_candy_megagame_catch;
        private turkeyItem: clientCore.Bone;
        constructor() {
            super();
            this.sideClose = false;
        }

        init(d: { msg: pb.sc_halloween_candy_megagame_catch, pet: number }) {
            this._msg = d.msg;
            this.imgWin.visible = this._msg.flag == 1;
            this.imgFail.visible = this._msg.flag == 0;
            this.imgTalk.skin = this._msg.flag == 1 ? "catchTurkey/talk_win.png" : "catchTurkey/talk_fail.png";
            this.imgNum.skin = `catchTurkey/x${this._msg.integral}.png`;
            this.iconLuna.visible = this._msg.isGet == 1;
            this.turkeyItem = clientCore.BoneMgr.ins.play(pathConfig.getflowerPetRes(Math.floor(d.pet / 10), d.pet % 10), "idle", true, this.pet);
            this.turkeyItem.pos(0, 150);
        }

        /**帮助说明 */
        private showHelp() {
            alert.showRuleByID(1021);
        }

        addEventListeners() {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            // alert.showReward(this._msg.item);
            this.turkeyItem.dispose();
            this.turkeyItem = null;
            this._msg = null;
            super.destroy();
        }
    }
}