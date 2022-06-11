namespace scene.animation {
    /**
     * 动画工厂
     */
    export class AnimationFactory {
        constructor() { }

        /**
         * 获取骨骼动画
         * @param path 地址
         * @param complete 载入完成回调
         * @param isRate 是否变速[默认为true]
         */
        public static getBone(path: string, complete?: Laya.Handler, isRate?: boolean): BoneRender {
            let render: BoneRender = BoneRender.create();
            let data: AnimationData = AnimationData.create();
            data.path = path;
            data.isRate = !isRate;
            render.init(data, complete);
            return render;
        }

        /**
         * 获得一个待机的人物
         * @param path 
         */
        public static getIdleBone(path: string): BoneRender {
            let render: BoneRender = BoneRender.create();
            let data: AnimationData = AnimationData.create();
            data.path = path;
            data.isRate = false;
            render.init(data, Laya.Handler.create(this, function (): void {
                render.playAni(unit.ActionEnum.IDLE, true);
            }));
            return render;
        }

        /**
         * 获得骨骼技能特效
         * @param path 资源地址
         * @param callLabel 受击回调
         * @param isLoop 是否循环[默认为false]
         * @param isRate 是否参与变速[默认为true]
         */
        public static getSkillBone(path: string, callLabel: Laya.Handler, isLoop?: boolean, isRate?: boolean): BoneRender {
            let render: BoneRender = BoneRender.create();
            let data: AnimationData = AnimationData.create();
            data.path = path;
            data.isRate = void 0 ? false : isRate;
            isLoop = isLoop == void 0 ? false : isLoop;
            render.init(data, Laya.Handler.create(this, function (): void {
                render.playLabel(0, isLoop, Laya.Handler.create(render, render.dispose), callLabel);
            }));
            return render;
        }

        /**
         * 播放一个带标签的特效【默认参与变速】
         * @param path 
         * @param callLabel 
         * @param label 
         * @param isLoop 
         * @param isRate 
         */
        public static playEffect(path: string, callLabel: Laya.Handler, label: string, isLoop?: boolean, isRate?: boolean): BoneRender {
            let render: BoneRender = BoneRender.create();
            let data: AnimationData = AnimationData.create();
            data.path = path;
            data.isRate = isRate == void 0 ? true : isRate; //默认参与变速
            isLoop = isLoop == void 0 ? false : isLoop;
            render.init(data, Laya.Handler.create(this, () => {
                render.playLabel2(0, isLoop, Laya.Handler.create(render, render.dispose), callLabel, label)
            }))
            return render;
        }

        /**
         * 得到一个注册标签播放的特效
         * @param path 
         * @param callLabel 标签回调
         * @param callComplete 完成是回调 默认是播放完成则删除特效
         * @param isLoop 
         * @param isRate 
         */
        public static getLabelEffect(path: string, callLabel: Laya.Handler, callComplete?: Laya.Handler, isLoop?: boolean, isRate?: boolean): BoneRender {
            let render: BoneRender = BoneRender.create();
            let data: AnimationData = AnimationData.create();
            data.path = path;
            data.isRate = isRate == void 0 ? true : isRate;
            isLoop = isLoop == void 0 ? false : isLoop;
            callComplete = callComplete == void 0 ? Laya.Handler.create(render, render.dispose) : callComplete;
            render.init(data, Laya.Handler.create(this, function (): void {
                render.playLabel(0, isLoop, callComplete, callLabel);
            }));
            return render;
        }

        /**
         * 获得一个播放的特效
         * @param path 
         * @param isLoop 
         * @param complete 
         * @param isRate 
         */
        public static getBoneEffect(path: string, isLoop?: boolean, complete?: Laya.Handler, isRate?: boolean): BoneRender {
            let render: BoneRender = BoneRender.create();
            let data: AnimationData = AnimationData.create();
            data.path = path;
            data.isRate = isRate == void 0 ? true : isRate;
            isLoop = isLoop == void 0 ? false : isLoop;
            render.init(data, Laya.Handler.create(this, function (): void {
                render.playAni(0, isLoop, Laya.Handler.create(this, function (): void {
                    render.dispose();
                    complete && complete.run();
                }));
            }));
            return render;
        }
    }
}