namespace restaurant {
    export class RestaurantNewsPanel extends ui.restaurant.panel.RestaurantNewsPanelUI {
        private curNpc: number;
        /**所有已获得趣闻*/
        private totalNews: number[];
        /**未阅读趣闻 */
        private unreadNews: number[];
        /**当前展示趣闻 */
        private curNews: number[];
        /**当前页数 */
        private curPage: number;
        /**全部页数 */
        private totlePage: number;
        constructor() {
            super();
            this.listHead.vScrollBarSkin = "";
            this.listHead.renderHandler = new Laya.Handler(this, this.headRender);
            this.listHead.mouseHandler = new Laya.Handler(this, this.headSelect);
            this.listNews.renderHandler = new Laya.Handler(this, this.newsRender);
            this.sideClose = true;
        }

        public show() {
            this.totalNews = clientCore.NpcNewsManager.ins.totalNews;
            this.unreadNews = clientCore.NpcNewsManager.ins.unreadNews;
            this.setUI();
            clientCore.DialogMgr.ins.open(this);
        }

        private setUI() {
            let xlsData = xls.get(xls.diningHearsay);
            let npcs = [];
            for (let i: number = 0; i < xlsData.getValues().length; i++) {
                let npc = xlsData.getValues()[i].npcId;
                if (!npcs.includes(npc)) npcs.push(npc);
            }
            npcs.sort((a: number, b: number) => { return a - b });
            npcs.push(npcs.shift());
            this.curNpc = npcs[0];
            this.listHead.array = npcs;
            this.setNews();
        }

        private headRender(item: ui.restaurant.render.NewsHeadRenderUI) {
            let id: number = item.dataSource;
            item.unknow.visible = id == 0;
            item.imgSelect.visible = id == this.curNpc;
            item.red.visible = this.checkNpcNews(id);
            if (id > 0) {
                item.headIcon.skin = clientCore.ItemsInfo.getItemIconUrl(id);
                item.labName.text = clientCore.ItemsInfo.getItemName(id);
            } else {
                item.headIcon.skin = "";
                item.labName.text = "小道消息";
            }
        }

        private headSelect(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let id = this.listHead.getCell(idx).dataSource;
                this.curNpc = id;
                this.listHead.refresh();
                this.setNews();
            }
        }

        private setNews() {
            let xlsData = xls.get(xls.diningHearsay).getKeys().map(Number);
            this.curNews = _.filter(xlsData, (o) => {
                return xls.get(xls.diningHearsay).get(o).npcId == this.curNpc;
            })
            this.totlePage = Math.ceil(this.curNews.length / 6);
            if (this.totlePage == 0) this.totlePage = 1;
            this.curPage = 1;
            this.labPage.text = this.curPage + "/" + this.totlePage;
            let arr = [];
            if (this.curPage * 6 <= this.curNews.length) {
                arr = this.curNews.slice(this.curPage * 6 - 6, this.curPage * 6);
            } else {
                arr = this.curNews.slice(this.curPage * 6 - 6);
            }
            this.listNews.array = arr;
            let newArr = _.filter(arr, (o) => { return this.unreadNews.indexOf(Number(o)) >= 0 });
            if (newArr.length > 0) {
                net.sendAndWait(new pb.cs_read_customer_tidbits({ ids: newArr })).then(() => {
                    _.remove(this.unreadNews, (o) => { return newArr.includes(o) });
                    this.listHead.refresh();
                    util.RedPoint.reqRedPointRefresh(15301);
                });
            }
        }

        private newsRender(item: ui.restaurant.render.NewsRenderUI) {
            let id = item.dataSource;
            if (this.totalNews.includes(id)) {
                item.labContent.text = xls.get(xls.diningHearsay).get(id).content;
                item.imgNew.visible = this.unreadNews.includes(id);
                item.imgUnknow.visible = false;
            } else {
                item.labContent.text = "";
                item.imgNew.visible = false;
                item.imgUnknow.visible = true;
            }
        }
        /**换页 */
        private changePage(flag: number) {
            if (this.curPage == 1 && flag == -1) return;
            if (this.curPage == this.totlePage && flag == 1) return;
            this.curPage += flag;
            let arr = [];
            if (this.curPage * 6 <= this.curNews.length) {
                arr = this.curNews.slice(this.curPage * 6 - 6, this.curPage * 6);
            } else {
                arr = this.curNews.slice(this.curPage * 6 - 6);
            }
            this.listNews.array = arr;
        }

        /**检查制定npc是否有未读趣闻 */
        private checkNpcNews(npc: number) {
            for (let i: number = 0; i < this.unreadNews.length; i++) {
                let xlsdata = xls.get(xls.diningHearsay).get(this.unreadNews[i]);
                if (xlsdata.npcId == npc) return true;
            }
            return false;
        }

        private closeClick() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.changePage, [-1]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.changePage, [1]);

        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroyData() {
            this.totalNews = null;
            this.unreadNews = null;
            this.curNews = null;
            this.listHead.mouseHandler.recover();
            this.listHead.renderHandler.recover();
            this.listNews.renderHandler.recover();
            this.listNews.destroyChildren();
            this.destroy();
        }

        destroy() {
            super.destroy();
        }
    }
}