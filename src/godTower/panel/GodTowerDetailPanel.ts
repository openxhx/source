namespace godTower {
    export class GodTowerDetailPanel extends ui.godTower.panel.GodTowerDetailPanelUI {
        constructor() {
            super();
            this.sideClose = true;
            for (let i = 0; i < 5; i++) {
                let txt = this['txt_' + i] as Laya.HTMLDivElement;
                txt.style.font = '汉仪中圆简';
                txt.style.wordWrap = true;
                txt.style.width = 668;
                txt.style.fontSize = 25;
                txt.style.leading = 5;
            }
            this.txt_0.innerHTML = util.StringUtils.getColorText2([
                '活动时间：5月14日开服～5月21日23：59',
                '#66472c'
            ]);
            this.txt_1.innerHTML = util.StringUtils.getColorText2([
                '消耗每层彩窗铃铛上',
                '#66472c',
                '对应的神叶',
                '#f25c58',
                '，就可以开启本层内的一个 彩窗，开启彩窗后，小花仙们可以获得该',
                '#66472c',
                '彩窗内的奖励',
                '#f25c58'
            ]);
            this.txt_2.innerHTML = util.StringUtils.getColorText2([
                '只有获得某一层内所有的服装部件，才可以开启',
                '#66472c',
                '更高层的彩窗层',
                '#f25c58'
            ]);
            this.txt_3.innerHTML = util.StringUtils.getColorText2([
                '小花仙们开启彩窗可能获得“',
                '#66472c',
                '祈祷券',
                '#f25c58',
                '”，根据“祈祷券”的 面值，小花仙们在下一次开启彩窗的时候，可以',
                '#66472c',
                '降低相应额度的神叶消耗',
                '#f25c58'
            ]);
            this.txt_4.innerHTML = util.StringUtils.getColorText2([
                '收集齐6个【圣装祈祷】服装部件，小花仙们可以',
                '#66472c',
                '领取【圣装 祈祷眉毛】、【圣装祈祷眼睛】、【圣装祈祷嘴巴】奖励',
                '#f25c58',
                '；收集齐【圣装祈祷】套装，小花仙门可以领取',
                '#66472c',
                '【暗黑神庭背景秀】',
                '#f25c58',
                '、以及',
                '#66472c',
                '【圣使弥音舞台】',
                '#f25c58',
                '奖励。',
                '#66472c'
            ]);
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