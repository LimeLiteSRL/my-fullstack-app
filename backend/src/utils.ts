import crypto from "crypto";

export const uuid = (): string => crypto.randomUUID();
