import chalk, { ChalkInstance } from "chalk";
import * as loglevel from "loglevel";
import * as logprefix from "loglevel-plugin-prefix";

export const { getLogger } = loglevel;

function initializeLogging() {
    const colors: Record<string, ChalkInstance> = {
        TRACE: chalk.magenta,
        DEBUG: chalk.cyan,
        INFO: chalk.blue,
        WARN: chalk.yellow,
        ERROR: chalk.red,
    };

    logprefix.reg(loglevel);
    logprefix.apply(loglevel.default, {
        format(level, name, timestamp) {
            return `${chalk.gray(`[${timestamp}]`)}[${chalk.green(`${name}`)}] ${colors[level.toUpperCase()](level.padEnd(5))}`;
        },
    });

    loglevel.setDefaultLevel("trace");
    loglevel.rebuild();
}

initializeLogging();