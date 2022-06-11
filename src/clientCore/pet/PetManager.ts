

namespace clientCore {
    /**
     * 花宝
     */
    export class PetManager {

        /** 以所有者的id为key*/
        private petMap: util.HashMap<Pet> = new util.HashMap<Pet>();

        public update(): void {
            let array: Pet[] = this.petMap.getValues();
            array.forEach((element: Pet) => { element.update(); })
        }

        public add(key: number, value: Pet): void {
            this.petMap.add(key, value);
        }

        public remove(key: number): void {
            this.petMap.remove(key);
        }

        private static _ins: PetManager;
        public static get ins(): PetManager {
            return this._ins || (this._ins = new PetManager());
        }
    }
}