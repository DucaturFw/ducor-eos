import * as dot from "dot";
import * as path from "path";

dot.templateSettings.strip = false;
(<any>dot).process({ path: path.resolve(__dirname, "./templates") });
