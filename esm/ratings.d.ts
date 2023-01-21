import { Schema, ValidateOpts } from 'mongoose';

export interface Stars{
    [key: number | string]: number;
}


export interface Config {
    levels?: Array<number>;
    name?: string;
    validate?: boolean;
    default?: Stars;
    getter?(field: Stars): number;
    setter?(value: number | Stars): Stars;
    validator?: ValidateOpts<Stars | number>;
}

export declare function ratings(schema: Schema, options: Config): void;
