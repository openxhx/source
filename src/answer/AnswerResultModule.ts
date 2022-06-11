namespace answer {
    /**
     * 结算
     */
    export class AnswerResultModule extends ui.answer.game.ResultPanelUI {
        private _otherUid: number;
        constructor() { super(); }
        init(data: pb.sc_notify_map_game_finished): void {
            super.init(data);
            this.list.renderHandler = new Laya.Handler(this, this.itemRender, null, false);
            this.list.mouseHandler = new Laya.Handler(this, this.itemMouse, null, false);
            this.list.array = data.items;
            this.addPreLoad(xls.load(xls.valentineRemark));
        }

        onPreloadOver(): void {
            this.sourceTxt.changeText(this._data.score + '');
            this.imgResult.visible = false;
            this.updateView();
            this.updatePlayers();
        }

        private onSureClick() {
            let poems = this._data.poems;
            this.destroy();
            if (poems > 0) {
                clientCore.ModuleManager.open('answerReward.AnswerExtRewardModule', this._data.poems);
            }
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSureClick);
            BC.addEvent(this, this.btnFriend, Laya.Event.CLICK, this, this.onFriend);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        popupOver(): void {
            this.imgResult.visible = true;
            this.ani1.play(0, false);
        }

        private onFriend(): void {
            clientCore.FriendManager.instance.applyAddFriends([this._otherUid]).then(() => {
                this.btnFriend.disabled = true;
                alert.showFWords("加好友申请发送成功！");
            })
        }

        private itemRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let data: pb.Item = this.list.array[index];
            clientCore.GlobalConfig.setRewardUI(item, { id: data.id, cnt: data.cnt, showName: true });
        }

        private itemMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let data: pb.Item = this.list.array[index];
            clientCore.ToolTip.showTips(e.target, { id: data.id });
        }

        private updatePlayers(): void {
            for (let i: number = 0; i < 2; i++) {
                let element: pb.IUserBase = this._data.players[i];
                let head: ui.answer.render.UserRenderUI = this['head_' + (i + 1)];
                if (head) {
                    head.imgSure.visible = false;
                    head.nameTxt.changeText(element.nick);
                    head.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(element.headImage);
                    head.imgFrame.skin = clientCore.ItemsInfo.getItemIconUrl(element.headFrame);
                }
                if (element.userid != clientCore.LocalInfo.uid && !this._otherUid) {
                    this._otherUid = element.userid;
                    this.btnFriend.disabled = clientCore.FriendManager.instance.checkIsFriend(this._otherUid)
                }
            }
        }

        private updateView(): void {
            let source: number = clientCore.AnswerMgr.source;
            let array: xls.valentineRemark[] = _.filter(xls.get(xls.valentineRemark).getValues(), (element) => { return element.goal == source; });
            let len: number = array.length;
            if (len <= 0) {
                console.error(`not found source is ${source} in xls.valentineRemark.`);
                return;
            }

            let data: xls.valentineRemark;
            if (len == 1) {
                data = array[0];
            } else {
                let status: number = clientCore.CpManager.instance.haveCp() ? 1 : 0;
                data = _.find(array, (element: xls.valentineRemark) => { return element.relation == status; });
            }

            // if(data)
            this.resultTxt.changeText(data.comment);
            this.imgResult.skin = `res/activity/answerResult/${data.sealImg}.png`;
        }
    }
}