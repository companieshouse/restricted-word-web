import { SubstituteOf } from "@fluffy-spoon/substitute";

// eslint-disable-next-line @typescript-eslint/ban-types
interface SubstituteConfigurator<T extends Object> {
    (substitute: SubstituteOf<T>): void;
}

export default SubstituteConfigurator;
