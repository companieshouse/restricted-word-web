class PromiseResolver {

    public static resolveWith<T>(resolution: any) {
        return new Promise<T>((resolve) => resolve(resolution));
    }
}

export = PromiseResolver;
