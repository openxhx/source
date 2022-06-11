namespace scene.font {
    /**
     * 飘字管理
     */
    export class FontManager {
        constructor() { }

        /**
         * 展示飘字 
         * @param type 类型 
         * @param value 值
         * @param x 
         * @param y 
         */
        public static showFont(type: battle.AttackType, value: string, x: number, y: number): void {
            if (type == battle.AttackType.CRIT) {
                FontTex.show(4, x, y, "-" + value);
                return;
            }
            let ft: Font = Font.create();
            ft.setParams(type, value, x, y);
            map.MapScene.ins.flyWord.addChild(ft);
        }
    }
}