namespace meteorShowerGame{
    /**
     * 人物
     */
    export class Player extends Laya.Script{
        private _bone: clientCore.Bone;
        onAwake(): void{
            this._bone = clientCore.BoneMgr.ins.play(pathConfig.getActivityAnimate('fly'),'cha1',true,this.owner as Laya.Sprite);
            this._bone.pos(102,80);
        }
        onDisable(): void{
            this._bone?.dispose();
            this._bone = null;
        }
        playAni(type: number): void{
            this._bone?.play(type == 1 ? 'cha1' : 'cha2',true);
        }
    }
}