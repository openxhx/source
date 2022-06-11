namespace rotateJump {
    export class PlanetDef {
        public read(data: Laya.Byte): void {
            this.mIndex = data.readInt32();
            this.mRotateSpeedMin = Number(data.readUTFBytes(4));
            this.mRotateSpeedMax = Number(data.readUTFBytes(4));
            //console.log(this.mRotateSpeedMin + "," + this.mRotateSpeedMax);
            this.mRadiusMin = data.readInt32();
            this.mRadiusMax = data.readInt32();
            this.mDistanceMin = data.readInt32();
            this.mDistanceMax = data.readInt32();
            let typeStr: string = data.readUTFBytes(32).trim();
            if (typeStr.length > 5)
                this.mType = PlanetType.Horizontal;
            data.readUTFBytes(32);
        }

        public get index(): number {
            return this.mIndex;
        }

        public get rotateSpeedMin(): number {
            return this.mRotateSpeedMin;
        }

        public get rotateSpeedMax(): number {
            return this.mRotateSpeedMax;
        }

        public get radiusMin(): number {
            return this.mRadiusMin;
        }

        public get radiusMax(): number {
            return this.mRadiusMax;
        }

        public get distanceMin(): number {
            return this.mDistanceMin;
        }

        public get distanceMax(): number {
            return this.mDistanceMax;
        }

        public get type(): PlanetType {
            return this.mType;
        }


        private mIndex: number;
        private mRotateSpeedMin: number;
        private mRotateSpeedMax: number;
        private mRadiusMin: number;
        private mRadiusMax: number;
        private mDistanceMin: number;
        private mDistanceMax: number;
        private mType: PlanetType = PlanetType.Rotate;
    }
}