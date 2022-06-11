namespace catchBattle {
    export class GameOverPanel extends ui.catchBattle.panel.GameResultPanelUI {
        private personSelf: clientCore.Person;
        private personOther: clientCore.Person;
        constructor(msg: pb.sc_cake_game_over_notify, pointSelf: number, pointOther: number, otherInfo: pb.IuserInfo) {
            super();
            this.imgBadge.visible = msg.isGet == 1;
            this.labPointWin.text = msg.integral.toString();
            if (pointSelf >= pointOther) {
                this.labWinPoint.text = pointSelf.toString();
                this.labFailPoint.text = pointOther.toString();
                this.labWinName.text = clientCore.LocalInfo.userInfo.nick;
                this.lanFailName.text = otherInfo.nickName;
                this.personSelf = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
                this.personSelf.scale(-0.4, 0.4);
                this.roleWin.addChild(this.personSelf);
                let otherCloths = _.map(otherInfo.clothInfo.split(","), (o) => { return parseInt(o) });
                this.personOther = new clientCore.Person(otherInfo.sex, otherCloths);
                this.personOther.scale(0.4, 0.4);
                this.roleFail.addChild(this.personOther);
                this.boxGet.x = 170;
            } else {
                this.labFailPoint.text = pointSelf.toString();
                this.labWinPoint.text = pointOther.toString();
                this.lanFailName.text = clientCore.LocalInfo.userInfo.nick;
                this.labWinName.text = otherInfo.nickName;
                this.personSelf = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
                this.personSelf.scale(0.4, 0.4);
                this.roleFail.addChild(this.personSelf);
                let otherCloths = _.map(otherInfo.clothInfo.split(","), (o) => { return parseInt(o) });
                this.personOther = new clientCore.Person(otherInfo.sex, otherCloths);
                this.personOther.scale(-0.4, 0.4);
                this.roleWin.addChild(this.personOther);
                this.boxGet.x = 780;
            }
            this.imgPingju.visible = pointSelf == pointOther;
            this.imgshengli.visible = this.imgshibai.visible = !this.imgPingju.visible;
        }

        private closePanel() {
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
        }

        addEventListeners() {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.closePanel);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this.personSelf?.destroy();
            this.personOther?.destroy();
            this.personOther = this.personSelf = null;
        }
    }
}