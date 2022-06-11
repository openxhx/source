namespace answer {
    /**
     * 游戏
     */
    export class AnswerGameModule extends ui.answer.game.GamePanelUI {


        private readonly QA_COUNT: number = 5;

        private _qaCnt: number;
        private _cls: xls.valentineAnswer;
        private _t: time.GTime;
        private _status: number;
        private _time: number;
        private _source: number;
        private _total: number = 0; //总分
        private _select: number;

        constructor() { super(); }
        init(data): void {
            super.init(data);
            this.htmlTxt.style.width = 803;
            this.htmlTxt.style.align = 'center';
            this.htmlTxt.style.fontSize = 30;
            this.textQ.renderHandler = new Laya.Handler(this, this.textRender, null, false);
            this.textQ.mouseHandler = new Laya.Handler(this, this.textMouse, null, false);
            this.cardQ.renderHandler = new Laya.Handler(this, this.cardRender, null, false);
            this.cardQ.mouseHandler = new Laya.Handler(this, this.cardMouse, null, false);

            this.addPreLoad(xls.load(xls.valentineAnswer));
        }


        addEventListeners(): void {
            BC.addEvent(this, EventManager, globalEvent.ANSWER_UPDATE_Q, this, this.updateQ);
            BC.addEvent(this, EventManager, globalEvent.ANSWER_UPDATE_A, this, this.updateA);
            BC.addEvent(this, EventManager, globalEvent.CLSOE_ANSWER_MODULE, this, this.destroy);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            super.destroy();
        }

        popupOver(): void {
            clientCore.AnswerMgr.source = 0;
            this._qaCnt = 0;
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.updateStatus);
            this.updatePlayers(this._data.players);
            this.updateQ(this._data.msg);
        }
        private updatePlayers(players: pb.IMapPlayer[]): void {
            _.forEach(players, (element: pb.IMapPlayer) => {
                let head: ui.answer.render.UserRenderUI = this['head_' + element.place];
                if (head) {
                    head.imgSure.visible = false;
                    head.nameTxt.changeText(element.player.nick);
                    head.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(element.player.headImage);
                    head.imgFrame.skin = clientCore.ItemsInfo.getItemIconUrl(element.player.headFrame);
                }
            })
        }

        private updateQ(msg: pb.sc_notify_map_game_round_begin): void {
            this._select = -1;
            this._status = 1;
            this._cls = xls.get(xls.valentineAnswer).get(msg.id);
            this._time = msg.endTime - clientCore.ServerManager.curServerTime;
            this.numTxt.changeText(`(${++this._qaCnt}/${this.QA_COUNT})`);
            this.htmlTxt.innerHTML = '';
            this.valueTxt.text = this._cls.question;
            this.textQ.visible = this._cls.type == 1;
            this.cardQ.visible = this._cls.type != 1;
            switch (this._cls.type) {
                case 1:  //文字选择题
                    this.textQ.array = _.shuffle(this._cls.options.split('/'));
                    break;
                case 2:  //图片选择题
                case 3:  //随机翻牌题
                    this.cardQ.array = _.shuffle(this._cls.options.split('/'));
                    break;
            }
            this._t.start();
        }

        private updateA(msg: pb.sc_notify_map_game_round_result): void {
            this._time = msg.endTime - clientCore.ServerManager.curServerTime;
            this._status = 2;
            this._source = msg.score - this._total;
            this._total = msg.score;
            this._t.start();

            console.log('answer owner result: ' + msg.ownResult);
            console.log('answer other result: ' + msg.otherResult);

            //选择框显示
            let list: Laya.List = this._cls.type == 1 ? this.textQ : this.cardQ;
            if (msg.otherResult == msg.ownResult) {
                if (msg.ownResult != 0) {
                    core.SoundManager.instance.playSound('res/sound/crushGlass.ogg');
                    clientCore.AnswerMgr.source += [0, 1, 10, 100][this._cls.type];
                    this.select(list, msg.ownResult - 1, 2);
                }
            } else {
                core.SoundManager.instance.playSound('res/sound/error.ogg');
                this.select(list, msg.ownResult - 1, 0);
                this.select(list, msg.otherResult - 1, 1);
            }

            //处理翻开所有牌子
            if (this._cls.type != 3) return;
            let len: number = this.cardQ.length;
            for (let i: number = 0; i < len; i++) {
                i != this._select && this.selectCard(i);
            }
        }

        private textRender(item: ui.answer.render.QaRenderUI, index: number): void {
            item.valueTxt.changeText(this.textQ.array[index]);
            item.imgSel.visible = false;
        }

        private textMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK || this._select != -1 || this._status != 1) return;
            this._select = index;
            let choice: number = this._cls.options.split('/').indexOf(this.textQ.array[index]);
            console.log('answer select：' + (choice + 1));
            net.sendAndWait(new pb.cs_choose_map_game_answer({ choice: choice + 1 })).then(() => {
                this.select(this.textQ, choice, 0);
            })
        }

        private cardRender(item: ui.answer.render.ImgRenderUI, index: number): void {
            item.imgSel.visible = false;
            item.imgCard.skin = this._cls.type == 2 ? `res/activity/answer/${this.cardQ.array[index]}.png` : 'answer/card_back.png';
        }
        private cardMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK || this._select != -1 || this._status != 1) return;
            this._select = index;
            let choice: number = this._cls.options.split('/').indexOf(this.cardQ.array[index]);
            console.log('answer select：' + (choice + 1));
            net.sendAndWait(new pb.cs_choose_map_game_answer({ choice: choice + 1 })).then(() => {
                this.select(this.cardQ, choice, 0);
                this._cls.type == 3 && this.selectCard(index);
            })
        }

        /**
         * 选择显示
         * @param list 
         * @param index 
         * @param state 0-我的选择 1-别人的 2-相同选择
         */
        private select(list: Laya.List, choice: number, state: number): void {
            let index: number = list.array.indexOf(this._cls.options.split('/')[choice]);
            let item: any = list.getCell(index);
            if (!item) return;
            let prefix: string = this._cls.type == 1 ? 'qa_' : '';
            item.imgSel.visible = true;
            item.imgSel.skin = `answer/${prefix}${['my_sel', 'other_sel', 'total_sel'][state]}.png`;
        }

        /**
         * 翻牌子
         * @param index 
         */
        private selectCard(index: number): void {
            let item: any = this.cardQ.getCell(index);
            if (!item) return;
            item.ani1.play(0, false);
            item.ani1.once(Laya.Event.COMPLETE, this, () => {
                console.log(this.cardQ.array.toString());
                console.log("index: " + index);
                item.imgCard.skin = `res/activity/answer/${this.cardQ.array[index]}.png`;
            })
        }

        private updateStatus(): void {
            if (this._status == 1) {
                if (--this._time < 0) {
                    this._t.stop();
                    return;
                }
                this.htmlTxt.innerHTML = util.StringUtils.getColorText3(`答题倒计时：{${this._time}}`, '#905242', '#ff0000');
            } else {
                if (--this._time < 0) {
                    this._t.stop();
                    return;
                }
                if (this._qaCnt >= this.QA_COUNT) {
                    this.htmlTxt.innerHTML = util.StringUtils.getColorText3(`本题默契加{${this._source}}(结算倒计时：{${this._time}}) `, '#905242', '#ff0000');
                    return;
                }
                this.htmlTxt.innerHTML = util.StringUtils.getColorText3(`本题默契加{${this._source}}(下一题准备倒计时：{${this._time}}) `, '#905242', '#ff0000');
            }
        }
    }
}