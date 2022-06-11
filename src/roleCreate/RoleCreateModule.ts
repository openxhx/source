namespace roleCreate {
    export class RoleCreateModule extends ui.roleCreate.roleCreateUI {
        private _personWoman: clientCore.Person;
        private _personMan: clientCore.Person;
        private _mcEnterNamePanel: EnterNamePanel;
        private _sex: number;
        private _womenSelectArr: number[];
        private _manSelectArr: number[];
        private _womanFaceArr: Array<number[]>;
        private _manFaceArr: Array<number[]>;

        private ROLE_CREATE_COMPLETE: string = "role_create_complete";
        constructor() {
            super();
        }
        public init(d: any) {
            this._data = d;
            this.addPreLoad(xls.load(xls.newPlayer));
            this.addPreLoad(xls.load(xls.npcBase));
            this._personWoman = new clientCore.Person(1);
            this._personMan = new clientCore.Person(2);
            this._womenSelectArr = [0, 0, 0];
            this._manSelectArr = [0, 0, 0];
            this._sex = 1;
            let s = 0.7;
            this._personMan.scale(s, s);
            this._personWoman.scale(s, s);
            this._personMan.x = -30;
            this._personWoman.pos(-10, 30);
            this.mcBodyCon.addChild(this._personWoman);
            this.mcBodyCon.addChild(this._personMan);
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.mouseHanlder)
        }

        initOver() {
            this._womanFaceArr = [];
            this._manFaceArr = [];
            let xlsInfo = xls.get(xls.newPlayer);
            let attrs = ['eyebrow', 'eye', 'mouth'];
            for (const attr of attrs) {
                let arrwoman = [];
                let arrman = [];
                for (let i = 0; i < 3; i++) {
                    arrwoman.push(xlsInfo.get(1)[attr][i]);
                    arrman.push(xlsInfo.get(2)[attr][i]);
                }
                this._womanFaceArr.push(arrwoman);
                this._manFaceArr.push(arrman);
            }
            this._personWoman.upByIdArr(clientCore.SuitsInfo.getSuitInfo(xlsInfo.get(1).cloth, 1).clothes);
            this._personMan.upByIdArr(clientCore.SuitsInfo.getSuitInfo(xlsInfo.get(2).cloth, 2).clothes);
            this.changeFace();
            this.mcRoleCon.visible = false;
            this.startRoleCreateProgress();
        }

        private async startRoleCreateProgress() {
            /** 播放配表动画  11001*/
            await this.playMovie("11001");
            /** 插播开场动画  暂无*/

            /** 播放配表动画  11002*/
            await this.playMovie("11002");
            /** 输入玩家名字*/
            await this.enterUserName();
            /** 播放配表动画  11003*/
            await this.playMovie("11003");
            /** 战斗展示*/
            core.SoundManager.instance.playBgm(pathConfig.getAnimateMusicPath('2'))
            if (!clientCore.GlobalConfig.isIosTest)
                await this.playFightMovie1();
            // this.destroy();
            // return
            /** 播放配表动画  11004*/
            await this.playMovie("11004");
            /** 播放配表动画  11005*/
            await this.playMovie("11005");
            core.SoundManager.instance.playBgm(pathConfig.getBgmUrl('home'));
            /** 创建角色*/
            await this.createRole();
            /** 播放配表动画  11006*/
            await this.playMovie("11006");

            EventManager.event(globalEvent.ROLE_CREATE_SUCC);
            this.destroy();
        }
        private _startPlay: boolean;
        private _currBone: clientCore.Bone;
        private _currLoad: number;
        private async playFightMovie1() {
            clientCore.LoadingManager.showSmall();
            let progress: Laya.Handler = Laya.Handler.create(this, this.progressHandler, null, false);
            let loadArr = [];
            for (let i = 1; i <= 4; i++) {
                loadArr.push(res.load(`res/animate/gameStart/gamestart_0${i}.png`, null, false, progress));
                loadArr.push(res.load(`res/animate/gameStart/gamestart_0${i}2.png`, null, false, progress));
                loadArr.push(res.load(`res/animate/gameStart/gamestart_0${i}.sk`, null, false, progress));
            }

            let len: number = loadArr.length;
            for (let i: number = 0; i < len; i++) {
                this._currLoad = i + 1;
                await loadArr[i];
            }
            // await Promise.all(loadArr);
            clientCore.LoadingManager.hideSmall(true);
            this._startPlay = true;
            return new Promise(async (succ) => {
                EventManager.on("force_end_fight_movie", this, this.closeMovie, [succ]);
                for (let i = 1; i <= 4; i++) {
                    if (!this._startPlay)
                        return;
                    this._currBone = clientCore.BoneMgr.ins.play(`res/animate/gameStart/gamestart_0${i}.sk`, 0, false, this);
                    this._currBone.pos(this.width / 2, this.height / 2);
                    this._currBone.on(Laya.Event.LABEL, this, (e) => {
                        core.SoundManager.instance.playSound(`res/sound/talk/${e.name}.ogg`);
                    })
                    await this.playOneAni(this._currBone);
                    this._currBone.dispose(true);
                    this._currBone.offAll();
                }
                succ();
            });
        }

        private progressHandler(value: number): void {
            clientCore.LoadingManager.showProgress(`${Math.floor(value * 100)}%(${this._currLoad}/12)`);
        }

        private playOneAni(bone: clientCore.Bone) {
            return new Promise((ok) => {
                bone.once(Laya.Event.COMPLETE, this, ok);
            })
        }

        private closeMovie(ok: Function) {
            this._currBone.dispose(true);
            this._startPlay = false;
            EventManager.off("force_end_fight_movie", this, this.closeMovie);
            ok();
        }

        private playMovie(id: string) {
            return new Promise((succ) => {
                clientCore.AnimateMovieManager.showAnimateMovie(id, this, succ);
            })
        }

        private enterUserName() {
            core.SoundManager.instance.pauseBgm();
            return new Promise((succ) => {
                this._mcEnterNamePanel = new EnterNamePanel();
                this.addChild(this._mcEnterNamePanel);
                BC.addEvent(this, this._mcEnterNamePanel, "close_module", this, () => {
                    this._mcEnterNamePanel.removeSelf();
                    succ();
                });
            })
        }

        private createRole() {
            return new Promise((succ) => {
                this.showSex(this._sex);
                this.mcRoleCon.visible = true;
                BC.addEvent(this, EventManager, this.ROLE_CREATE_COMPLETE, this, () => {
                    this.visible = false;
                    succ();
                });
            });
        }
        private showSex(sex: number) {
            this._sex = sex;
            for (let i = 1; i <= 2; i++) {
                this["mcSex_" + i].index = i == this._sex ? 1 : 0;
            }
            this._personWoman.visible = this._sex == 1;
            this._personMan.visible = this._sex == 2;
            this.list.dataSource = [1, 2, 3];
            this.changeFace();
        }
        private listRender(cell: Laya.Box, idx: number) {
            let selectArr = this._sex == 1 ? this._womenSelectArr : this._manSelectArr;
            let faceArr = this._sex == 1 ? this._womanFaceArr : this._manFaceArr;
            let selectIdx = selectArr[idx];
            let facePartArr = faceArr[idx];
            (cell.getChildByName('imgIcon') as Laya.Image).skin = clientCore.ItemsInfo.getItemIconUrl(facePartArr[selectIdx]);
        }
        private mouseHanlder(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let selectArr = this._sex == 1 ? this._womenSelectArr : this._manSelectArr;
                let faceArr = this._sex == 1 ? this._womanFaceArr : this._manFaceArr;
                let selectIdx = selectArr[idx];
                if (e.target.name == 'btnNext')
                    selectIdx += 1
                if (e.target.name == 'btnPrev')
                    selectIdx += (faceArr.length - 1);
                selectArr[idx] = selectIdx % faceArr.length;
                this.list.refresh();
                this.changeFace();
            }
        }
        private changeFace() {
            let selectArr = this._sex == 1 ? this._womenSelectArr : this._manSelectArr;
            let faceArr = this._sex == 1 ? this._womanFaceArr : this._manFaceArr;
            let person = this._sex == 1 ? this._personWoman : this._personMan;
            let changeArr = faceArr.map((v, idx) => {
                return v[selectArr[idx]];
            })
            person.upByIdArr(changeArr);
        }
        public addEventListeners() {
            super.addEventListeners();
            BC.addEvent(this, this.btnCreate, Laya.Event.CLICK, this, this.roleCreateClick);
            for (let i = 1; i <= 2; i++) {
                BC.addEvent(this, this["mcSex_" + i], Laya.Event.CLICK, this, this.onSexSelect, [i]);
            }
        }
        private onSexSelect(sex: number) {
            this.showSex(sex);
        }
        private roleCreateClick() {
            let selectArr = this._sex == 1 ? this._womenSelectArr : this._manSelectArr;
            let faceArr = this._sex == 1 ? this._womanFaceArr : this._manFaceArr;
            let sendData = new pb.cs_create_role_set_attrs();
            sendData.sex = this._sex;
            sendData.eyebrow = faceArr[0][selectArr[0]];
            sendData.eye = faceArr[1][selectArr[1]];
            sendData.mouth = faceArr[2][selectArr[2]];
            sendData.channel = channel.ChannelConfig.channelId;
            sendData.subChannel = channel.ChannelConfig.subChannelId;
            sendData.account = channel.ChannelConfig.channelUserID.toString();
            sendData.phoneOS = Laya.Browser.onAndroid ? 2 : (Laya.Browser.onIOS ? 3 : 1);
            net.sendAndWait(sendData)
                .then((msg: pb.sc_create_role_set_attrs) => {
                    clientCore.LocalInfo.createRoleTime = msg.regtime;
                    clientCore.LocalInfo.sex = this._sex;
                    channel.ChannelControl.ins.reportRoleData(2); //创角上报
                    EventManager.event(this.ROLE_CREATE_COMPLETE);
                }).catch(() => {

                });
        }
        public removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }
        public destroy() {
            if (this._mcEnterNamePanel) {
                this._mcEnterNamePanel.destroy();
            }
            super.destroy();
            EventManager.off("force_end_fight_movie", this, this.closeMovie);
            this.removeSelf();
        }
    }
}