namespace pickingApple{
    /**
     * 行为
     */
    export class Behavior{
        private owner: Laya.Sprite;
        private place: number;
        
        constructor(owner: Laya.Sprite,place: number){
            this.owner = owner;
            this.place = place;
        }

        /**
         * 延长
         * @param place 
         */
        public elongation(baseSpeed: number,caller: any,checkFunc: Function): Promise<number>{
            return new Promise((ok: Function,fail: Function)=>{
                let st: number = Laya.Browser.now();
                let sh: number  = 91;
                let frame: Function = ()=>{
                    let pass: number = Laya.Browser.now() - st;
                    let height: number = sh + pass * baseSpeed;
                    let ret: number = checkFunc.apply(caller,[this.place,height]);
                    if(ret != 0){
                        Laya.timer.clear(this,frame);
                        ok(ret);
                        return;
                    }
                    this.owner.height = height;
                }
                Laya.timer.frameLoop(1,this,frame);
            })
        }

        /**
         * 收回
         * @param tool 
         * @param speed 
         */
        public takeBack(speed: number): Promise<void>{
            return new Promise((ok: Function,fail: Function)=>{
                let st: number = Laya.Browser.now();
                let sh: number = this.owner.height;
                let frame = ()=>{
                    let pass: number = Laya.Browser.now() - st;
                    let height: number = sh - pass * speed;
                    if(height <= 91){
                        this.clearSpoil();
                        this.owner.height = 91;
                        Laya.timer.clear(this,frame);
                        ok();
                        return;
                    }
                    this.owner.height = height;
                }
                Laya.timer.frameLoop(1,this,frame);
            })
        }

        /** 去掉战利品*/
        public clearSpoil(): void{            
            let img: Laya.Image = this.owner.getChildByName('spoil') as Laya.Image;
            img?.destroy();
        }

        clearTimer(): void{
            Laya.timer.clearAll(this);
        }

        dispose(): void{
            this.clearTimer();
            this.owner = null;
        }
    }
}