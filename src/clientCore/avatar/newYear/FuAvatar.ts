namespace clientCore{
    /**
     * 福字
     */
    export class FuAvatar extends Avatar{
        init(data: string): void{
            super.init(data);
            this._display.loadImage(data);
            this._display.size(102,100);
            this._display.scale(0.8,0.8);
        }
        update(): void{
            if(this.checkCollision()){
                this.dispose();
                EventManager.event(globalEvent.COLLISION_FU);
            }
        }
        /** 检查是否与玩家碰撞*/
        private checkCollision(): boolean{
            let people: Laya.Point = PeopleManager.getInstance().getMyPosition();
            people.y -= 20;
            return people.distance(this._x + 37, this._y + 36) < 100;
        }
    }
}