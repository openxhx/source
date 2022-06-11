namespace zongziEatGame {
    export class GameResult extends ui.zongziEatGame.panel.ZongziEatGameResultUI {

        initOver() {
            this.labWinName.text = clientCore.LocalInfo.userInfo.nick;

            this.labSelfName.text = clientCore.LocalInfo.userInfo.nick;
            this.labSelfCoin.text = "" + ZongziEatGameModel.instance.selfCoin;

            this.labOtherName.text = ZongziEatGameModel.instance.otherInfo.nick;
            this.labOtherCoin.text = "" + ZongziEatGameModel.instance.otherCoin;

            let result = 0;
            this.imgWin.x = 883;
            if (ZongziEatGameModel.instance.selfCoin > ZongziEatGameModel.instance.otherCoin) {
                result = 1;
                this.imgWin.x = 382;
            } else if (ZongziEatGameModel.instance.selfCoin == ZongziEatGameModel.instance.otherCoin) {
                result = 2;
                this.imgWin.visible = false;
            }
            net.listen(pb.sc_pvp_game_over_notify, this, this.showPoint);
            net.send(new pb.cs_pvp_game_over({ uidList: [clientCore.LocalInfo.uid, ZongziEatGameModel.instance.otherInfo.uid], status: result, point: ZongziEatGameModel.instance.selfCoin }));
        }

        private showPoint(msg: pb.sc_pvp_game_over_notify) {
            net.unListen(pb.sc_pvp_game_over_notify, this, this.showPoint);
            this.labPoint.text = "大赛积分+" + msg.point;
        }

        onCloseClick() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('zongziEat.ZongziEatModule');
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}