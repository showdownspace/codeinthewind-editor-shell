import { DatabaseReference, child } from "firebase/database";
import { z } from "zod";

const unknownSchema = z.unknown();

export class ZDbRef<T> {
  constructor(public ref: DatabaseReference, public schema: z.ZodTypeAny) {}
  child<K extends T extends object ? keyof T : never>(key: K): ZDbRef<T[K]> {
    const childSchema = isSchemaObject(this.schema)
      ? this.schema._def.shape()[key as string]
      : isSchemaRecord(this.schema)
      ? this.schema._def.valueType
      : unknownSchema;
    return new ZDbRef(child(this.ref, key as string), childSchema);
  }
}
const isSchemaObject = (schema: z.ZodTypeAny): schema is z.AnyZodObject => {
  return "shape" in schema._def;
};
const isSchemaRecord = (schema: z.ZodTypeAny): schema is z.ZodRecord => {
  return "valueType" in schema._def;
};
