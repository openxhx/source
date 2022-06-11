namespace meteorShowerGame{
    export class Cloud extends Laya.Script{
        onUpdate(): void{
            let y: number = this.owner['y']+this.owner.parent['y'];
            y > Laya.stage.height && this.owner?.destroy();
        }
    }
}