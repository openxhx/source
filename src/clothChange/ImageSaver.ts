namespace clothChange {
    export class ImageSaver {
        static _instance: ImageSaver;
        private _personHash: util.HashMap<clientCore.Person2>;
        static get instance() {
            this._instance = this._instance || new ImageSaver();
            return this._instance;
        }
        constructor() {
            this._personHash = new util.HashMap();
        }

        hasImage(posId: number) {
            return this._personHash.has(posId);
        }

        getImage(posId: number) {
            return this._personHash.get(posId);
        }

        setImage(posId: number, clothes: number[]) {
            if (this.hasImage(posId)) {
                let oldClothes = this.getImage(posId).allWearingIds;
                //衣服不同 更新
                if (_.difference(oldClothes, clothes).length > 0) {
                    this._personHash.get(posId).destroy();
                    let person = this.createPerson(clothes);
                    this._personHash.add(posId, person);
                }
            }
            else {
                let person = this.createPerson(clothes);
                this._personHash.add(posId, person);
            }
        }

        private createPerson(clothes: number[]) {
            let person = new clientCore.Person2({ sex: clientCore.LocalInfo.sex, curClothes: clothes }, 'static');
            person.scale(0.255, 0.255);
            return person;
        }

        destory() {
            for (const p of this._personHash.getValues()) {
                p.destroy();
            }
            this._personHash.clear();
        }
    }
}