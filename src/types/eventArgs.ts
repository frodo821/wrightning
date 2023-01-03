export type EventArg<TEvent, TTarget> = TEvent & { currentTarget: EventTarget & TTarget };
