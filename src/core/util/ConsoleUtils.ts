namespace util {
    export function print(tag: string, ...argv): void {
        let stri = tag;
        for (let element of argv) stri += " " + element
        console.log(stri);
    }


}


namespace Log {
    export function show(tag: string, argv: string[]): string {
        let value: string = tag;
        _.forEach(argv, (element) => { value += ': ' + element; });
        return value;
    }

    export function i(tag: string, ...argv): void {
        console.log(show(tag, argv));
    }

    export function e(tag: string, ...argv): void {
        console.error(show(tag, argv));
    }
}