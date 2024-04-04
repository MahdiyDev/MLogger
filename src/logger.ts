import * as util from "util";

export enum LogColor {
	NONE = "",
	RESET = "\x1b[0m",
	BRIGHT = "\x1b[1m",
	DIM = "\x1b[2m",
	UNDERSCORE = "\x1b[4m",
	BLINK = "\x1b[5m",
	REVERSE = "\x1b[7m",
	HIDDEN = "\x1b[8m",

	BLACK_TEXT = "\x1b[30m",
	RED_TEXT = "\x1b[31m",
	GREEN_TEXT = "\x1b[32m",
	YELLOW_TEXT = "\x1b[33m",
	BLUE_TEXT = "\x1b[34m",
	MAGENTA_TEXT = "\x1b[35m",
	CYAN_TEXT = "\x1b[36m",
	WHITE_TEXT = "\x1b[37m",
	GRAY_TEXT = "\x1b[90m",

	BLACK_TEXT_BACKGOUND = "\x1b[40m",
	RED_TEXT_BACKGOUND = "\x1b[41m",
	GREEN_TEXT_BACKGOUND = "\x1b[42m",
	YELLOW_TEXT_BACKGOUND = "\x1b[43m",
	BLUE_TEXT_BACKGOUND = "\x1b[44m",
	MAGENTA_TEXT_BACKGOUND = "\x1b[45m",
	CYAN_TEXT_BACKGOUND = "\x1b[46m",
	WHITE_TEXT_BACKGOUND = "\x1b[47m",
	GRAY_TEXT_BACKGOUND = "\x1b[100m",
}

export enum LogLevel {
	OFF = 0,
	FATAL,
	ERROR,
	WARN,
	INFO,
	DEBUG,
	TRACE,
	ALL,
}

type PrintAbleLogLevel = Exclude<LogLevel, LogLevel.OFF | LogLevel.ALL>;

const LogLevelString: { [key in PrintAbleLogLevel]: string } = {
	[LogLevel.FATAL]: "FATAL",
	[LogLevel.ERROR]: "ERROR",
	[LogLevel.WARN]: "WARN",
	[LogLevel.INFO]: "INFO",
	[LogLevel.DEBUG]: "DEBUG",
	[LogLevel.TRACE]: "TRACE",
};

const LogLevelColor: { [key in PrintAbleLogLevel]: LogColor } = {
	[LogLevel.FATAL]: LogColor.RED_TEXT_BACKGOUND,
	[LogLevel.ERROR]: LogColor.RED_TEXT,
	[LogLevel.WARN]: LogColor.YELLOW_TEXT,
	[LogLevel.INFO]: LogColor.BLUE_TEXT,
	[LogLevel.DEBUG]: LogColor.BLUE_TEXT_BACKGOUND,
	[LogLevel.TRACE]: LogColor.GRAY_TEXT,
};

enum IStream {
	CONSOLE = 0,
	FILE,
}

export interface LoggerConfig {
	logLevel: LogLevel.ALL;
	stream: IStream.CONSOLE;
	logLevelColor: Partial<typeof LogLevelColor>;
}

export class Logger {
	constructor(private config: Partial<LoggerConfig>) {
		this.config.logLevel = this.config.logLevel ?? LogLevel.ALL;
		this.config.stream = this.config.stream ?? IStream.CONSOLE;
		this.config.logLevelColor = this.config.logLevelColor ?? LogLevelColor;
	}

	colorize(color: LogColor, text: string) {
		return color + text + LogColor.RESET;
	}

	private format(message: string, ...args: unknown[]) {
		return util.format(message, ...args);
	}

	write(loglevel: PrintAbleLogLevel, message: string, ...args: unknown[]) {
		let print_able_message = "";
		let date_message = "[" + new Date().toISOString() + "] ";
		let log_level_message = LogLevelString[loglevel];
		const formated_message = this.format(message, ...args);

		date_message = this.colorize(LogColor.GRAY_TEXT, date_message);
		log_level_message = this.colorize(
			this.config.logLevelColor[loglevel],
			log_level_message,
		);

		log_level_message += ": "; // to fix backgound color

		print_able_message =
			date_message + log_level_message + formated_message;

		if (this.config.stream === IStream.CONSOLE) {
			process.stdout.write(print_able_message, (err) => {
				if (err) {
					console.error(err);
				}
			});
		}
	}

	log<T>(logLevel: PrintAbleLogLevel, message: T, ...args: unknown[]) {
		if (this.config.logLevel >= logLevel) {
			if (typeof message === "string") {
				this.write(logLevel, message, ...args, "\n");
			} else if (typeof message === "object") {
				let custom_message =
					"\n" + message.constructor.name + ":" + "\n";
				custom_message += "{\n";
				for (const [key, value] of Object.entries(message)) {
					custom_message += this.format("  %s: %s", key, value, "\n");
				}
				custom_message += "}\n";
				this.write(logLevel, custom_message);
			} else {
				this.write(logLevel, String(message), "\n");
			}
		}
	}

	fatal<T>(message: T, ...args: unknown[]) {
		this.log(LogLevel.FATAL, message, ...args);
	}
	error<T>(message: T, ...args: unknown[]) {
		this.log(LogLevel.ERROR, message, ...args);
	}
	warn<T>(message: T, ...args: unknown[]) {
		this.log(LogLevel.WARN, message, ...args);
	}
	info<T>(message: T, ...args: unknown[]) {
		this.log(LogLevel.INFO, message, ...args);
	}
	debug<T>(message: T, ...args: unknown[]) {
		this.log(LogLevel.DEBUG, message, ...args);
	}
	trace<T>(message: T, ...args: unknown[]) {
		this.log(LogLevel.TRACE, message, ...args);
	}
}
