namespace clientCore{
    export class BattleGameMgr{
        private static _model: BattleGameMgr;
        private constructor() { };
        public static get instance(): BattleGameMgr {
            if (!this._model) {
                this._model = new BattleGameMgr();
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
            EventManager.event("BATTLE_GAME_OTHER_LEAVE");
        }
    }
}