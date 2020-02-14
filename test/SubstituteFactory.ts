import { Substitute, SubstituteOf } from "@fluffy-spoon/substitute";

import SubstituteConfigurator from "./SubstituteConfigurator";

class SubstituteFactory {

    public static create<T>(substituteConfigurator?: SubstituteConfigurator<T>): SubstituteOf<T> {

        const substitute = Substitute.for<T>();

        if (substituteConfigurator) {
            substituteConfigurator(substitute);
        }

        return substitute;
    }
}

export = SubstituteFactory;
