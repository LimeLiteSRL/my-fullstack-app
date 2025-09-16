import Big from "big.js";

export const sum = (num1: string, num2: string): string => {
  return new Big(num1).add(num2).toString();
};

export const minus = (num1: string, num2: string): string => {
  return new Big(num1).minus(num2).toString();
};

export const times = (num1: string, num2: string): string => {
  return new Big(num1).times(num2).toString();
};

export const divide = (num1: string, num2: string): string => {
  return new Big(num1).div(num2).toString();
};

export const isGraterEqual = (num1: string, num2: string): boolean => {
  return new Big(num1).gte(num2);
};

export const isGrater = (num1: string, num2: string): boolean => {
  return new Big(num1).gt(num2);
};

export const isLessEqual = (num1: string, num2: string): boolean => {
  return new Big(num1).lte(num2);
};

export const getMaxNum = (num1: string, num2: string): string => {
  return new Big(num1).gte(num2) ? num1 : num2;
};

export const getMinNum = (num1: string, num2: string): string => {
  return new Big(num1).lte(num2) ? num1 : num2;
};

export const isEquals = (num1: string, num2: string): boolean => {
  return new Big(num1).eq(num2);
};
