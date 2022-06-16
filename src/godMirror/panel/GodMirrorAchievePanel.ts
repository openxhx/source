namespace godMirror {
    export class GodMirrorAchievePanel extends ui.godMirror.panel.GodMirrorAchievePanelUI {
        private _person: clientCore.Person;
        show() {
            this._closed = false;
            clientCore.DialogMgr.ins.open(this);
            this.readChampion();
            //还没开启
            // for (let i = 0; i < 3; i++) {
            //     this['btn_' + i].fontSkin = 'commonBtn/btn_bulin.png'
            //     this['btn_' + i].fontX = 15;
            //     this['btn_' + i].disabled = true;
            // }
            net.sendAndWait(new pb.cs_flora_of_mirror_get_rank_reward_panel()).then((data: pb.sc_flora_of_mirror_get_rank_reward_panel) => {
                if (!this._closed) {
                    this.setBtnState(0, data.topOne);
                    this.setBtnState(1, data.topTen);
                    this.setBtnState(2, data.topFifty);
                }
            })
            let sex = clientCore.LocalInfo.sex;
            let reward = xls.get(xls.godMirrorReward).get(6);
            let reward1 = sex == 1 ? reward.reward1female : reward.reward1male;
            this.imgTitle.skin = pathConfig.getTitleUrl(reward1[0].v1);
            this.imgWing.skin = clientCore.ItemsInfo.getItemIconUrl(reward1[1].v1);
            this.txtName_0.text = clientCore.ItemsInfo.getItemName(reward1[1].v1);

            let reward5 = sex == 1 ? reward.reward2female : reward.reward2male;
            this.imgHead_1.skin = clientCore.ItemsInfo.getItemIconUrl(reward5[0].v1);
            this.leaf_1.value = reward5[1].v2.toString();
            this.txtName_1.text = clientCore.ItemsInfo.getItemName(reward5[0].v1);

            let reward10 = sex == 1 ? reward.reward3female : reward.reward3male;
            this.imgHead_2.skin = clientCore.ItemsInfo.getItemIconUrl(reward10[0].v1);
            this.leaf_2.value = reward10[1].v2.toString();
            this.txtName_2.text = clientCore.ItemsInfo.getItemName(reward10[0].v1);
        }

        private setBtnState(idx: number, state: number) {
            this['imgGet_' + idx].visible = state == 2;
            this['btn_' + idx].visible = state != 2;
            if (state == 0) {
                this['btn_' + idx].fontSkin = 'commonBtn/btn_bulin.png'
                this['btn_' + idx].fontX = 15;
                this['btn_' + idx].disabled = true;
            }
            else if (state == 1) {
                this['btn_' + idx].fontSkin = 'commonBtn/btn_get.png';
                this['btn_' + idx].fontX = 42;
                this['btn_' + idx].disabled = false;
            }
        }

        private readChampion() {
            net.sendAndWait(new pb.cs_get_flora_of_mirror_ranking_info({ start: 0, end: 0, flag: 1 })).then((data: pb.sc_get_flora_of_mirror_ranking_info) => {
                if (!this._closed && data.length > 0) {
                    this._person?.destroy();
                    let userInfo = data.info[0];
                    this._person = new clientCore.Person(userInfo.sexy, userInfo.image);
                    this._person.scale(0.5, 0.5);
                    this.spCon.addChild(this._person);
                    this.txtHot.text = userInfo.hot.toString();
                    this.txtNick.text = userInfo.nick;
                    this.txtUid.text = userInfo.userid.toString();
                }
            })
        }

        private async onBtnClick(idx: number) {
            clientCore.LoadingManager.showSmall();
            await net.sendAndWait(new pb.cs_flora_of_mirror_get_rank_reward({ type: idx + 1 })).then((data: pb.sc_flora_of_mirror_get_rank_reward) => {
                clientCore.LoadingManager.hideSmall(true);
                alert.showReward(data.items);
                this.setBtnState(idx, 2);
            })
            clientCore.LoadingManager.hideSmall(true);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['btn_' + i], Laya.Event.CLICK, this, this.onBtnClick, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this._person?.destroy();
        }
    }
}