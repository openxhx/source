namespace mapBean {
    const POS = [[2100, 900], [1700, 1000]]
    export class GiveFlowerBean implements core.IMapBean {
        private _stageArr: Laya.Image[];
        private _personArr: clientCore.OtherUnit[];
        private _rankInfos: clientCore.RankInfo[];
        private _destoryed: boolean;
        async start() {
            if (!this.checkInTime())
                return Promise.resolve();
            await Promise.all([
                res.load('res/giveFLower/stage/1.png'),
                res.load('res/giveFLower/stage/2.png')
            ]);
            this._rankInfos = [];
            this._stageArr = [];
            this._personArr = [];
            await clientCore.RankManager.ins.getSrvRank(6).then((rankInfo) => {
                this._rankInfos[0] = rankInfo[0];
            });
            await clientCore.RankManager.ins.getSrvRank(7).then((rankInfo) => {
                this._rankInfos[1] = rankInfo[0];
            });
            if (!this._destoryed)
                this.init();
        }

        private checkInTime() {
            let st = util.TimeUtil.formatTimeStrToSec('2020-6-26 00:00:00');
            return clientCore.ServerManager.curServerTime < st;
        }

        private init() {
            // window['arr'] = this._stageArr;
            // window['arr2'] = this._personArr;
            for (let i = 0; i < 2; i++) {
                let img = new Laya.Image(`res/giveFlower/stage/${i + 1}.png`);
                img.anchorX = img.anchorY = 0.5;
                img.pos(POS[i][0], POS[i][1]);
                clientCore.MapManager.mapItemsLayer.addChild(img);
                this._stageArr.push(img);
                if (this._rankInfos[i]) {
                    let p = new clientCore.OtherUnit();
                    p.init((this._rankInfos[i].msg as pb.IRankInfo).userBase)
                    p.scale = 1.7;
                    p.reversal(i == 1)
                    p.x = img.x;
                    p.y = img.y - 85;
                    p.lbNameColor = '#CCFF33';
                    p.showTitle(`res/title/${i == 1 ? 3500011 : 3500010}.png`)
                    this._personArr.push(p);
                }
            }
            this._personArr[0]?.addToLayer();
        }

        redPointChange() {
        }

        touch() {
        }

        destroy() {
            this._destoryed = true;
            if (this._personArr)
                for (const iterator of this._personArr) {
                    iterator?.dispose();
                }
            if (this._stageArr)
                for (const iterator of this._stageArr) {
                    iterator.destroy();
                }
        }
    }
}