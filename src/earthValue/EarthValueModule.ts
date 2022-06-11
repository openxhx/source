namespace earthValue{

    export class EarthValueModule extends ui.earthValue.EarthValueModuleUI{

        private _panel: Laya.View;

        init(data: number): void{
            this.updateView(data);
        }

        addEventListeners(): void{
            BC.addEvent(this,EventManager,Constant.UPDATE_VIEW,this,this.updateView);
        }

        removeEventListeners(): void{
            BC.removeEvent(this);
        }

        destroy(): void{
            this.cleanView();
            super.destroy();
        }

        private updateView(type: number): void{
            this.cleanView();
            switch(type){
                case 1: //培育任务
                    this._panel = new TaskPanel();
                    this._panel.pos(112,56);
                    this.addChild(this._panel);
                    break;
                case 2: //特殊任务
                    this._panel = new GamePanel();
                    this._panel.pos(69,14);
                    this.addChild(this._panel);
                    break;
                case 3: //培育记录
                    this._panel = new CultivatePanel();
                    this._panel.pos(67,27);
                    this.addChild(this._panel);
                    break;
                case 4: //星球全景
                    this._panel = new EarthPanel();
                    this._panel.pos(67,30);
                    this.addChild(this._panel);
                    break;
                default:
                    break
            }
        }

        private cleanView(): void{
            this._panel?.destroy();
            this._panel = null;
        }
    }
}