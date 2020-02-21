class PromiseRejector {

    public static rejectWith<T>(rejection: any) {
        return new Promise<T>((_resolve, reject) => reject(rejection));
    }
}

export = PromiseRejector;
