namespace sunAndLove2 {
    export class SunDetailPanel extends ui.sunAndLove2.panel.SunDetailPanelUI {
        constructor() {
            super();
            this.sideClose = true;
            for (let i = 0; i < 3; i++) {
                let txt = this['txt_' + i] as Laya.HTMLDivElement;
                txt.style.font = '汉仪中圆简';
                txt.style.wordWrap = true;
                txt.style.width = 668;
                txt.style.fontSize = 25;
                txt.style.leading = 5;
            }
            this.txt_0.innerHTML = util.StringUtils.getColorText3(
                '消耗{198神叶}可对太阳神碑进行{一次解读}，解读後有机会获得\n太阳神碑中的{奖品}。',
                '#66472c',
                '#f25c58',
            );
            this.txt_1.innerHTML = util.StringUtils.getColorText3(
                '当解读到石碑{0点、3点、6点、9点方向}，就可以获得苏尔之\n{恋套装部件}。',
                '#66472c',
                '#f25c58',
            );
            this.txt_2.innerHTML = util.StringUtils.getColorText3(
                '{观看}太阳的传说{剧情}，可以{获得神叶奖励}，剧情将根据指定\n日期开启。',
                '#66472c',
                '#f25c58',
            );
        }

        show() {
            clientCore.DialogMgr.ins.open(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}