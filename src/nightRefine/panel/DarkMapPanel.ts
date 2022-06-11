namespace nightRefine{

    const DESCS: string[] = [
        "能够不断复制自身的黑暗道具。由可相互延长花期的符文炼制。",
        "充满浓郁果实甜香的黑暗道具。需要能让果实更加芳香的符文组合。",
        "能迷惑心智的黑暗道具。将四种无害的符文组合在一起即可炼制。",
        "散发剧毒的黑暗道具,但却不会危及使用者自身.由毒性符文和耐毒符文一起才能炼制。",
        "能散发出异香吸引魔物的黑暗道具。需要能让百合散发出异香的符文组合。",
        "炼成失败的产物，看起来像六种元素被挤成了一坨。"
    ]

    const REWARDS_MAN: number[][] = [
        [134248],
        [134240],
        [134245,134243],
        [134247],
        [134242,134244],
        [134246]
    ]

    const REWARDS_WOMAN: number[][] = [
        [134239],
        [134231],
        [134236,134234],
        [134238],
        [134233,134235],
        [134237]
    ]

    const ITEMS: number[] = [
        9900174,
        9900176,
        9900178,
        9900175,
        9900177,
        9900179
    ]

    /**
     * 黑暗图鉴
     */
    export class DarkMapPanel extends ui.nightRefine.panel.DarkMapPanelUI{
        private _control: NightRefineControl;
        private _tips: TipsPanel;

        show(sign: number): void{
            this._tips = new TipsPanel();
            this._control = clientCore.CManager.getControl(sign) as NightRefineControl;
            this.updateGray();
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            this._tips.destroy();
            this._tips = null;
            this._control = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.onMake);
            BC.addEvent(this, Laya.stage, Laya.Event.CLICK, this, this.onStageClick);
            for(let i:number=1; i<7; i++){
                let id: number = ITEMS[i - 1];
                let img: Laya.Image = this[`img_${i}`];
                img.skin = clientCore.ItemsInfo.getItemIconUrl(id);
                BC.addEvent(this, this[`img_${i}`], Laya.Event.CLICK, this, this.onClick, [i]);
            }
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        private onMake(): void{
            this._control.moneyRefine(new Laya.Handler(this, this.updateGray));
        }
        private onClick(index: number): void{
            index = index - 1;
            if(!this._tips.parent) this.addChild(this._tips);
            this._tips.pos(this.mouseX, this.mouseY);
            this._tips.show({id: ITEMS[index], desc: DESCS[index], rewards: clientCore.LocalInfo.sex == 1 ? REWARDS_WOMAN[index] : REWARDS_MAN[index]});
        }
        private onStageClick(): void{
            if(!this._tips)return;
            if(this._tips.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY))return;
            this._tips.removeSelf();
        }
        private updateGray(): void{
            let allGet: boolean = true;
            for(let i:number=0; i<6; i++){
                let rewards: number[] =  clientCore.LocalInfo.sex == 1 ? REWARDS_WOMAN[i] : REWARDS_MAN[i];
                let img: Laya.Image = this[`img_${i + 1}`];
                let unlock: boolean = clientCore.ItemsInfo.checkHaveItem(rewards[0]);
                img.gray = !unlock;
                this[`wd_${i + 1}`].visible = unlock;
                if(allGet && img.gray) allGet = false;
            }
            this.btnMake.visible = !allGet;
        }
    }
}