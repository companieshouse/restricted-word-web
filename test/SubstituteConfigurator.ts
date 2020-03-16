import { SubstituteOf } from "@fluffy-spoon/substitute";

interface SubstituteConfigurator<T> {
    (substitute: SubstituteOf<T>): void;
}

export default SubstituteConfigurator;
