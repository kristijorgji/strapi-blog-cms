import {faker} from "@faker-js/faker";

function randomMySQLDatetime(): string {
  return faker.date.anytime().toISOString().slice(0, 19).replace('T', ' ');
}

export function make<T>(nr: number, factory: () => T): T[] {
  return Array(nr)
    .fill(0)
    .map(() => factory());
}

export function makeUnique<T>(nr: number, factory: () => T, initialBatch: T[] | null = null): T[] {
  const batch = initialBatch || make(nr, factory);
  const equalMap: Record<number, number[]> = {};

  for (let i = 0; i < batch.length - 1; i++) {
    for (let j = 1; j < batch.length; j++) {
      if (i === j) {
        continue;
      }

      if (deepEqual(batch[i], batch[j])) {
        if (!equalMap[i]) {
          equalMap[i] = [];
        }
        equalMap[i].push(j);
      }
    }
  }

  if (Object.keys(equalMap).length > 0) {
    for (const index in equalMap) {
      let tries = 0;
      for (const equalIndex of equalMap[index]) {
        do {
          batch[equalIndex] = factory();
          tries++;
        } while (tries < 100 && deepEqual(batch[index], batch[equalIndex]));
        if (tries >= 100) {
          throw Error(`Cannot make ${nr} unique entries with provided factory ${factory}`);
        }
      }
    }

    // @ts-ignore
    if (makeUnique.c && makeUnique.c === 5) {
      throw Error(`Cannot make ${nr} unique entries with provided factory ${factory}`);
    }
    // @ts-ignore
    if (makeUnique.c === undefined) {
      // @ts-ignore
      makeUnique.c = 0;
    }
    // @ts-ignore
    makeUnique.c++;

    return makeUnique(nr, factory, batch);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  makeUnique.c = 0;
  return batch;
}

export function crandom<T>(source: T[]): T {
  return source[randomInt(0, source.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * max + min);
}

function randomEnum<T>(anEnum: T): T[keyof T] {
  const enumValues = Object.keys(anEnum).filter((n) => true) as unknown as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex];
}

export function deepEqual(obj1: any, obj2: any, ignoreKeys?: Set<string>): boolean {
  if (obj1 === null && obj2 == null) {
    return true;
  } else if ((obj1 === null && obj2 !== null) || (obj1 !== null && obj2 === null)) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (ignoreKeys?.has(key)) {
      continue;
    }

    const val1 = obj1[key];
    const val2 = obj2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
      return false;
    }
  }

  if (typeof obj1 === 'number' && typeof obj2 === 'number') {
    return obj1 === obj2;
  }

  return true;
}

export function isObject(source: unknown): boolean {
  return source != null && typeof source === 'object';
}
