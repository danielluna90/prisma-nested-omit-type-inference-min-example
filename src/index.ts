import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

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

  const example_two = await prisma.a.findFirst({
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
  });

  // No Type Error
  example_two?.model_b[0].private_field;

  console.log("Example Two");
  console.log(example_two);
  console.log(
    "example_two->model_b->private_field:",
    example_two?.model_b[0].private_field
  ); // Returns undefined
  console.log("===================================================");

  const example_three = await prisma.a.findFirst({
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
  });

  // No Type Error
  example_two?.model_b[0].c_id;

  console.log("Example Three");
  console.log(example_three);
  console.log("example_three->model_b->c_id:", example_three?.model_b[0].c_id); // Returns undefined
  console.log("===================================================");
}

main();
