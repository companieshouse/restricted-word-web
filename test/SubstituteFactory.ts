import { Substitute, SubstituteOf } from "@fluffy-spoon/substitute";

import SubstituteConfigurator from "./SubstituteConfigurator";

class SubstituteFactory {
    // eslint-disable-next-line @typescript-eslint/ban-types
    public static create<T extends Object>(substituteConfigurator?: SubstituteConfigurator<T>): SubstituteOf<T> {
        const substitute = Substitute.for<T>();

        if (substituteConfigurator) {
            substituteConfigurator(substitute);
        }

        return substitute;
    }
}

export default SubstituteFactory;
