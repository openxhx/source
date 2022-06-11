namespace springLoveSong {
    export class SpringLoveSongControl implements clientCore.BaseControl {
        sign: number;
        waiting: boolean;
        /**套装限量 */
        public getLimitInfo() {
            return net.sendAndWait(new pb.cs_spring_song_cloth_num()).then((msg: pb.sc_spring_song_cloth_num) => {
                let model = clientCore.CManager.getModel(this.sign) as SpringLoveSongModel;
                model.limitCnt = msg.leftNum;
            });
        }

        /**套装购买 */
        public buySuit(id: number, handler: Laya.Handler) {
            if (this.waiting) return;
            this.waiting = true;
            net.sendAndWait(new pb.cs_spring_song_show_buy_cloth({ suitId: id })).then((msg: pb.sc_spring_song_show_buy_cloth) => {
                alert.showReward(msg.items);
                handler?.run();
                this.waiting = false;
            }).catch(() => {
                this.waiting = false;
            });
        }

        /**恋语相簿面板信息 */
        public getShowInfo() {
            return net.sendAndWait(new pb.cs_spring_song_show_panel()).then((msg: pb.sc_spring_song_show_panel) => {
                let model = clientCore.CManager.getModel(this.sign) as SpringLoveSongModel;
                model.initMsg(msg);
            });
        }

        /**参加走秀 */
        public goShow(fUid: number, flag: number, bgShow: number, cloths: number[]) {
            net.send(new pb.cs_spring_song_join_show({ friendUid: fUid, flag: flag, bgShow: bgShow, clotheIdArr: cloths }));
        }

        /**领取称号 */
        public getTitle(type: number, handler: Laya.Handler) {
            if (this.waiting) return;
            this.waiting = true;
            net.sendAndWait(new pb.cs_spring_song_show_get_item({ type: type })).then((msg: pb.sc_spring_song_show_get_item) => {
                alert.showReward(msg.items);
                handler?.run();
                this.waiting = false;
            }).catch(() => {
                this.waiting = false;
            });
        }

        /**点赞 */
        public clickLike(uid: number, handler: Laya.Handler) {
            if (this.waiting) return;
            this.waiting = true;
            net.sendAndWait(new pb.cs_spring_song_show_congrats({ uid: uid })).then((msg: pb.sc_spring_song_show_get_item) => {
                if (msg.items.length > 0) alert.showReward(msg.items);
                // else alert.showFWords("今日点赞奖励次数已达上限");
                handler?.run();
                this.waiting = false;
            }).catch(() => {
                this.waiting = false;
            });
        }

        /**获取所有的走秀形象 */
        public getAllShow(isfirst: boolean = false) {
            let model = clientCore.CManager.getModel(this.sign) as SpringLoveSongModel;
            let start: number = 0;
            let end: number = 0;
            if (!model.allShow) end = 30;
            else if (model.allShow.length < model.maxShowCnt) {
                start = model.allShow.length;
                end = model.maxShowCnt - 1;
            } else {
                this.waiting = false;
                return;
            }
            return net.sendAndWait(new pb.cs_spring_song_show_list({ start: start, end: end })).then((msg: pb.sc_spring_song_show_list) => {
                if (!model.allShow) model.allShow = msg.showInfos;
                else model.allShow = model.allShow.concat(msg.showInfos);
                model.allShow = _.uniqBy(model.allShow, o => o.uid);
                _.remove(model.allShow, (o) => { return o.uid == clientCore.LocalInfo.uid });
                if (isfirst) {
                    model.allShow = _.shuffle(model.allShow);
                    model.allShow = _.sortBy(model.allShow, "flag");
                }
                model.maxShowCnt = msg.maxLength;
                this.waiting = false;
            }).catch(() => {
                this.waiting = false;
            });
        }
    }
}