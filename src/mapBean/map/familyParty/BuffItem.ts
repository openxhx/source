namespace familyParty {
    /**
     * 
     */
    export class BuffItem {
        private _mainUI: ui.familyPartyBean.item.buffItemUI;
        private _buffID: number;
        private _disTime: number;// buff间隔多久获得奖励
        private _startTime: number;// 获得奖励开始计时时间
        constructor(ui: ui.familyPartyBean.item.buffItemUI) {
            this._mainUI = ui;
        }
        public get buffID():number{
            return this._buffID;
        }
        public get mainUI(){
            return this._mainUI;
        }
        show(info: pb.IPartyBuff) {
            this._mainUI.visible = true;
            if(this._buffID != info.buffId){
                this._buffID = info.buffId;
                this._mainUI.imgBuff.skin = `familyPartyBean/buff_${info.buffId}.png`;
                this._disTime = xls.get(xls.familyBuff).get(info.buffId).buffInterval;
                if(info.startTime <= 0){
                    info.startTime = clientCore.ServerManager.curServerTime;
                }
                this._startTime = info.startTime;
            }
            if(info.layer > 1){
                this._mainUI.imgNum.visible = true;
                this._mainUI.imgNum.skin = `familyPartyBean/${info.layer}.png`
            }
            else{
                this._mainUI.imgNum.visible = false;
            }
            this._mainUI.txtRestTime.text = util.StringUtils.getDateStr(info.endTime - clientCore.ServerManager.curServerTime);
        }
        checkGetBuffReward():number{
            if(this._buffID > 0){
                if(clientCore.ServerManager.curServerTime >= this._startTime+this._disTime){
                    this._startTime = clientCore.ServerManager.curServerTime;
                    return this._buffID;
                }
            }
            return 0;
        }
        hide() {
            this._mainUI.visible = false;
            this._buffID = 0;
            this._startTime = 0;
            this._disTime = 0;
        }
    }
}