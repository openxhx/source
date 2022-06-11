namespace doubleNinth {
    class ItemInfo {
        id: number;
        iconUrl: string;
        name: string;
        num: number;
    }
    export class RewardInfo {
        godTreeType: number;
        reward: ItemInfo;
        decomp?: ItemInfo;
    }
    export function parseReward(info: pb.IGodTree): RewardInfo {
        let rtn = new RewardInfo();
        let xlsInfo = xls.get(xls.godTree).get(info.id);
        if (!xlsInfo) {
            // alert.showSmall(`id:${info.id}在godTree表中找不到`);
            alert.showSmall(`道具:${clientCore.ItemsInfo.getItemName(info.flag)}到达背包上限`);
            return null;
        }
        rtn.godTreeType = xlsInfo.type;
        rtn.reward = new ItemInfo();
        rtn.reward = pairToItemInfo(info.id, clientCore.LocalInfo.sex == 1 ? xlsInfo.item : xlsInfo.itemMale);
        //分解逻辑处理
        if (info.flag == 1) {
            rtn.decomp = pairToItemInfo(info.id, xlsInfo.repeatReward);
        }
        return rtn;
    }

    function pairToItemInfo(godTreeid: number, pair: xls.pair) {
        let obj = new ItemInfo();
        obj.id = pair.v1;
        obj.name = clientCore.ItemsInfo.getItemName(obj.id);
        obj.iconUrl = clientCore.ItemsInfo.getItemIconUrl(obj.id);
        obj.num = pair.v2;
        return obj;
    }
}