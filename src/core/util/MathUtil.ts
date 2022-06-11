namespace util {

    export class MathUtil {

        /**
         * https://blog.csdn.net/shao941122/article/details/51488639
         * @param p1 
         * @param q1 
         * @param p2 
         * @param q2 
         */
        public static checkLineSegmentIntersect(p1: Laya.Point, q1: Laya.Point, p2: Laya.Point, q2: Laya.Point) {
            let o1 = this.orientation(p1,q1,p2);
            let o2 = this.orientation(p1,q1,q2);
            let o3 = this.orientation(p2,q2,p1);
            let o4 = this.orientation(p2,q2,q1);

            if(o1 != o2 && o3!= o4){
                return true;
            }

            if(o1 == 0 && this.onSegment(p1,p2,q1)){
                return true;
            }
            if(o2 == 0 && this.onSegment(p1,q2,q1)){
                return true;
            }
            if(o3 == 0 && this.onSegment(p2,p1,q2)){
                return true;
            }
            if(o4 == 0 && this.onSegment(p2,q1,q2)){
                return true;
            }
            return false;
        }
        private static onSegment(p: Laya.Point, q: Laya.Point, r: Laya.Point): boolean {
            if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
                q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
                return true;
            }
            return false;
        }

        private static orientation(p: Laya.Point, q: Laya.Point, r: Laya.Point): number {
            let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
            if (val == 0) {/**像素精度问题，可能不用 == 0 */
                return 0;
            }
            return (val > 0) ? 1 : 2;
        }
        /**求交点 */
        public static getCrossPoint(p1:Laya.Point,p2:Laya.Point,q1:Laya.Point,q2:Laya.Point):Laya.Point{
            let  tmpLeft = 0,tmpRight = 0;
            tmpLeft = (q2.x - q1.x) * (p1.y - p2.y) - (p2.x - p1.x) * (q1.y - q2.y);
            tmpRight = (p1.y - q1.y) * (p2.x - p1.x) * (q2.x - q1.x) + q1.x * (q2.y - q1.y) * (p2.x - p1.x) - p1.x * (p2.y - p1.y) * (q2.x - q1.x);

            let x =Math.floor(tmpRight/tmpLeft);

            tmpLeft = (p1.x - p2.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q1.x - q2.x);
            tmpRight = p2.y * (p1.x - p2.x) * (q2.y - q1.y) + (q2.x- p2.x) * (q2.y - q1.y) * (p1.y - p2.y) - q2.y * (q1.x - q2.x) * (p2.y - p1.y); 
            let y = Math.floor(tmpRight/tmpLeft);
            return new Laya.Point(x,y);
        }
    }
}