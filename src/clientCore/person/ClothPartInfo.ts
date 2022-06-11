module clientCore {
	export class ClothPartInfo {
		public slotName: string;
		public path: string;
		public px: number;
		public py: number;

		public constructor( slotName: string, path: string, px: number, py: number ) {
			this.slotName = slotName;
            this.path = path;
            //页游有些目录错误，这里强制改驼峰
			this.path = path.replace('leftsteeve', 'leftSteeve')
			this.path = path.replace('rightsteeve', 'rightSteeve');
			this.px = px;
            this.py = py;
		}
	}
}