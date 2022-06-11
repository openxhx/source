namespace searchCherryClues {
    export class SearchCherryCluesModel implements clientCore.BaseModel {
        public info: clientCore.SearchClubsMapData;
        private readonly petals_cnt: number = 5;
        private readonly error_angle: number = 5;
        private readonly xz_angle: number = 37.3;//向上30(矫正误差)
        public readonly MONEY_ID: number = 9900203;
        //是否定死本次樱花弹出的面板类型
        private readonly fixPanel: boolean = true;

        //获得一个面板
        public getPanelType(): PanelType {
            if (this.fixPanel) {
                if (!this.info || !this.info.panelType) {
                    const index: number = this.randomNumBoth(0, 9);
                    if (index < 5) {
                        this.info && (this.info.panelType = 2);
                        return PanelType.GiftBoxPanel;
                    } else {
                        this.info && (this.info.panelType = 1);
                        return PanelType.RotateCherryPanel;
                    }
                } else {
                    switch (this.info.panelType) {
                        case 1:
                            return PanelType.RotateCherryPanel;
                        case 2:
                            return PanelType.GiftBoxPanel;
                    }
                }
            } else {
                const index: number = this.randomNumBoth(0, 9);
                if (index < 5) {
                    return PanelType.GiftBoxPanel;
                } else {
                    return PanelType.RotateCherryPanel;
                }
            }
        }
        //是否旋转成功
        public isRotationOK(angle: number, isLoop: boolean = false): boolean {
            angle = angle % 360;
            if (angle < 0) {
                angle = 360 + angle;
            }
            if (angle < this.xz_angle - this.error_angle) return false;
            if (isLoop) {
                const gap: number = 360 / this.petals_cnt;
                const m: number = (angle - this.xz_angle) % gap;
                if (m <= this.error_angle) {
                    return true;
                }
                if (gap - m <= this.error_angle) {
                    return true;
                }
            } else {
                if (Math.abs(angle - this.xz_angle) <= this.error_angle) {
                    return true;
                }
            }
            return false;
        }

        /**
         * 随机算法
         */
        private randomNumBoth(min: number, max: number): number {
            const Range: number = max - min;
            if (Range != 0.0) {
                const Rand: number = Math.random();
                const num: number = min + Math.round(Rand * Range); //四舍五入
                return num;
            } else {
                return min;
            }
        }
        dispose(): void {

        }
    }
}