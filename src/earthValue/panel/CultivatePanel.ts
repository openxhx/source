namespace earthValue{
    /**
     * 探索日志
     */
    export class CultivatePanel extends ui.earthValue.panel.CultivatePanelUI{

        private _tab: number;

        private _plots: string[] = [
            '我们终于在这个神秘的星球登陆了，让人震惊的是这片星球除了少量的植被外竟然一片荒芜，没有其他文明存在的痕迹，传说中的在这颗星球上的宝藏真的存在吗？',
            '经过初步的探索，暂未找到宝藏的踪迹，但是在碧星的土壤中发现了一种从未见过的绿色种子。或许这种特殊的种子会成为我们找到宝藏的关键？我们决定尝试对种子进行栽培。',
            '对神秘种子的栽培十分顺利，毕竟我们除了高科技还有作为花仙对自然生物的天然亲和。碧星的宝藏传言吸引了宇宙中无数的寻宝者，大家似乎都猜测宝藏和这神秘的种子有关。',
            '神秘种子已经成功进入成熟期，根据对植物的一系列研究，初步判定是一种没有在拉贝尔大陆出现过的新品种。经过多日的探测，仍然没有在碧星发现特殊能源或宝藏的存在。',
            '神秘植物的发现也算让我们的探索之旅有一定的收获，和总部汇报结果后决定我们明天就启程回到拉贝尔。来自其它星球的探险队有的已经离开，剩下的还是在尝试继续培育神秘植物或深入地心探索。碧星的宝藏，或许真的只是虚假的传言吧。',
            '当我们回到航行舰准备返航时，从太空中看到碧星的景象让我感到不可思议。只是短短一周的时间，这颗原本荒芜的星球竟然重新焕发了生机，就像是一颗被埋葬太久的翠绿宝石，在太空中熠熠生辉。',
            '数不清的神秘种子在这颗星球上被前来寻宝的探索者们种植后发芽成长，再次组成了这个星球的植被。当飞船即将穿过星门的那一刻，我突然明白了传说中隐藏在碧星的宝藏，或许就是这颗充满希望的星球。'
        ]

        constructor(){ super(); }

        onEnable(): void{
            this.recordList.vScrollBarSkin = '';
            this.recordList.renderHandler = new Laya.Handler(this,this.recordRender,null,false);
            this.noteList.vScrollBarSkin = '';
            this.noteList.renderHandler = new Laya.Handler(this,this.noteRender,null,false);
            this.noteList.mouseHandler = new Laya.Handler(this,this.noteMouse,null,false);
            this.noteList.itemRender = NoteItem;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.recordList.array = _.slice(this._plots,0,Math.min(this._plots.length,clientCore.EarthPerciousMgr.level + 1));
            this.noteList.array = _.filter(xls.get(xls.commonAward).getValues(),(element: xls.commonAward)=>{ return element.type == 128; });
            this.addEvents();
            this.onClick(1);
        }

        onDisable(): void{
            this.removeEvents();
        }

        private addEvents(): void{
            BC.addEvent(this,this.recordList.scrollBar,Laya.Event.CHANGE,this,this.onScroll);
            BC.addEvent(this,this.noteList.scrollBar,Laya.Event.CHANGE,this,this.onScroll);
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.onClose);
            BC.addEvent(this,this.cpRecord,Laya.Event.CLICK,this,this.onClick,[1]);
            BC.addEvent(this,this.cpNote,Laya.Event.CLICK,this,this.onClick,[2]);
        }

        private removeEvents(): void{
            BC.removeEvent(this);
        }

        private onClose(e: Laya.Event): void{
            clientCore.ToolTip.gotoMod(243);
        }

        private onClick(type: number): void{
            this._tab = type;
            this.cpNote.index = type == 2 ? 1 : 0;
            this.cpRecord.index = type == 1 ? 1 : 0;
            this.recordList.visible = type == 1;
            this.noteList.visible = type == 2;
            this.onScroll();
        }

        private recordRender(item: ui.earthValue.item.RecordItemUI,index: number): void{
            item.titleTxt.changeText(`星历${index + 1}日 空气质量${['优','良','一般'][_.random(0,2)]} 异常无`);
            item.txt.text = this._plots[index];
        }   

        private noteRender(item: NoteItem,index: number): void{
            item.setInfo(this.noteList.array[index],index);
        }

        private noteMouse(e: Laya.Event,index: number): void{
            if(e.type != Laya.Event.CLICK)return;
            if(e.target instanceof component.HuaButton){
                let pos: number = index + 1;
                let cfg: xls.commonAward = this.noteList.array[index];
                net.sendAndWait(new pb.cs_treasure_of_planet_exchange_cloth({index: pos,id: cfg.id})).then((msg: pb.sc_treasure_of_planet_exchange_cloth)=>{
                    util.RedPoint.reqRedPointRefresh(24301);
                    alert.showReward(msg.items);
                    clientCore.EarthPerciousMgr.setReward(pos);
                    this.noteList.changeItem(index,cfg);
                });
            }
        }

        private onScroll(): void{
            let scroll: Laya.ScrollBar = this._tab == 1 ? this.recordList.scrollBar : this.noteList.scrollBar;
            this.imgBar.y = 130 + 420 * scroll.value / scroll.max;
        }
    }
}