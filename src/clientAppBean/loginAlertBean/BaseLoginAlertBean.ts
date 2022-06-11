namespace clientAppBean {

    /**简单的强弹 */
    export class BaseLoginAlertBean {
        private _param: SimpleLoginAlertParam;

        /**传入参数 */
        setParam(param: SimpleLoginAlertParam) {
            this._param = param
        }

        /**开始逻辑 */
        async start() {
            let needOpen = await this.checkNeedOpen();
            if (needOpen)
                this.openMod();
            else
                this.openNext();
        }

        /**判断渠道是否ok */
        protected checkChannelOk() {
            let channelOk = (this._param.offcial && channel.ChannelControl.ins.isOfficial || this._param.unoffcial && !channel.ChannelControl.ins.isOfficial)
            return channelOk;
        }

        /**打开下一个，必须调用 */
        protected openNext() {
            EventManager.event(globalEvent.OPEN_NEXT_ADS);
        }

        private async checkNeedOpen() {
            if (this.checkChannelOk()) {
                if(this._param.system && !clientCore.SystemOpenManager.ins.getIsOpen(this._param.system)){
                    return false;
                }
                if (this._param.checkMedal == 0) {
                    return true;
                }
                else {
                    let result = await clientCore.MedalManager.getMedal([this._param.checkMedal])
                    return result[0].value == 0;
                }
            }
            else {
                return false;
            }
        }

        private async openMod() {
            let mod = await clientCore.ModuleManager.open(this._param.modStr, this._param.modParam);
            if (mod)
                mod.once(Laya.Event.CLOSE, this, this.openNext);
        }
    }
}