

namespace boss {
    /**
     * 奖励面板
     */
    export class RewardPanel extends ui.boss.panel.RewardPanelUI {
        constructor() {
            super();
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = Laya.Handler.create(this, this.itemRender, null, false);
        }

        show(): void {
            clientCore.DialogMgr.ins.open(this);
            this.list.array = _.slice(xls.get(xls.bossReward).getValues(), 2);
        }

        hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private itemRender(item: ui.boss.render.RewardItemUI, index: number): void {
            let data: xls.bossReward = this.list.array[index];
            let top: boolean = index < 3;
            item.box.visible = top;
            item.txRank.visible = !top;
            top ? item.imgRank.skin = `boss/top${index + 1}.png` : item.txRank.changeText(`第${data.rank.v1}-${data.rank.v2}名`);
            let rewards: xls.pair[] = clientCore.LocalInfo.sex == 1 ? data.femaleReward : data.maleReward;
            item.list.dataSource = _.map(rewards, (element) => {
                return {
                    'ico': { skin: clientCore.ItemsInfo.getItemIconUrl(element.v1) },
                    'imgBg': { skin: clientCore.ItemsInfo.getItemIconBg(element.v1) },
                    'num': { value: util.StringUtils.parseNumFontValue(element.v2) }
                }
            })
        }
    }
}