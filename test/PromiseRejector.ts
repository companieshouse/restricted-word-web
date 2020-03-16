class PromiseRejector {

    public static rejectWith<T>(rejection: any) {
        return Promise.reject<T>(rejection);
    }
}

export = PromiseRejector;
