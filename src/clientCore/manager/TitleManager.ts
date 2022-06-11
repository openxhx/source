namespace clientCore {
    /**
     * 称号管理
     */
    export class TitleManager {

        public static readonly BASE_TITLE: number = 3500001;

        private _map: util.HashMap<TitleInfo>;
        private _titleId: number = 0;
        private _titleT: time.GTime;

        private _medal: object;

        constructor() { }

        public async setup(): Promise<void> {
            this._medal = {};
            this._map = new util.HashMap<TitleInfo>();
            await xls.load(xls.title);
            await this.getTitles();
        }

        public get(titleId: number): TitleInfo {
            return this._map.get(titleId);
        }

        public addTitle(msg: pb.ITitle): void {
            this._medal[msg.titleId] = true;
            this.add(msg);
        }

        public add(msg: pb.ITitle): void {
            this.remove(msg.titleId);
            this._map.add(msg.titleId, TitleInfo.create(msg));
        }

        public remove(titleId: number): void {
            let info: TitleInfo = this._map.get(titleId);
            info?.dispose();
            this._map.remove(titleId);
        }

        public dispose(): void {
            this._titleT?.dispose();
            this._titleT = null;
        }

        /**
         * 获取显示的称号
         * @param type 1-勋章称号 2-活动称号 3-家族称号
         */
        public getShowTitles(type: number): xls.title[] {
            let array: xls.title[] = [];
            let base: xls.title[] = xls.get(xls.title).getValues();
            _.forEach(base, (element: xls.title) => {
                if (element.type == type) {
                    let info: TitleInfo = this._map.get(element.id);
                    if (info || element.hide == 1) {  //加入显示列表
                        if (type == 3) {
                            if (channel.ChannelControl.ins.isOfficial) {
                                element.id != 3500005 && array.push(element);
                            } else {
                                element.id != 3500004 && array.push(element);
                            }
                        } else {
                            array.push(element);
                        }
                    }
                }
            })
            return array;
        }

        public get titleId(): number {
            return this._titleId;
        }

        /**
         * 显示称号
         * @param value
         */
        public showTitle(value: number) {
            let player: Player = PeopleManager.getInstance().player;
            this._titleT?.dispose();
            if (!player) return;
            this._titleId = value;
            let url: string = value == 0 ? "" : pathConfig.getTitlePath(value);
            player.showTitle(url);
            player.setTitleVisb(clientCore.LocalInfo.showTitle);
            //当没有称号就不进入倒计时了
            if (value == 0) return;
            let info: TitleInfo = this._map.get(this._titleId);
            if (info && info.data.limitTime != 0) {
                this._titleT = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTitle);
                this._titleT.start();
            }
        }

        private onTitle(): void {
            let info: TitleInfo = this._map.get(this._titleId);
            if (!info || info.checkEnd()) {
                this._titleT.dispose();
                this.showTitle(0);
                alert.showFWords(`您的称号${info.data.titleName}过期了~`);
            }
        }

        private getTitles(): Promise<void> {
            return new Promise((suc) => {
                net.sendAndWait(new pb.cs_get_user_title_info()).then(async (msg: pb.sc_get_user_title_info) => {
                    let array: number[] = [];
                    _.forEach(msg.titleInfo, (element) => {
                        if (element) {
                            array.push(element.titleId - TitleManager.BASE_TITLE + MedalConst.BASE_TITLE);
                            this.add(element);
                            element.isShow && (this._titleId = element.titleId);
                        }
                    })
                    //展示当前称号
                    let info: TitleInfo = this._map.get(this._titleId);
                    info && !info.checkEnd() && this.showTitle(this._titleId);
                    //获取红点勋章
                    if (array.length > 0)
                        await MedalManager.getMedal(array).then((data) => {
                            _.forEach(data, (element) => {
                                element.value != 1 && (this._medal[element.id - MedalConst.BASE_TITLE + TitleManager.BASE_TITLE] = true);
                            })
                            suc();
                        })
                    else
                        suc()
                })
            })
        }

        public setMedal(titleId: number): void {
            MedalManager.setMedal([{ id: titleId - TitleManager.BASE_TITLE + MedalConst.BASE_TITLE, value: 1 }]);
            delete this._medal[titleId];
        }

        public checkAllRed(): boolean {
            for (let key in this._medal) {
                if (this._medal[key]) return true;
            }
            return false;
        }

        public checkRed(array: xls.title[]): boolean {
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                if (this.checkOneRed(array[i].id)) return true;
            }
            return false;
        }

        public checkOneRed(titleId: number): boolean {
            return this._medal[titleId];
        }

        public checkHaveTitle(id: number): boolean{
            return this.get(id) != null;
        }

        private static _ins: TitleManager;
        public static get ins(): TitleManager {
            return this._ins || (this._ins = new TitleManager());
        }
    }


    export class TitleInfo {
        titleId: number
        msg: pb.ITitle;
        data: xls.title;

        constructor() { }

        checkEnd(): boolean {
            return this.data.limitTime != 0 && this.msg.endTime <= clientCore.ServerManager.curServerTime;
        }

        dispose(): void {
            this.msg = this.data = null;
            Laya.Pool.recover("TitleInfo", this);
        }

        public static create(msg: pb.ITitle): TitleInfo {
            let info: TitleInfo = Laya.Pool.getItemByClass("TitleInfo", TitleInfo);
            info.titleId = msg.titleId;
            info.msg = msg;
            info.data = xls.get(xls.title).get(msg.titleId);
            return info;
        }
    }
}