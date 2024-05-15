import { mapObservableResult } from "@nanofire/database";
import { DatabaseReference, child } from "firebase/database";
import { useMemo } from "react";
import { z } from "zod";
import { useFirebaseDatabaseQuery } from "~/utils/useFirebaseDatabaseQuery";

const unknownSchema = z.unknown();

export class ZDbRef<T extends z.ZodTypeAny> {
  constructor(public ref: DatabaseReference, public schema: T) {}
  child<K extends ZodKey<T>>(key: K): ZDbRef<ZodChild<T, K>> {
    const childSchema = isSchemaObject(this.schema)
      ? this.schema.shape[key as string]
      : isSchemaRecord(this.schema)
      ? this.schema.valueSchema
      : unknownSchema;
    return new ZDbRef(child(this.ref, key as string), childSchema);
  }
}

export function usePtr<T extends z.ZodTypeAny>(ptr: ZDbRef<T>) {
  const state = useFirebaseDatabaseQuery(ptr.ref);
  const parsed = useMemo(
    () =>
      mapObservableResult(
        state,
        (data) => ptr.schema.parse(data) as z.infer<T>
      ),
    [state, ptr.schema]
  );
  return parsed;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Anything = any;

type ZodKey<T extends z.ZodTypeAny> = T extends z.ZodType<
  infer O,
  Anything,
  Anything
>
  ? O extends object
    ? keyof O
    : never
  : never;

type ZodChild<
  T extends z.ZodTypeAny,
  K extends ZodKey<T>
> = T extends z.ZodType<
  Anything,
  z.ZodObjectDef<infer S, Anything, Anything>,
  Anything
>
  ? S[K]
  : T extends z.ZodType<Anything, z.ZodRecordDef<Anything, infer V>, Anything>
  ? V
  : never;

const isSchemaObject = (schema: z.ZodTypeAny): schema is z.AnyZodObject => {
  return "shape" in schema;
};
const isSchemaRecord = (schema: z.ZodTypeAny): schema is z.ZodRecord => {
  return "valueSchema" in schema;
};
