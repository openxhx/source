namespace clientCore{
    export class ColourBattleGameMgr{
        private static _model: ColourBattleGameMgr;
        private constructor() { };
        public static get instance(): ColourBattleGameMgr {
            if (!this._model) {
                this._model = new ColourBattleGameMgr();
                this._model.listenOtherLeave();
            }
            return this._model;
        }

        public otherLeave:boolean;

        public listenOtherLeave(){
            net.listen(pb.sc_draw_user_offline_notify, this, this.onOtherLeave);
        }

        private onOtherLeave(){
            this.otherLeave = true;
            EventManager.event("COLOUR_BATTLE_OTHER_LEAVE");
        }
    }
}