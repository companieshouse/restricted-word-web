import { SubstituteOf } from "@fluffy-spoon/substitute";

type SubstituteConfigurator<T extends object> = (substitute: SubstituteOf<T>) => void;

export default SubstituteConfigurator;
