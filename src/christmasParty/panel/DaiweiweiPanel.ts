namespace christmasParty {
    export class DaiweiweiPanel extends ui.christmasParty.panel.DaiweiweiPanelUI {
        private _score: number = 0;
        private _subjectNum: number = 0;
        private _subjectMax: number = 5;
        private _gameOver: boolean = false;
        private _answerName: string = "";
        private _idArr = [101, 201, 301, 401, 501, 801, 901, 1101, 1201, 1301, 1401];
        private _nameArr = ["爱德文", "露莎仙女", "露露仙女", "露娜仙女", "琳恩", "黛薇薇", "安德鲁", "芬妮", "库库鲁", "赛缪尔", "安格斯"];

        private _model: ChristmasPartyModel;
        private _control: ChristmasPartyControl;

        public updateHanlder: Laya.Handler;

        constructor(sign: number) {
            super();
            this.sign = sign;
        }

        init() {
            this._model = clientCore.CManager.getModel(this.sign) as ChristmasPartyModel;
            this._control = clientCore.CManager.getControl(this.sign) as ChristmasPartyControl;

            this._score = 0;
            this._subjectNum = 0;
            this.itemAward.num.value = '5';
            this.labAccuracy.text = "100%";

            clientCore.GlobalConfig.setRewardUI(this.itemAward, { id: this._model.tokenId, cnt: 5, showName: false });
            this.startGame();
            clientCore.UIManager.releaseCoinBox();
        }

        private startGame(): void {
            this._gameOver = false;
            this.updateSubject();
        }

        private updateSubject(): void {
            this.mouseEnabled = true;
            if (this._gameOver) {
                return;
            }
            this._subjectNum++;
            let answer = _.random(0, this._idArr.length - 1);
            this._answerName = this._nameArr[answer];
            let arr = [this._answerName];
            for (let i = 0; i < 3; i++) {
                let arr2 = _.difference(this._nameArr, arr);
                arr.push(arr2[_.random(0, arr2.length - 1)])
            }

            let imgId = this._idArr[answer] + _.random(0, 4);
            this.imgRole.skin = "res/activity/christmas/" + imgId + ".png";
            for (let i = 0; i < 4; i++) {
                let txt = arr.splice(_.random(0, arr.length - 1), 1)[0];
                this["lab" + i].text = txt;
                this["btn" + i].skin = "christmasParty/ji_chu_kuang.png";
            }

            this.labNum.text = this._subjectNum + '/' + this._subjectMax;

            this.imgSelect.visible = false;
        }

        private endGame(): void {
            this.mouseEnabled = true;
            this._gameOver = true;
            this._control.whoAm(this._score, Laya.Handler.create(this, (msg: pb.sc_christmas_party_who_am) => {
                this.updateHanlder.run();
                alert.showReward(clientCore.GoodsInfo.createArray(msg.items));
                this.onClose();
            }))
        }

        private onExit() {
            alert.showSmall('当前离开后将重新开始，是否确定离开？', { callBack: { caller: this, funArr: [this.onClose] } });
        }

        private onClose() {
            this.event("ON_CLOSE");
            clientCore.DialogMgr.ins.close(this);
        }

        private onSelect(index: number) {
            this.mouseEnabled = false;
            let btn = this["btn" + index];
            this.imgSelect.x = btn.x;
            this.imgSelect.y = btn.y;
            this.imgSelect.visible = true;

            if (this["lab" + index].text == this._answerName) {
                this._score++;
                btn.skin = "christmasParty/zheng_que_da_an.png";
                this.itemAward.num.value = 5 + (this._score * 5) + '';
            } else {
                btn.skin = "christmasParty/cuo_wu_da_an.png";
            }

            this.labAccuracy.text = (this._subjectMax - (this._subjectNum - this._score)) / this._subjectMax * 100 + "%";

            if (this._subjectNum >= this._subjectMax) {
                this.timerOnce(1000, this, this.endGame);
            } else {
                this.timerOnce(1000, this, this.updateSubject);
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onExit);
            for (let i = 0; i < 4; i++) {
                BC.addEvent(this, this["btn" + i], Laya.Event.CLICK, this, this.onSelect, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = this._control = null;
            super.destroy();
        }
    }
}