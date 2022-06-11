namespace twinkleResult {
    export class TwinkleResultModule extends ui.twinkleResult.TwinkleResultModuleUI {
        constructor() {
            super();
            this.sideClose = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender, null, false);
        }
        init(data: { chapter: xls.shineTripStage, msg: pb.sc_shine_change_score }): void {
            this.needOpenData = { chapter: data.chapter.requireCharpter, currentChapter: data.msg.newChapterId };
            this.addPreLoad(this.loadNpc(data.chapter.npcid.toString()));
            this.labNpcName.text = xls.get(xls.npcBase).get(data.chapter.npcid).npcName;
            this.labDialog.text = data.chapter["comment"+data.msg.passInfo.star];
            this.needOpenMod = 'twinkleChapter.TwinkleChapterModule';
            this.list.array = data.msg.items;
            this.scoreTxt.changeText(data.msg.passInfo.topScore + '');
            this.starList.dataSource = _.map(new Array(3), (e, idx) => {
                return { 'skin': `twinkleResult/${idx < data.msg.passInfo.star ? 2 : 1}.png` }
            })
        }
        addEventListeners(): void {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.destroy);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            clientCore.ModuleManager.closeModuleByName('clothChange');
            super.destroy();
        }
        private listRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let data: pb.IItem = this.list.array[index];
            clientCore.GlobalConfig.setRewardUI(item, { id: data.id, cnt: data.cnt, showName: false });
        }
        private async loadNpc(id: string) {
            return new Promise((resolve: () => void, reject: () => void) => {
                res.load(pathConfig.getNpcPath(id), Laya.Loader.IMAGE).then(() => {
                    this.imgNpc.skin = pathConfig.getNpcPath(id)[0];
                    resolve();
                });
            });
        }
    }
}