namespace zongziEatGame {
    export class FindBattlePanel extends ui.zongziEatGame.panel.FindBattlePanelUI {
        private personSelf: clientCore.Person;
        private personOther: clientCore.Person;
        constructor() {
            super();
            this.init();
        }
        init() {
            this.personSelf = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
            this.personSelf.scale(-0.6, 0.6);
            this.imgSelf.addChild(this.personSelf);
            this.labSelf.text = clientCore.LocalInfo.userInfo.nick;
        }

        initOver() {
            net.sendAndWait(new pb.cs_pvp_match_user({ flag: 1 })).then(() => {
                Laya.timer.once(50000, this, this.requestBot);
            })
            net.listen(pb.sc_pvp_match_user_notify, this, this.getBattle);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.cancelSearch);
            this.ani1.play(0, true);
        }

        //取消匹配
        private cancelSearch() {
            if (this.imgSearched.visible) return;
            this.ani1.stop();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('zongziEat.ZongziEatModule');
        }

        /**请求机器人 */
        private requestBot() {
            net.send(new pb.cs_pvp_game_match_robot());
        }

        /**收到匹配结果 */
        private async getBattle(msg: pb.sc_pvp_match_user_notify) {
            net.unListen(pb.sc_draw_match_user_notify, this, this.getBattle);
            Laya.timer.clear(this, this.requestBot);
            if (this._closed) return;
            this.btnClose.visible = false;
            this.ani1.stop();
            this.labSearching.visible = false;
            this.imgSearched.visible = true;
            let other: { uid: number, nick: string, side: number, cloths: number[], sex: number };
            if (msg.UserInfo.length != 0) {
                other = {
                    uid: msg.UserInfo[0].uid,
                    nick: msg.UserInfo[0].nickName,
                    side: msg.UserInfo[0].location,
                    cloths: _.map(msg.UserInfo[0].clothInfo.split(","), (o) => { return parseInt(o) }),
                    sex: msg.UserInfo[0].sex
                }
            } else {
                let config = xls.get(xls.aiCloth).get(Math.ceil(Math.random() * 100));
                other = {
                    uid: 0,
                    nick: config.name,//"Robot",//config.name,//
                    side: 1,
                    cloths: config.clothes,
                    sex: config.sex
                }
            }
            this.setOtherInfo(other);
            Laya.Tween.to(this.boxSelf, { x: 166 }, 500);
            Laya.Tween.to(this.boxOther, { x: 686 }, 500);
            await util.TimeUtil.awaitTime(1000);
            ZongziEatGameModel.instance.otherInfo = other;
            EventManager.event("ZONGZI_GAME_FIND");
            clientCore.DialogMgr.ins.close(this);
        }

        /**设置对手信息 */
        private setOtherInfo(info: { uid: number, nick: string, cloths: number[], sex: number }) {
            this.labOther.text = info.nick;
            this.personOther = new clientCore.Person(info.sex);
            this.personOther.scale(0.6, 0.6);
            this.imgOther.addChild(this.personOther);
            this.personOther.upByIdArr(info.cloths);
            this.boxOther.visible = true;
        }

        destroy() {
            this.personSelf?.destroy();
            this.personOther?.destroy();
            this.personOther = this.personSelf = null;
            if (this.labSearching.visible) {
                net.unListen(pb.sc_draw_match_user_notify, this, this.getBattle);
                Laya.timer.clear(this, this.requestBot);
                net.send(new pb.cs_pvp_match_user({ flag: 0 }));
            }
            BC.removeEvent(this);
            super.destroy();
        }
    }
}