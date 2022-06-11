
namespace clientCore {
    interface AnimateTalk {
        talkContent: string;
        mode: 'aside' | 'normal' | 'shock';
        pos: 'right' | 'left';
        sound: string
    }

    interface AnimateFloat {
        talkContent: string;
        pos: 'left_0' | 'left_1' | 'left_2' | 'right_0' | 'right_1' | 'right_2' | 'middle_0' | 'middle_1' | 'middle_2';
        npcID: string;
        sound: string
    }

    interface AnimateHideFloat {
        pos: string | Array<'left_0' | 'left_1' | 'left_2' | 'right_0' | 'right_1' | 'right_2' | 'middle_0' | 'middle_1' | 'middle_2' | 'base' | 'all'>
    }

    export class AnimateMovieTalkControl extends Laya.EventDispatcher {
        private _mcTalkDialog: ui.animateMovie.panel.TalkDialogUI;
        private _comCallBackFun: Function;
        private _callBackThisArg: any;
        private _curShowTalkIndex: number;
        private _talkList: string[] = [];
        private _talkPlayingFlag: boolean;
        private _willShowTalkStr: string = '';
        private _curShowTalkStr: string = '';
        private _currTalkLabel: Laya.Label;
        private _talkSoundChannel: Laya.SoundChannel;
        private _autoPlayFlag: boolean;

