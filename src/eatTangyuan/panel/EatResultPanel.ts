namespace eatTangyuan {
    export class EatResultPanel extends ui.eatTangyuan.panel.EatResultPanelUI {
        constructor(d: pb.sc_agreeable_yuan_xiao_eat) {
            super();
            this.sideClose = true;
            this.setUIInfo(d.fortune, d.item.length);
        }

        private setUIInfo(point: number, item: number) {
            let type = 4;
            if (!item) {
                type = (point - 4) / 2;
            }
            this.imgTangyuan.skin = `eatTangyuan/wan_${type}.png`;
            let name = ["莹莹翠绿", "粉粉如意", "心想事成", "福气冲天"][type - 1];
            let des = `哇，是${name}元宵，\n福气积分+${point}`;
            if (type == 4) des += "  福运币+1";
            this.labDes.text = des;
        }
    }
}