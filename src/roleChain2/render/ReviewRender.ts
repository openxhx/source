namespace roleChain2 {
    export class ReviewRender extends ui.roleChain2.render.ReviewRenderUI {
        constructor() {
            super();

            this.list.renderHandler = Laya.Handler.create(this, this.rewardItem, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.rewardMouse, null, false);
        }

        public init(data: { index: number, title: string, isLock: boolean, dataList: { taskDes: string, mcId: number, isLock: boolean, isNew: boolean }[] }): void {
            super.init(data);
            this._data = data;
            this.bg.skin = data.isLock ? "roleChain2/pianhao2.png" : "roleChain2/pianhao1.png";
            this.imgLock.visible = data.isLock;
            this.labChapter.text = "" + (data.index + 1);
            this.labDesc.text = data.title;
        }

        public onSelect(value: boolean): void {
            if (value) {
                let num = this._data.dataList.length;
                this.imgArrow.skin = "roleChain2/arrow1.png";
                this.list.dataSource = this._data.dataList;
                this.list.repeatY = num;
                this.height = this.list.y + num * 42 + (num - 1) * this.list.spaceY + 5;
            } else {
                this.imgArrow.skin = "roleChain2/arrow2.png";
                this.list.dataSource = [];
                this.list.repeatY = 0;
                this.height = 55;
            }
        }

        private rewardItem(item: ui.roleChain2.render.ReviewRender2UI, index: number): void {
            let data = item.dataSource;
            item.bg.skin = data.isLock ? "roleChain2/pianhao4.png" : "roleChain2/pianhao3.png";
            item.imgLock.visible = data.isLock;
            item.labDesc.text = data.taskDes;
        }

        private rewardMouse(e: Laya.Event, index: number): void {
            if (e.type == Laya.Event.CLICK) {
                let data: any = e.currentTarget["dataSource"];
                if (data.isLock) {
                    return;
                }
                clientCore.AnimateMovieManager.showAnimateMovie(data.mcId, null, null);
            }
        }

        dispose(): void {
            BC.removeEvent(this);
        }

        destory() {
            BC.removeEvent(this);
        }
    }
}