        constructor(mc: ui.animateMovie.panel.TalkDialogUI) {
            super();
            this._mcTalkDialog = mc;
            this._mcTalkDialog.boxBaseTalk.visible = false;
            for (let i = 0; i < 3; i++) {
                let mcLeft = this._mcTalkDialog['left_' + i] as ui.animateMovie.comp.FloatTalkUI;
                let mcRight = this._mcTalkDialog['right_' + i] as ui.animateMovie.comp.FloatTalkUI;
                let middle = this._mcTalkDialog['middle_' + i] as ui.animateMovie.comp.FloatTalkUI;
                mcLeft.visible = mcRight.visible = middle.visible = false;
                middle.txtRightName.visible = middle.imgRightName.visible = false;
                mcLeft.txtRightName.visible = mcLeft.imgRightName.visible = false;
                mcRight.txtLeftName.visible = mcRight.imgLeftName.visible = false;
            }
            BC.addEvent(this, mc, Laya.Event.CLICK, this, this.playerTouch);
        }
        public set autoPlay(b: boolean) {
            if (b && !this._autoPlayFlag) {
                Laya.timer.loop(100, this, this.reflashTalkWord);
            }
            this._autoPlayFlag = b;
        }
        public get autoPlay(): boolean {
            return this._autoPlayFlag;
        }
        public showTalk(info: AnimateTalk, callBackFun: Function, thisArg: any) {
            this._comCallBackFun = callBackFun;
            this._callBackThisArg = thisArg;
            this._mcTalkDialog.boxBaseTalk.visible = true;
            info.talkContent = info.talkContent.replace(/&name&/g, clientCore.LocalInfo.userInfo.nick);
            this._talkList = (info.talkContent).split("//");
            this._talkSoundChannel?.stop();
            if (info.sound) {
                this._talkSoundChannel = core.SoundManager.instance.playSound(pathConfig.getAnimateTalkSound(info.sound));
            }
            this._curShowTalkIndex = 0;
            this._mcTalkDialog.txtLeftName.visible = this._mcTalkDialog.imgLeftName.visible = info.pos == "left";
            this._mcTalkDialog.txtRightName.visible = this._mcTalkDialog.imgRightName.visible = info.pos == "right";
            this._mcTalkDialog.imgTalkFrame.skin = pathConfig.getAnimateTalkFrame(info.mode ? info.mode : 'normal');
            if (info.mode == "aside") {
                this._mcTalkDialog.txtTalk.color = "#ffffff";
                this._mcTalkDialog.txtLeftName.visible = this._mcTalkDialog.imgLeftName.visible = false;
                this._mcTalkDialog.txtRightName.visible = this._mcTalkDialog.imgRightName.visible = false;
                this._mcTalkDialog.btnGoNext.skin = "animateMovie/btn_continue2.png";
            }
            else {
                this._mcTalkDialog.txtTalk.color = "#805329";
                this._mcTalkDialog.btnGoNext.skin = "animateMovie/btn_continue.png";
            }
            this._currTalkLabel = this._mcTalkDialog.txtTalk;

            this.talkPlay();
            this._talkPlayingFlag = true;
        }
        private hideAllSkipBtn() {
            for (let i = 0; i < 9; i++) {
                (this._mcTalkDialog.boxFloat.getChildAt(i) as Laya.Sprite)["btnGoNext"].visible = false;
            }
        }
        public showFloat(info: AnimateFloat, callBackFun: Function, thisArg: any) {
            this.hideAllSkipBtn();
            this._comCallBackFun = callBackFun;
            this._callBackThisArg = thisArg;
            info.talkContent = info.talkContent.replace(/&name&/g, clientCore.LocalInfo.userInfo.nick);
            this._talkList = (info.talkContent).split("//");
            this._talkSoundChannel?.stop();
            if (info.sound) {
                this._talkSoundChannel = core.SoundManager.instance.playSound(pathConfig.getAnimateTalkSound(info.sound));
            }
            this._curShowTalkIndex = 0;
            this._mcTalkDialog[info.pos].visible = true;
            this._mcTalkDialog[info.pos]["btnGoNext"].visible = true;
            this._currTalkLabel = this._mcTalkDialog[info.pos].txtTalk;
            this.talkPlay();
            this._talkPlayingFlag = true;
            let dir = info.pos.split('_')[0];
            let npcId = info.npcID.split('_')[0].toString().replace(/i/g, clientCore.LocalInfo.userInfo.nick);
            this._mcTalkDialog[info.pos][dir == 'right' ? 'txtRightName' : 'txtLeftName'].text = xls.get(xls.npcBase).get(npcId).npcName;
        }
        private talkPlay(): void {
            this._currTalkLabel.text = "";
            this._willShowTalkStr = this._talkList[this._curShowTalkIndex];
            this._curShowTalkStr = "";
            Laya.timer.loop(100, this, this.reflashTalkWord);
        }
        public pause() {
            Laya.timer.clear(this, this.reflashTalkWord);
        }
        public resume() {
            if (this._curShowTalkStr.length < this._willShowTalkStr.length) {
                Laya.timer.loop(100, this, this.reflashTalkWord);
            }
            else {
                this.reflashTalkWord();
            }
        }
        private reflashTalkWord(): void {
            //console.log("显示下一个文字！");
            if (this._curShowTalkStr.length < this._willShowTalkStr.length) {
                this._curShowTalkStr += this._willShowTalkStr.substr(this._curShowTalkStr.length, 1);
                this._currTalkLabel.text = this._curShowTalkStr;
            }
            else//如果是自动的，那么就播放下一条
            {
                if (this._autoPlayFlag) {
                    this.playNextTalk();
                }
                else {
                    Laya.timer.clear(this, this.reflashTalkWord);
                }
            }
        }
        public async playNextTalk() {
            if (this._curShowTalkIndex < this._talkList.length - 1) {
                this._curShowTalkIndex++;
                this.talkPlay();
            }
            else {
                if (this._talkPlayingFlag) {
                    this._talkPlayingFlag = false;
                    await this.waitSondOver();
                    this._comCallBackFun.apply(this._callBackThisArg);
                }
            }
        }
        public playerTouch() {
            if (!this._talkPlayingFlag) {
                return;
            }
            else//玩家点击，这时候要补全 并且中断自动播放
            {
                this.event("stop_auto_run");
                if (this._curShowTalkStr.length < this._willShowTalkStr.length) {
                    console.log("玩家点击，显示全句");
                    this._curShowTalkStr = this._willShowTalkStr;
                    this._currTalkLabel.text = this._curShowTalkStr;
                    Laya.timer.clear(this, this.reflashTalkWord);
                }
                else {
                    console.log("玩家点击，说下一句");
                    this._talkSoundChannel?.stop();
                    this.playNextTalk();
                }
            }
        }
        private waitSondOver() {
            if (this._talkSoundChannel) {
                if (this._talkSoundChannel.isStopped)
                    return Promise.resolve();
                else
                    return new Promise((ok) => {
                        this._talkSoundChannel.completeHandler = new Laya.Handler(this, ok);
                    })
            }
            else {
                return Promise.resolve();
            }
        }
        public showNpcName(id: string, dir: 'left' | 'right'): void {
            let npcId = parseInt(id.split('_')[0]);
            let name = xls.get(xls.npcBase).get(npcId).npcName;
            if (name == "") {
                name = LocalInfo.userInfo.nick;
            }
            this._mcTalkDialog[dir == 'left' ? "txtLeftName" : 'txtRightName'].text = `${name}`;
            for (let i = 0; i < 3; i++) {
                this._mcTalkDialog[dir + '_' + i][dir == 'left' ? "txtLeftName" : 'txtRightName'].text = `${name}`;
            }
        }

        public hideFloat(info: AnimateHideFloat) {
            if (info.pos instanceof Array) {
                for (const pos of info.pos) {
                    this.hideFloatByPos(pos);
                }
            }
            else {
                this.hideFloatByPos(info.pos);
            }
        }

        private hideFloatByPos(pos: string) {
            if (pos == 'base') {
                this._mcTalkDialog.boxBaseTalk.visible = false;
            }
            else if (pos == 'all') {
                this._mcTalkDialog.boxBaseTalk.visible = false;
                for (let i = 0; i < 9; i++) {
                    (this._mcTalkDialog.boxFloat.getChildAt(i) as Laya.Sprite).visible = false;
                }
            }
            else {
                this._mcTalkDialog[pos].visible = false;
            }
        }

        public clearTalk(): void {
            this._currTalkLabel.text = "";
        }
        public destroy() {
            this._talkSoundChannel?.stop();
            Laya.timer.clear(this, this.reflashTalkWord);
        }
    }
}