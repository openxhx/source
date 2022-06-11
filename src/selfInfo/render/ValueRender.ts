
namespace selfInfo {

    export class ValueRender extends ui.selfInfo.render.ValueRenderUI {
        constructor() { super(); }
        public pointInfo: { point: number, lv: number, currLvPoint: number, currLvTotalPoint: number };
        public setInfo(type: 'love' | 'wisdom' | 'beauty',info:pb.IUserBase): void {
            switch (type) {
                case 'love':
                    this.pointInfo = clientCore.GlobalConfig.lovePointInfo(info.love);
                    break;
                case 'wisdom':
                    this.pointInfo = clientCore.GlobalConfig.wisdomPointInfo(info.wisdom);
                    break;
                case 'beauty':
                    this.pointInfo = clientCore.GlobalConfig.beatuyPointInfo(info.beauty);
                    break;
                default:
                    break;
            }
            this.imgBar.skin = `selfInfo/${type}Bar.png`;
            this.imgIcon.skin = `selfInfo/${type}.png`;
            this.txtPoint.text = this.pointInfo.point.toString();
            this.txtLv.text = 'Lv' + this.pointInfo.lv;
            this.setProgress(this.pointInfo.currLvPoint / this.pointInfo.currLvTotalPoint);
        }

        /**
         * 设置进度
         * @param value 0-1 
         */
        private setProgress(value: number): void {
            let mask: Laya.Sprite = this.imgBar.mask;
            let graphics: Laya.Graphics = mask.graphics;
            let cmd: Laya.DrawPieCmd = graphics["_one"];
            cmd.endAngle = -90 + 360 * value;
        }
    }
}