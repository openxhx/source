namespace newActivity{
    /**
     * 功能单元
     */
    export class ModuleItem extends ui.newActivity.item.ModuleItemUI{
        constructor(){ super(); }
    
        public setInfo(caller: NewActivityModule,id: number, index: number): void{
            this.imgTitle.skin = `newActivity/title_${index}.png`;
            this.imgIcon.skin = `res/limitActivity/module/img_${index}.png`;
            let cfg: xls.systemTable = xls.get(xls.systemTable).get(id);
            let isLock: boolean = cfg.unlockRequire.v2 > clientCore.LocalInfo.userLv;
            this.boxLock.visible =  this.imgIcon.gray = isLock;
            this.boxGo.visible = !isLock;
            this.levelTxt.changeText(cfg.unlockRequire.v2 + '');
        }
    }
}