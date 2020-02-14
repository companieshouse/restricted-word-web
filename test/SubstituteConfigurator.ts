import { SubstituteOf } from "@fluffy-spoon/substitute";

interface SubstituteConfigurator<T> {
    (substitute: SubstituteOf<T>): void;
}

// eslint-disable-next-line no-undef
export = SubstituteConfigurator;
