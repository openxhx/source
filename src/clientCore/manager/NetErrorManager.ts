namespace clientCore {
    /**net错误码处理（log放这） */
    export class NetErrorManager {
        static setup() {
            xls.load(xls.ServerErrorConf);
            EventManager.on(globalEvent.ERROR_CODE, this, NetErrorManager.onError);
        }

        static onError(err: { id: number, desc: string }) {
            if(err.id == 1000024){
                console.log("重复协议错误码不显示！！");
                return;
            }
            if(err.id == 1000025 && GlobalConfig.isSamsungGy){
                GlobalConfig.isRise = true;
                err.desc = '因发布不和谐内容而受到价格惩罚';
            }

            if (xls.get(xls.ServerErrorConf).has(err.id)) {
                alert.showFWords(xls.get(xls.ServerErrorConf).get(err.id).Msg);
            }
            else {
                alert.showFWords(err.desc);
            }
            //特殊处理
            if (err.id == 1203001 && clientCore.LocalInfo.userLv >= 8) {
                //仓库已满，弹出显示礼包
                clientCore.LittleRechargManager.instacne.activeWindowById(4);
            }
            
        }
    }
}