namespace roleCreate {
    export class FightTalkPanel extends ui.roleCreate.fightTalkPanelUI{
        private _showIndex:number;
        private _taskInfoArr = [
            [
                {side:"left",name:"塔巴斯",talk:"别再装模作样了，难道你要用这幅恶心的样子来和我战斗吗？"},
                {side:"right",name:"西蒙",talk:"恶心？这难道不是你最期盼的样子吗？哈哈哈哈哈哈……"}
            ],
            [
                {side:"left",name:"塔巴斯",talk:"让我来帮你撕掉这身伪装吧！"}
            ],
            [
                {side:"right",name:"西蒙",talk:"就算做了勇气国的国王脾气也还是一点也没变啊。你是想要再杀我一次吗，我的弟弟？不过……"}
            ],
            [
                {side:"right",name:"西蒙",talk:"这个人类我要定了！"},
                {side:"left",name:"塔巴斯",talk:"那就试试看。"}
            ],
            [
                {side:"right",name:"西蒙",talk:"你就这点能耐吗？"}
            ],
            [
                {side:"left",name:"塔巴斯",talk:"啧，我可没那么容易对付！"}
            ]
        ];

        private _curShowTalkArr:{side:string,name:string,talk:string}[];
        private _curTalkIndex:number;
        private _willShowTalkStr:string;
        private _curDialog:ui.roleCreate.fightTalkUI;
        private _curShowTalkStr:string;

        private _mask:Laya.Sprite;

        private _talkPlayFlag:boolean = false;
        constructor(){
            super();
            this._showIndex = 0;
            this.addEventListeners();
            this._mask = new Laya.Sprite();
            this._mask.graphics.drawRect(0,0,Laya.stage.width,Laya.stage.height,"#000000");
            this._mask.alpha = 0;
            this._mask.width = Laya.stage.width;
            this._mask.height = Laya.stage.height;
            this.addChildAt(this._mask,0);
            this._mask.x -= clientCore.LayerManager.OFFSET;
        }
        showTalk(){
            this._curShowTalkArr = this._taskInfoArr[this._showIndex];
            this._curTalkIndex = 0;
            this.startTalkPlay();

            this._showIndex++;
            this._talkPlayFlag = true;
        }
        startTalkPlay(){
            let talkInfo = this._curShowTalkArr[this._curTalkIndex];
            if(talkInfo.side == "left"){
                this._curDialog = this.mcTalkLeft;
                this._curDialog.txtRightName.visible = false;
                this._curDialog.imgRightName.visible = false;
                this._curDialog.txtLeftName.text = talkInfo.name;
            }
            else
            {
                this._curDialog = this.mcTalkRight;
                this._curDialog.txtLeftName.visible = false;
                this._curDialog.imgLeftName.visible = false;
                this._curDialog.txtRightName.text = talkInfo.name;
            }
            this._curDialog.visible = true;
            this._curDialog.txtTalk.text = "";
            this._curShowTalkStr = "";
            this._willShowTalkStr = talkInfo.talk;
            Laya.timer.loop(100, this, this.reflashTalkWord);
        }
        private reflashTalkWord(): void {
            //console.log("显示下一个文字！");
            if (this._curShowTalkStr.length < this._willShowTalkStr.length) {
                this._curShowTalkStr += this._willShowTalkStr.substr(this._curShowTalkStr.length, 1);
                this._curDialog.txtTalk.text = this._curShowTalkStr;
            }
            else//如果是自动的，那么就播放下一条
            {
                Laya.timer.clear(this, this.reflashTalkWord);
            }
        }
        hideTalk(){
            this.mcTalkLeft.visible = false;
            this.mcTalkRight.visible = false;
        }
        addEventListeners(){
            BC.addEvent(this,this,Laya.Event.CLICK,this,this.showNext);
        }
        showNext(e:Laya.Event){
            if(!this._talkPlayFlag){
                return;
            }
            if (this._curShowTalkStr.length < this._willShowTalkStr.length) {
                this._curShowTalkStr = this._willShowTalkStr;
                this._curDialog.txtTalk.text = this._curShowTalkStr;
                Laya.timer.clear(this, this.reflashTalkWord);
                return;
            }
            this._curTalkIndex++;
            if(this._curTalkIndex < this._curShowTalkArr.length){
                this.startTalkPlay();
            }
            else
            {
                this._talkPlayFlag = false;
                this.event("talk_play_over");
            }
        }
        public destroy(){
            BC.removeEvent(this);
            this.removeSelf();
        }
    }
}