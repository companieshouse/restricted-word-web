class ErrorThrower {

    public static throwWith(error: any) {
        return function () {
            throw error;
        };
    }
}

export = ErrorThrower;
