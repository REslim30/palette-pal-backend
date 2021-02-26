declare module "mongoose" {
    namespace SchemaTypeOpts {
        interface ValidateOpts {
            validator?: RegExp | ValidateFn<any> | undefined;
            message?: IMessageFn | string;
            type?: string;
            [key: string]: any;
        }
    }
}

interface IMessageFn {
    (properties: {[key: string]: any}): string;
}