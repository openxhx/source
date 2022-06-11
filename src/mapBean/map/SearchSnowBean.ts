namespace mapBean {
    const MAP_POS = '684/1164;1005/1162;2277/1419;2445/1335;2090/958;1284/1162;2330/802;1188/1036;1956/1250;1662/214';
    /**
     * 觅雪寻冬地图bean
     * 
     */
    export class SearchSnowBean implements core.IMapBean {
        private _snowImgArr: Laya.Image[] = [];
        private _isPlaying: boolean = false;
        private _currImg: Laya.Image;
        private _data: pb.Isnow_panel[];
        private _destory: boolean = false;
        private _idx: number;
        start(ui?: any, data?: any): void {
            net.sendAndWait(new pb.cs_sweep_the_snow_panel()).then((data: pb.Isc_sweep_the_snow_panel) => {
                if (this._destory)
                    return;
                this._data = data.panelInfo;
                this.createMap();
            })
        }

        private createMap() {
            let posArr = MAP_POS.split(';');
            for (let i = 0; i < posArr.length; i++) {
                const pos = posArr[i];
                if (this._data[i].res == 2)
                    continue;
                let img = new Laya.Image(`res/otherLoad/searchSnow/${_.random(1, 3, false)}.png`);
                img.anchorX = img.anchorY = 0.5;
                let posInfo = pos.split('/').map(s => parseInt(s));
                img.pos(posInfo[0], posInfo[1]);
                clientCore.MapManager.mapItemsLayer.addChild(img);
                BC.addEvent(this, img, Laya.Event.CLICK, this, this.onSnowClick, [i]);
            }
        }

        private onSnowClick(idx: number, e: Laya.Event) {
            if (this._isPlaying)
                return;
            this._idx = idx;
            this._isPlaying = true;
            this._currImg = e.currentTarget as Laya.Image;
            let bone = clientCore.BoneMgr.ins.play('res/otherLoad/searchSnow/broom.sk', 0, false, this._currImg.parent as Laya.Sprite);
            bone.pos(this._currImg.x, this._currImg.y);
            bone.once(Laya.Event.COMPLETE, this, this.onComplete);
        }

        private async onComplete() {
            this._isPlaying = false;
            console.log('snow')
            console.log(this._data[this._idx])
            let mod = await clientCore.ModuleManager.open('snowEvent.SnowEventModule', { data: this._data[this._idx], idx: this._idx });
            mod.once(Laya.Event.COMPLETE, this, (data: pb.Isnow_panel) => {
                this._data[this._idx] = data;
                if (data.res == 2)
                    this._currImg?.destroy();
            })
        }

        touch(): void {
        }

        redPointChange(): void {
        }

        destroy(): void {
            this._destory = true;
            BC.removeEvent(this);
            for (const o of this._snowImgArr) {
                o.destroy();
            }
            this._snowImgArr = [];
        }
    }
}