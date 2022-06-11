namespace clientCore {

    export class RainbowManager {

        private static cls: any

        constructor() { }

        static setup(): void {
            // 彩虹通知
            net.listen(pb.sc_rainbow_enable_notify, this, function (msg: pb.sc_rainbow_enable_notify): void {
                clientCore.LocalInfo.rainbowInfo.updateInfo(msg,msg.activityId);
                EventManager.event(globalEvent.CHECK_RAINBOW,msg.activityId != 0);
            });

            // 奖励通知
            net.listen(pb.sc_rainbow_item_info_notify, this, function (msg: pb.sc_rainbow_item_info_notify): void {
                _.forEach(msg.item, (element: pb.IItem) => {
                    // alert.showFWords(`彩虹时间内额外获得：${clientCore.ItemsInfo.getItemName(element.id)} x${element.cnt}`);
                    alert.showSpecialItem(element.id, element.cnt, new Laya.Point(Laya.stage.width / 2, Laya.stage.height / 2), 3);
                })
            })
        }
    }
}