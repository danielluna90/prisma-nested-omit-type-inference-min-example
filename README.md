# Prisma Nested Omit Type Inference

See [prisma/prisma#24835](https://github.com/prisma/prisma/issues/24835) for full issue. The description is included below.

When using the omit type with an include the inferred type is as intended. However, when using an omit and include inside of an include (nested), the type inferred is not correct. The output of the function is correct and the fields are correctly omitted.

Here is a minimal example:

```prisma
model A {
  id Int @id @default(autoincrement())

  model_b B[]
}

model B {
  id Int @id @default(autoincrement())

  a_id Int
  a    A   @relation(fields: [a_id], references: [id])

  private_field String

  c_id Int
  c    C   @relation(fields: [c_id], references: [id])
}

model C {
  id Int @id @default(autoincrement())

  public_field String
  B            B[]
}
```

Example 4 in my minimal example repository shows that a top-level omit + include is correctly inferred whilst a second-level (nested) omit + include is not correctly inferred. Here is the code used.

```ts
const example_four = await prisma.a.findFirst({
  include: {
    model_b: {
      include: {
        c: true,
      },
      omit: {
        private_field: true,
      },
    },
  },
  omit: { id: true },
});
```

The inferred type is as follows:

```ts
({
  model_b: ({
    c: {
      id: number;
      public_field: string;
    };
  } & {
    id: number;
    a_id: number;
    private_field: string;
    c_id: number;
  })[];
} & {}) | null
```

Notice that `A.id` is omitted in the type but `A.model_b.private_field` is not.

Example 5 is similar to the original case which resulted in me noticing this behavior. It is very similar to example 4. In Example 4 I omit a non-relationship field. In this example I omit the relation field `c_id`. Like in example 4, the type is wrong but the output is correct.
