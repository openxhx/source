namespace clientCore {
    export class AnimateParam {
        /**已选过的选项列表（二维数组）一维中第i个数组对应本次配表动画中第i个选项选过哪几个 二维中数字为选过的idx（0开始） */
        selectArr: number[][] = [];
        /**是否能跳过，0使用配表指定 1能跳过 2不能跳过 （1和2均会覆盖配表中跳过配置）*/
        forceSkipOpt: number = 0;
        //背景透明度
        bgAlpha: number = 1
    }
    export class AnimateMovieManager {
        private static _caller: any;
        private static _callBackFun: Function;
        public static animateTalkJson: any;

        private static _curLoadNum: number;
        private static _param: AnimateParam;
        private static _oriBgmUrl: string;

        private static _medalId: number;

        /**设置配表动画参数 */
        public static setParam(obj: AnimateParam) {
            this._param = obj;
        }

        /**
         * 根据勋章播放一生一次配表动画，播完了会置勋章
         * @param id 配表动画id
         * @param medal 勋章值
         */
        public static async showOnceAnimate(id: string | number, medal: number) {
            let medalV = await MedalManager.getMedal([medal]);
            if (medalV[0].value == 0) {
                this._medalId = medal;
                this.showAnimateMovie(id, this, this.onOnceAniOver);
            }
        }

        private static onOnceAniOver() {
            let o = new pb.CommonData({ id: this._medalId, value: 1 })
            MedalManager.setMedal([o]);
        }

        private static _loadOkFlg: boolean;
        public static async showAnimateMovie(id: string | number, caller: any, callBackFun: Function, loadingType: number = 0) {
            id = id.toString();
            this._caller = caller;
            this._callBackFun = callBackFun;
            loadingType == 0 ? LoadingManager.showSmall() : LoadingManager.showDark();
            this._loadOkFlg = false;
            await Promise.race([this.loadRes(id), util.TimeUtil.awaitTime(10000)]);
            if (this._loadOkFlg) {
                loadingType == 0 ? LoadingManager.hideSmall(true) : LoadingManager.hideDark(true);
                this.openAnimateMovie();
                EventManager.on(globalEvent.ANIMATE_MOVIE_PLAY_OVER, this, this.animateMoviePlayOver);
            }
            else {
                if (loadingType == 0) {
                    LoadingManager.hideSmall().then(() => {
                        alert.showFWords('剧情加载失败');
                    });
                } else {
                    LoadingManager.hideDark();
                    alert.showFWords('剧情加载失败');
                }
            }
        }
        private static async loadRes(id: string) {
            await res.load(pathConfig.getAnimateJsonPath(id), Laya.Loader.JSON);
            console.log(`animate ${id} json loaded!!!`);
            this.animateTalkJson = res.get(pathConfig.getAnimateJsonPath(id));
            if (this.animateTalkJson) {
                console.log(this.animateTalkJson);
                await this.startLoadUI();
                await res.load("atlas/animateMovie.atlas");
                this._loadOkFlg = true;
            }
            return Promise.resolve();
        }
        private static openAnimateMovie() {
            var animateMovie = new AnimateMovieMain();
            animateMovie.param = this._param || new AnimateParam();
            this._oriBgmUrl = core.SoundManager.instance.currBgm;
            let defaultBgm = this.animateTalkJson.defaultBgMusic;
            if (defaultBgm) {
                core.SoundManager.instance.pauseBgm();
                core.SoundManager.instance.playBgm(pathConfig.getAnimateMusicPath(defaultBgm));
            }
            animateMovie.startPlay();
        }
        public static async startLoadUI() {
            console.log("开始加载配表动画用到的素材！！！");
            //这里需要一个loading界面
            var npcArr: string[] = this.getAllUsedNpc();
            var bgIDArr: string[] = this.getAllUsedBg();
            var musicArr: string[] = this.animateTalkJson["music"];
            this._curLoadNum = 0;
            let npcLoadArr = _.map(npcArr, (npcId) => {
                if (npcId.indexOf("i") > -1)
                    npcId = npcId.replace(/i/g, clientCore.RoleManager.instance.getSelfInfo().id.toString());
                return this.loadNpc(npcId);
            })
            let bgLoadArr = _.map(bgIDArr, id => this.loadBg(id))
            let musicLoadArr = _.map(musicArr, id => this.loadMusic(id));
            await Promise.all(npcLoadArr.concat(bgLoadArr).concat(musicLoadArr))
            return Promise.resolve();
        }
        private static getAllUsedNpc() {
            let arr: string[] = [];
            let jsonData = this.animateTalkJson?.talkInfoList;
            if (jsonData) {
                for (const o of jsonData) {
                    if (o.hasOwnProperty('npcID')) {
                        arr.push(o['npcID']);
                    }
                }
            }
            return _.uniq(arr);
        }
        private static getAllUsedBg() {
            let arr: string[] = [];
            if (this.animateTalkJson)
                arr.push(this.animateTalkJson.defaultBg);
            let jsonData = this.animateTalkJson?.talkInfoList;
            if (jsonData) {
                for (const o of jsonData) {
                    if (o.hasOwnProperty('bgID')) {
                        arr.push(o['bgID']);
                    }
                }
            }
            return _.uniq(arr);
        }
        private static animateMoviePlayOver(arr: number[], e: Laya.Event) {
            this._param = null;
            if (this._oriBgmUrl)
                core.SoundManager.instance.playBgm(this._oriBgmUrl);
            if (this._callBackFun) {
                this._callBackFun.apply(this._caller, [arr]);
            }
        }
        private static async loadNpc(id: string) {
            return new Promise((resolve: () => void, reject: () => void) => {
                res.load(pathConfig.getNpcPath(id), Laya.Loader.IMAGE).then(() => {
                    this._curLoadNum++;
                    resolve();
                });
            });
        }
        private static async loadBg(id: string) {
            return new Promise((resolve: () => void, reject: () => void) => {
                res.load(pathConfig.getAnimateBgPath(id), Laya.Loader.IMAGE).then(() => {
                    this._curLoadNum++;
                    console.log("资源加载数量：" + this._curLoadNum);
                    resolve();
                });
            });
        }
        private static async loadMusic(id: string) {
            return new Promise((resolve: () => void, reject: () => void) => {
                res.load(pathConfig.getAnimateMusicPath(id)).then(() => {
                    this._curLoadNum++;
                    console.log("资源加载数量：" + this._curLoadNum);
                    resolve();
                });
            });
        }
    }
}