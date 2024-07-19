import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

// Example One: Working example, types are correctly inferred.
async function example_one_func() {
  const example_one = await prisma.a.findFirst({
    include: {
      model_b: {
        omit: {
          private_field: true,
        },
      },
    },
  });

  // Property 'private_field' does not exist on type '{ id: number; a_id: number; c_id: number; }'. ts(2339)
  // example_one?.model_b[0].private_field

  console.log("Example One");
  console.log(example_one);
  console.log("===================================================");
}

// Example Two: Working example, include + omit work together.
async function example_two_func() {
  const example_two = await prisma.a.findFirst({
    include: {
      model_b: true,
    },
    omit: {
      id: true,
    },
  });

  // Property 'id' does not exist on type '{ model_b: { id: number; a_id: number; private_field: string; c_id: number; }[]; } & {}'. ts(2339)
  // example_two?.id

  console.log("Example Two");
  console.log(example_two);
  console.log("===================================================");
}

// Example Three: Working Example, nested omits work together.
async function example_three_func() {
  const example_three = await prisma.a.findFirst({
    include: {
      model_b: {
        omit: {
          private_field: true,
        },
      },
    },
    omit: {
      id: true,
    },
  });

  // Property 'id' does not exist on type '{ model_b: { id: number; a_id: number; c_id: number; }[]; } & {}'. ts(2339)
  // example_three_three?.id

  // Property 'private_field' does not exist on type '{ id: number; a_id: number; c_id: number; }'. ts(2339)
  // example_three?.model_b[0].private_field

  console.log("Example Three");
  console.log(example_three);
  console.log("===================================================");
}

// Example 4: Non-Working Example, nested include + omit results in incorrect type being inferred,
//            but, is working correctly as omitted field is not in returned object. However, notice
//            that top-level omit does work as intended.
async function example_four_func() {
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

  // Property 'id' does not exist on type '{ model_b: ({ c: { id: number; public_field: string; }; } & { id: number; a_id: number; private_field: string; c_id: number; })[]; } & {}'. ts(2339)
  // example_four?.id;

  // No Type Error
  example_four?.model_b[0].private_field;

  console.log("Example Four");
  console.log(example_four);
  console.log(
    "example_four->model_b->private_field:",
    example_four?.model_b[0].private_field
  ); // Returns undefined
  console.log("===================================================");
}

// Example 5: Non-Working Example, this omits a relation id field instead of a regular field,
//            nested include + omit results in incorrect type being inferred,
//            but, is working correctly as omitted field is not in returned object. Same as above,
//            notice that top level omit works as intended.
async function example_five_func() {
  // Example 5
  const example_five = await prisma.a.findFirst({
    include: {
      model_b: {
        include: {
          c: true,
        },
        omit: {
          c_id: true,
        },
      },
    },
    omit: { id: true },
  });

  // Property 'id' does not exist on type '{ model_b: ({ c: { id: number; public_field: string; }; } & { id: number; a_id: number; private_field: string; c_id: number; })[]; } & {}'. ts(2339)
  // example_five?.id;

  // No Type Error
  example_five?.model_b[0].c_id;

  console.log("Example Five");
  console.log(example_five);
  console.log("example_five->model_b->c_id:", example_five?.model_b[0].c_id); // Returns undefined
  console.log("===================================================");
}

async function main() {
  // This creates an object in the database for demonstration purposes
  const a_obj = await prisma.a.create({
    data: {
      model_b: {
        create: {
          private_field: "super_secret_password",
          c: {
            create: {
              public_field: "hello",
            },
          },
        },
      },
    },
    include: {
      model_b: {
        include: {
          c: true,
        },
      },
    },
  });

  console.log("Object A has been created. Here is the full output.");
  console.log(a_obj);
  console.log("===================================================");

  // From here onwards is the minimal example
  // Working Examples
  await example_one_func();
  await example_two_func();
  await example_three_func();

  // Non-Working Examples
  await example_four_func();
  await example_five_func();
}

main();
