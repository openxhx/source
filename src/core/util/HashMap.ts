namespace util {
    export class HashMap<V>{
        private _list: Map<string, V>;
        constructor() {
            this._list = new Map<string, V>();
        }

        public add(key: string | number, value: V): void {
            if (typeof key == "number") {
                key = key.toString();
            }
            this._list.set(key, value);
        }

        /**返回删除的对象 */
        public remove(key: string | number): V {
            if (typeof key == "number") {
                key = key.toString();
            }
            let tmp = this._list.get(key);
            this._list.delete(key);
            return tmp;
        }

        public has(key: string | number): boolean {
            if (typeof key == "number") {
                key = key.toString();
            }
            return this._list.has(key);
        }

        public get(key: string | number): V {
            if (typeof key == "number") {
                key = key.toString();
            }
            if (this._list.has(key)) {
                return this._list.get(key);
            }
            return null;
        }

        public get length(): number {
            return this._list.size;
        }

        public getKeys(): string[] {
            return Array.from(this._list.keys());
        }

        public getValues(): V[] {
            return Array.from(this._list.values());
        }

        /**k-v形式的数组 */
        public toArray() {
            return Array.from(this._list.entries());
        }

        public clear(): void {
            this._list.clear();
        }
    }
}

