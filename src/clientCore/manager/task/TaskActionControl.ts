
namespace clientCore {
    export class TaskActionControl {
        private static _callBackFun: Function;
        private static _caller: any;
        private static _actionInfo: string[];

        private static _curPlayIndex: number;
        public static playAction(info: string, caller: any, callBack: Function) {
            this._callBackFun = callBack;
            this._caller = caller;
            this._actionInfo = info.split(";");
            if (info.length == 0) {
                this._callBackFun.apply(caller);
                return;
            }
            this.startPlayAction();
        }
        private static startPlayAction() {
            this._curPlayIndex = 0;
            this.showAction();
        }
        private static oneActionPlayOver() {
            this._curPlayIndex++;
            if (this._curPlayIndex >= this._actionInfo.length) {
                this._callBackFun.apply(this._caller);
            }
            else {
                this.showAction();
            }
        }
        private static showAction() {
            let infoArr = this._actionInfo[this._curPlayIndex].split("/");
            if (parseInt(infoArr[0]) == 1) {
                //alert.showSmall(`配表动画${infoArr[1]}`, { btnType: alert.Btn_Type.ONLY_SURE, callBack: { caller: this, funArr: [this.oneActionPlayOver,this.oneActionPlayOver] } });
                AnimateMovieManager.showAnimateMovie(infoArr[1], this, this.oneActionPlayOver);
            }
        }
    }
}