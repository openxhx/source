namespace seventhMoonNight {
    /**
     * 各种石头障碍(cell)
     */
    export class GameStoneCell extends Laya.Image {
        private static readonly sizes: Array<{ w: number, h: number }> = [
            {w: 155, h: 73},
            {w: 192, h: 91},
            {w: 251, h: 119},
        ];
        private _type: number;

        constructor(type: number) {
            super();
            this._type = null;
            this.anchorX = 0.5;
            this.anchorY = 1;
            this.reset(type);
        }

        public reset(type: number): void {
            if (this._type == null || this._type != type) {
                this._type = type;
                this.update();
            }
        }

        private async update(): Promise<void> {
            return new Promise<void>(resolve => {
                this.skin = `seventhMoonNight/stone_${this._type}.png`;
                const cell: { w: number, h: number } = GameStoneCell.sizes[this._type - 1];
                this.width = cell.w;
                this.height = cell.h;
                resolve();
            });
        }

        /**
         * 获取石头的类型
         */
        public get stoneType(): number {
            return this._type;
        }

        destroy(): void {
            super.destroy();
        }
    }
}