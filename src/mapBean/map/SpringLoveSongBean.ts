namespace mapBean {

    /**
     * 春日恋曲地图祝福
     * 
     */
    export class SpringLoveSongBean implements core.IMapBean {
        private static _allList: pb.IshowInfo[] = [];
        private static _totalLen: number = 30;
        private static _lastRefreshTime: number = 0;

        private _destroy: boolean = false;
        private _displayedIdArr: number[];
        private _currShowId: number;
        private _mainUI: ui.springLoveSongBean.SpringLoveSongBeanUI;

        async start() {
            await this.updateList();
            await Promise.all([
                clientCore.ModuleManager.loadatlas('springLoveSongBean')
            ]);
            if (!this._destroy) {
                this.init();
            }
        }

        init() {
            this._mainUI = new ui.springLoveSongBean.SpringLoveSongBeanUI();
            this._mainUI.pos(1390, 917);
            clientCore.MapManager.curMap.upLayer.addChild(this._mainUI);
            this._displayedIdArr = [];
            this.createNextShower();
            BC.addEvent(this, this._mainUI.btnBless, Laya.Event.CLICK, this, this.onBless);
            BC.addEvent(this, this._mainUI, Laya.Event.CLICK, this, this.onPanelClick);
        }

        private onPanelClick(e: Laya.Event) {
            if (e.target != this._mainUI.btnBless) {
                clientCore.ModuleManager.open('springLoveSong.SpringLoveSongModule');
            }
        }

        /**请求刷新列表 */
        private updateList() {
            let timeOk = (clientCore.ServerManager.curServerTime - SpringLoveSongBean._lastRefreshTime) > 60;//两次请求时间大于1分钟（如果当前列表很短，一下就展示完了）
            if (timeOk) {
                let listLen = SpringLoveSongBean._allList.length;
                let reqNum = Math.min(SpringLoveSongBean._totalLen - listLen, 30);//一次最多再拉取50个
                return net.sendAndWait(new pb.cs_spring_song_show_list({ start: listLen, end: listLen + reqNum })).then((data: pb.sc_spring_song_show_list) => {
                    SpringLoveSongBean._lastRefreshTime = clientCore.ServerManager.curServerTime;
                    SpringLoveSongBean._allList = SpringLoveSongBean._allList.concat(data.showInfos);
                    SpringLoveSongBean._allList = _.uniqBy(SpringLoveSongBean._allList, o => o.uid);
                    SpringLoveSongBean._totalLen = Math.max(SpringLoveSongBean._allList.length, data.maxLength);
                });
            }
        }

        private onBless() {
            net.sendAndWait(new pb.cs_spring_song_show_congrats({ uid: this._currShowId })).then((data: pb.sc_spring_song_show_congrats) => {
                if (!this._destroy) {
                    alert.showReward(data.items);
                    this._mainUI.btnBless.visible = false;
                }
                if (_.find(SpringLoveSongBean._allList, o => o.uid == this._currShowId))
                    _.find(SpringLoveSongBean._allList, o => o.uid == this._currShowId).flag = 1;
                else
                    console.log('找不到啊' + this._currShowId);
            })
        }

        /**换下一批人 */
        private async createNextShower() {
            this._mainUI.btnBless.visible = false;
            if (SpringLoveSongBean._allList.length == 0) {
                Laya.timer.once(15000, this, this.createNextShower);
            }
            else {
                await this.playAni(false);
                await this.createRole();
                await this.playAni(true);
                let clothInfo = _.find(SpringLoveSongBean._allList, o => o.uid == this._currShowId);
                if (clothInfo)
                    this._mainUI.btnBless.visible = clothInfo.flag == 0;
                Laya.timer.clear(this, this.createNextShower);
                Laya.timer.once(10000, this, this.createNextShower);
            }
        }

        private destroyRole() {
            if (this._destroy)
                return;
            if (this._mainUI.boxRight.numChildren > 0)
                (this._mainUI.boxRight.getChildAt(0) as clientCore.Person2).destory();
            if (this._mainUI.boxLeft.numChildren > 0)
                (this._mainUI.boxLeft.getChildAt(0) as clientCore.Person2).destory();
            this._mainUI.boxRight.removeChildren();
            this._mainUI.boxLeft.removeChildren();
        }

        private async createRole() {
            this.destroyRole();
            let info = this.getNextInfo();
            this._currShowId = info.uid;
            this._displayedIdArr.push(info.uid);
            let clothInfo = _.find(SpringLoveSongBean._allList, o => o.uid == this._currShowId);
            if (!this._destroy && clothInfo) {
                let p1 = new clientCore.Person2({ curClothes: clothInfo.userClotheList, sex: clothInfo.userSexy }, 'huxi');
                let p2 = new clientCore.Person2({ curClothes: clothInfo.friendClotheList, sex: clothInfo.friendSexy }, 'huxi');
                p1.scaleY = p2.scaleY = 0.3;
                p1.scaleX = 0.3;
                p2.scaleX = -0.3;
                this._mainUI.boxRight.addChild(p1);
                this._mainUI.boxLeft.addChild(p2);
                let nick1 = new Laya.Label(clothInfo.userName);
                let nick2 = new Laya.Label(clothInfo.friendName);
                nick1.y = nick2.y = -130;
                nick1.color = nick2.color = '#FFFFFF';
                nick1.font = nick2.font = '汉仪中圆简';
                nick1.fontSize = nick2.fontSize = 20;
                nick1.stroke = 3;
                nick1.strokeColor = "#7861cb";
                nick1.x = -nick1.width / 2;
                nick2.x = -nick2.width / 2;
                nick2.stroke = 3;
                nick2.strokeColor = "#7861cb";
                this._mainUI.boxRight.addChild(nick1);
                this._mainUI.boxLeft.addChild(nick2);
                return Promise.all([this.waitPersonCreate(p1), this.waitPersonCreate(p2)]);
            }
            else {
                return Promise.resolve();
            }
        }

        private waitPersonCreate(p: clientCore.Person2) {
            return new Promise((ok) => {
                p.once(Laya.Event.CHANGED, this, ok);
            })
        }

        private playAni(postive: boolean) {
            if (this._destroy)
                return;
            this._mainUI.ani1.wrapMode = postive ? Laya.AnimationBase.WRAP_POSITIVE : Laya.AnimationBase.WRAP_REVERSE;
            return new Promise((ok) => {
                this._mainUI.ani1.once(Laya.Event.COMPLETE, this, ok);
                this._mainUI.ani1.play(0, false);
            })
        }

        private getNextInfo() {
            let nextArr = this.getOptionalArr();
            if (nextArr.length == 1) {
                return nextArr[0];
            }
            let ranInfo = nextArr[_.random(0, nextArr.length - 1)];
            while (ranInfo.uid == this._currShowId) {
                ranInfo = nextArr[_.random(0, nextArr.length - 1)];
            }
            return ranInfo;
        }

        private getOptionalArr() {
            //先选取未点赞的
            let unLikeArr = _.filter(SpringLoveSongBean._allList, o => o.flag == 0);
            if (unLikeArr.length == 0) {
                console.log('未点赞的示过一遍了,请求刷新')
                this.updateList();
                return SpringLoveSongBean._allList;
            }
            else {
                let canArr = _.filter(unLikeArr, o => this._displayedIdArr.indexOf(o.uid) == -1);//筛选没有看过的
                if (canArr.length == 0) {
                    console.log('全部显示过一遍了,请求刷新')
                    this.updateList();
                    //全部展示过一遍了,清空展示记录数组，重新开始随机,还要重新拉一下列表
                    this._displayedIdArr = [];
                    return unLikeArr;
                }
                else {
                    return canArr;
                }
            }
        }

        touch(): void {
        }

        redPointChange(): void {
        }

        destroy(): void {
            BC.removeEvent(this);
            this._destroy = true;
            this.destroyRole();
            this._mainUI?.removeSelf();
            this._mainUI?.destroy();
        }
    }
}