module clientCore {
	export class ClothData {
		public constructor() {
		}

		public static ALL_CLOTH_DATA: { [id: number]: ClothInfo } = {};
		private static json1: Object;
		private static json2: Object;

		public static initData(json: any): void {
			this.json1 = json;
			for (let k1 in json) {
				if (xls.get(xls.itemCloth).has(k1))
					ClothData.ALL_CLOTH_DATA[k1] = new ClothInfo(k1,json[k1]);
			}
		}

		/**h5独占服装 */
		public static initDataNew(json: any): void {
			this.json2 = json;
			for (let k1 in json) {
				if (xls.get(xls.itemCloth).has(k1))
					ClothData.ALL_CLOTH_DATA[k1] = new ClothInfo(k1,json[k1]);
			}
		}

		/**
		 * 获取服装信息,没有返回null
		 * （itemCloth表和两张服装偏移json中都有才能查到）
		 * 3.19更改 偏移表中没有也会返回ClothInfo对象，但是穿不上
		 * */
		public static getCloth(id: number): ClothInfo {
			let info: ClothInfo = ClothData.ALL_CLOTH_DATA[id];
			if (info) {
				return info;
			}
			if (xls.get(xls.itemCloth).has(id)) {
				let info2 = new ClothInfo(id.toString(), []);
				//皮肤是没有偏移的 就不弹提示了
				if (info2.clothType != CLOTH_TYPE.Skin)
					console.log(id + '在偏移表中找不到!');
				return info2;
			}
			return null;
		}

		public static debugCheck() {
			let xlsIdArr = xls.get(xls.itemCloth).getKeys();
			let lessIsJson = [];
			for (const id of xlsIdArr) {
				if (!this.json1.hasOwnProperty(parseInt(id)) && !this.json2.hasOwnProperty(parseInt(id)))
					lessIsJson.push(id);
			}
			console.log('在表中 不在json中:');
			console.log(lessIsJson);
		}

		public static checkIsSkin(id: number) {
			if (xls.get(xls.itemCloth).has(id))
				return xls.get(xls.itemCloth).get(id).kind == clientCore.CLOTH_TYPE.Skin;
			return false;
		}
	}
}