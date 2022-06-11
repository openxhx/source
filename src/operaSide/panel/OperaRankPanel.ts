
namespace operaSide {
    export class OperaRankPanel extends ui.operaSide.panel.OperaRankPanelUI {
        private _realPanel: OperaRealPanel;
        private _canReal: boolean;
        constructor() {
            super();
            this.drawCallOptimize = true;
            this.listRank.vScrollBarSkin = '';
            this.listRank.renderHandler = new Laya.Handler(this, this.listRender);
            this.listRank.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.onTopRankClick(0);
            for (let i = 0; i <= 1; i++) {
                this['imgRwd_' + i].skin = `res/otherLoad/operaDrama/rank/${i}_${clientCore.LocalInfo.sex}.png`;
            }
        }

        async show() {
            clientCore.UIManager.setMoneyIds([]);
            clientCore.DialogMgr.ins.open(this);
            clientCore.LoadingManager.showSmall();
            let rankId = 11;
            let rankList = [];
            let myRankInfo: pb.IRankInfo;
            await clientCore.RankManager.ins.getSrvRank(rankId,0,99).then((rankInfo) => {
                rankList = rankInfo;
            });
            await clientCore.RankManager.ins.getUserRank(rankId, clientCore.LocalInfo.uid).then((v) => {
                myRankInfo = v.msg;
            })
            this._canReal = myRankInfo.ranking <= 2 && myRankInfo.ranking != 0;
            clientCore.LoadingManager.hideSmall(true);
            if (!this._closed) {
                this.listRank.dataSource = rankList;
                this.txtRank.text = myRankInfo.ranking == 0 ? '未上榜' : myRankInfo.ranking.toString();
                this.txtNick.text = myRankInfo.userBase?.nick;
                let fName = myRankInfo.userBase?.familyName ? myRankInfo.userBase?.familyName : '尚未加入家族'
                this.txtFamily.text = fName.slice(0, 8);
                this.txtScore.text = clientCore.ItemsInfo.getItemNum(9900072).toString();
            }
        }

        private listRender(cell: ui.operaSide.render.OperaRankRenderUI, idx: number): void {
            let data = cell.dataSource as clientCore.RankInfo;
            let rank = data.msg as pb.IRankInfo;
            if (rank) {
                cell.txtRank.text = rank.ranking.toString();
                cell.txtNick.text = rank.userBase?.nick;
                let fName = rank.userBase?.familyName ? rank.userBase?.familyName : '尚未加入家族';
                cell.txtFamily.text = fName.slice(0, 8);
                cell.txtScore.text = rank.score.toString();
                cell.imgSelect.skin = idx == this.listRank.selectedIndex ? 'operaSide/rank/rankSelect.png' : 'operaSide/rank/norankSelect.png';
                cell.imgNo.visible = rank.ranking <= 3;
                cell.txtRank.visible = rank.ranking > 3;
                if (rank.ranking <= 3)
                    cell.imgNo.skin = `operaSide/rank/no${rank.ranking}.png`;
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this.listRank.getItem(idx) as clientCore.RankInfo;
                let rank = data.msg as pb.IRankInfo;
                if (e.target.name == 'btn') {
                    alert.showGiveFlowerPanel({ uid: rank.userBase.userid, nick: rank.userBase.nick });
                }
                else {
                    clientCore.UserInfoTip.showTips(e.currentTarget, rank.userBase);
                }
            }
        }

        private onTopRankClick(idx: number) {
            for (let i = 0; i < 3; i++) {
                this['imgTab_' + i].skin = idx == i ? 'operaSide/rank/di_6_2_fu_ben.png' : 'operaSide/rank/wei_xuan_zhong_zhuang_tai.png';
            }
            this.imgRwd_2.skin = `res/otherLoad/operaDrama/rank/${idx + 2}_${clientCore.LocalInfo.sex}.png`;
            let arr = ['十字远征套装翅膀', '十字远征套装（不含翅膀', '骑士之征背景秀+舞台']
            this.txtRwd.text = arr[idx]
        }

        private onScorllChange() {
            let scroll = this.listRank.scrollBar;
            this.imgBar.y = (this.imgProgress.height - this.imgBar.height) * scroll.value / scroll.max + this.imgProgress.y;
        }

        private onClose() {
            clientCore.UIManager.setMoneyIds([9900072, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID])
            clientCore.DialogMgr.ins.close(this);
        }

        private onReal() {
            this._realPanel = this._realPanel || new OperaRealPanel();
            this._realPanel.show(this._canReal);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.listRank.scrollBar, Laya.Event.CHANGE, this, this.onScorllChange);
            BC.addEvent(this, this.btnReal, Laya.Event.CLICK, this, this.onReal);
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['imgTab_' + i], Laya.Event.CLICK, this, this.onTopRankClick, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._realPanel?.destroy();
            this._realPanel = null;
            super.destroy();
        }
    }
}