namespace christmasInteract {
    export class ChrismasHelpPanel extends ui.christmasInteract.ChristmasHelpPanelUI {
        private reward: pb.IItem[];
        private person: clientCore.Person;
        init(data: number) {
            this._data = data;
            this.sideClose = false;
            this.btnAddFriend.visible = !clientCore.FriendManager.instance.checkIsFriend(data);
            this.addPreLoad(net.sendAndWait(new pb.cs_christmas_greetings_clean({ uid: data })).then((msg: pb.sc_christmas_greetings_clean) => {
                this.reward = msg.item;
                this.labName.text = msg.nick;
            }))
        }

        onPreloadOver() {
            let info = clientCore.PeopleManager.getInstance().getOther(this._data).data;
            this.person = new clientCore.Person(info.sex, info.curClothes);
            this.person.scale(0.6, 0.6);
            this.imgRole.addChild(this.person);
        }

        private getReward() {
            if(this.reward.length > 0) {
                alert.showReward(this.reward);
                clientCore.ChrismasInteractManager.curCount += this.reward[0].cnt;
                if(clientCore.ChrismasInteractManager.curCount >= 200){
                    alert.showSmall("今日获得祝福已达上限，点击场景礼盒将只会变为雪人！");
                }
            }
            else alert.showFWords("今日获得祝福已达上限");
            this.destroy();
        }

        private addFriend() {
            clientCore.CommonSCommand.ins.addFriend(this._data);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, this.btnAddFriend, Laya.Event.CLICK, this, this.addFriend);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.reward = null;
            super.destroy();
        }
    }
}