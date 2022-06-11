/// <reference path="util/ColorData.ts" />
namespace rotateJump {
    export class GameDataConfig {
        public static readonly PLAYER_RADIUS: number = 25;
        public static readonly PLAYER_JUMP_SPEED: number = 0.8;
        public static readonly PLAYER_GRAVITY: number = 0.007;

        public static readonly MAX_PLANET_COUNT: number = 13;
        public static readonly PLANET_DEFAULT_RADIUS: number = 128;
        public static readonly PLANET_ROTATE_SPEED: number = 90;
        public static readonly PLANET_MOVE_SPEED: number = 0.1;

        public static readonly DECO_DIS: number = 445;
        public static readonly BG_COLOR: Array<ColorData> = [new ColorData(240, 245, 215, 255), new ColorData(255, 222, 228, 255), new ColorData(246, 222, 255, 255)];


        public static parseBattleConfig(data: Laya.Byte): void {
            this._planetDefDic = new util.HashMap<PlanetDef>();
            let len: number = data.readInt32();
            for (let i: number = 0; i < len; i++) {
                let def: PlanetDef = new PlanetDef();
                def.read(data);
                this._planetDefDic.add(def.index.toString(), def);
            }

        }

        public static getPlanetDef(index: number): PlanetDef {
            return this._planetDefDic.get(index.toString());
        }

        private static _planetDefDic: util.HashMap<PlanetDef>;
    }
}