import { Schema, ValidateOpts } from 'mongoose';
export type stars = {
    [key: number | string]: number;
};
export interface Config {
    levels?: Array<number>;
    name?: string;
    validate?: boolean;
    default?: stars;
    getter?(field: stars): number;
    setter?(value: number | stars): stars;
    validator?: ValidateOpts<stars | number>;
}
export declare function ratings(schema: Schema, options: Config): void;
//# sourceMappingURL=ratings.d.ts.map