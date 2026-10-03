import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/product.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// ============================================================
// CONFIG
// ============================================================

const TARGET_COUNT = Number(process.env.SEED_COUNT || 1000);

const BATCH_SIZE = 1000;

// ============================================================
// ORIGINAL MAREN PRODUCTS
// ============================================================

const products = [
  {
    name: "Structured Wool Blazer",
    description:
      "A masterclass in tailoring. This double-breasted blazer is crafted from premium Italian wool with strong shoulders and a nipped-in waist.",
    price: 48500,
    images: [
      "https://images.unsplash.com/photo-1612731486606-2614b4d74921?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Outerwear",
    stock: 25,
    brand: "MAREN",
  },
  {
    name: "Silk Midi Dress",
    description:
      "Fluid silk satin drapes beautifully in this minimalist bias-cut midi dress. Features a delicate cowl neck and adjustable barely-there straps.",
    price: 32000,
    images: [
      "https://images.unsplash.com/photo-1664076458686-3449062080ac?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Dresses",
    stock: 15,
    brand: "MAREN",
  },
  {
    name: "Tailored Linen Suit",
    description:
      "Breezy yet impeccably structured. The perfect two-piece linen ensemble for transitioning between seasons.",
    price: 69500,
    images: [
      "https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Sets",
    stock: 12,
    brand: "MAREN",
  },
  {
    name: "Pleated Wide-Leg Trouser",
    description:
      "Voluminous wide-leg trousers cut from heavy crepe. Featuring sharp front pleats and a high-rise waist for an elongating effect.",
    price: 26500,
    images: [
      "https://images.unsplash.com/photo-1580478491436-fd6a937acc9e?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Bottoms",
    stock: 30,
    brand: "MAREN",
  },
  {
    name: "Cashmere Turtleneck",
    description:
      "An essential layering piece. Spun from 100% pure cashmere for unparalleled softness and warmth.",
    price: 21000,
    images: [
      "https://images.unsplash.com/photo-1588117260148-b47818741c74?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Tops",
    stock: 45,
    brand: "MAREN",
  },
  {
    name: "Oversized Trench Coat",
    description:
      "A modern reimagining of the classic trench. Features dramatic proportions, storm flaps, and a D-ring belt.",
    price: 54000,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Outerwear",
    stock: 20,
    brand: "MAREN",
  },
  {
    name: "Asymmetric Hem Dress",
    description:
      "Architectural design meets fluid movement. This dress features a striking asymmetric hemline and subtle side cutouts.",
    price: 41000,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Dresses",
    stock: 18,
    brand: "MAREN",
  },
  {
    name: "Leather Chelsea Boots",
    description:
      "Sleek and versatile. Crafted from smooth calf leather with elasticated side panels and a chunky stacked sole.",
    price: 38500,
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Footwear",
    stock: 22,
    brand: "MAREN",
  },
  {
    name: "Sculptural Crossbody Bag",
    description:
      "A statement piece that doubles as art. Constructed from rigid leather with polished gold-tone hardware.",
    price: 45000,
    images: [
      "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Accessories",
    stock: 14,
    brand: "MAREN",
  },
  {
    name: "Minimalist Gold Hoops",
    description:
      "The everyday essential. Solid 14k gold hoops with a secure latch back closure.",
    price: 18500,
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Accessories",
    stock: 50,
    brand: "MAREN",
  },
  {
    name: "Ribbed Knit Sweater",
    description:
      "Chunky yet refined. This dropped-shoulder sweater features a textured ribbed knit and mock neckline.",
    price: 19000,
    images: [
      "https://images.unsplash.com/photo-1614252235316-8465d648b251?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Tops",
    stock: 35,
    brand: "MAREN",
  },
  {
    name: "Satin Slip Skirt",
    description:
      "Lustrous and lightweight. Cut on the bias to gently skim the body, finishing at a flattering midi length.",
    price: 16500,
    images: [
      "https://images.unsplash.com/photo-1583391733958-d15ce11516f4?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Bottoms",
    stock: 28,
    brand: "MAREN",
  },
  {
    name: "Double-Breasted Wool Coat",
    description:
      "Command attention in this sweeping floor-length wool coat. Features sharp peak lapels and a structured silhouette.",
    price: 89000,
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Outerwear",
    stock: 10,
    brand: "MAREN",
  },
  {
    name: "Cotton Poplin Shirt",
    description:
      "Crisp and classic. An oversized button-down shirt with a sharp point collar and exaggerated cuffs.",
    price: 14000,
    images: [
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Tops",
    stock: 60,
    brand: "MAREN",
  },
  {
    name: "Leather Moto Jacket",
    description:
      "An iconic staple. Buttery-soft lambskin leather tailored to a cropped, boxy fit with heavy silver hardware.",
    price: 72000,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Outerwear",
    stock: 8,
    brand: "MAREN",
  },
];

// ============================================================
// IMAGE DATA
// ============================================================

const galleryImages = [
  "photo-1529139574466-a303027c1d8b",
  "photo-1483985988355-763728e1935b",
  "photo-1490481651871-ab68de25d43d",
  "photo-1534528741775-53994a69daeb",
  "photo-1525507119028-ed4c629a60a3",
  "photo-1548126032-079a0fb0099d",
  "photo-1485230895905-ec40ba36b9bc",
  "photo-1515886657613-9f3515b0c78f",
  "photo-1539109136881-3be0616acf4b",
  "photo-1595777457583-95e059d581b8",
  "photo-1581044777550-4cfa60707c03",
  "photo-1618932260643-f66d4ffce56a",
  "photo-1551028719-00167b16eac5",
  "photo-1584916201218-f4242ceb4809",
  "photo-1535632066927-ab7c9ab60908",
  "photo-1608256246200-53e635b5b65f",
  "photo-1598554747436-c9293d6a588f",
  "photo-1614252235316-8465d648b251",
  "photo-1583391733958-d15ce11516f4",
  "photo-1612731486606-2614b4d74921",
];

const imageUrl = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=85&w=1000`;

const createGallery = (coverImage, index) => [
  ...new Set([
    coverImage,
    ...galleryImages
      .slice(index)
      .concat(galleryImages.slice(0, index))
      .map(imageUrl),
  ]),
].slice(0, 3);

// ============================================================
// PRODUCT GENERATION
// ============================================================

const tones = [
  "Midnight",
  "Ivory",
  "Sienna",
  "Olive",
  "Cobalt",
  "Rose",
  "Stone",
  "Aubergine",
  "Sage",
  "Oat",
];

const designs = [
  { name: "Tailored Blazer", category: "Outerwear", price: 38500 },
  { name: "Relaxed Trench", category: "Outerwear", price: 46500 },
  { name: "Sculpted Coat", category: "Outerwear", price: 52000 },
  { name: "Column Dress", category: "Dresses", price: 28500 },
  { name: "Draped Midi Dress", category: "Dresses", price: 32000 },
  { name: "Evening Slip Dress", category: "Dresses", price: 34500 },
  { name: "Wide-Leg Trouser", category: "Bottoms", price: 22000 },
  { name: "Pleated Skirt", category: "Bottoms", price: 18500 },
  { name: "Cashmere Knit", category: "Tops", price: 24500 },
  { name: "Poplin Shirt", category: "Tops", price: 14500 },
  { name: "Linen Co-ord", category: "Sets", price: 39500 },
  { name: "Leather Shoulder Bag", category: "Accessories", price: 28000 },
  { name: "Minimal Hoop Earrings", category: "Accessories", price: 9500 },
  { name: "Leather Ankle Boot", category: "Footwear", price: 32500 },
  { name: "Everyday Loafer", category: "Footwear", price: 29500 },
];

const brands = [
  "MAREN",
  "MAREN STUDIO",
  "MAREN EDIT",
  "MAREN ATELIER",
];

const createSyntheticProduct = (index) => {
  const tone = tones[index % tones.length];

  const design =
    designs[Math.floor(index / tones.length) % designs.length];

  const brand = brands[index % brands.length];

  const photoIndex = index % galleryImages.length;

  // Deterministic variation rather than Math.random().
  // This makes benchmark datasets reproducible.
  const priceVariation = (index % 21) * 250;

  const stock = 5 + ((index * 17) % 96);

  return {
    name: `MAREN ${tone} ${design.name} ${index + 1}`,

    description:
      `A refined ${design.name.toLowerCase()} from the ${brand} collection in ${tone.toLowerCase()}. Designed with considered detailing, a contemporary silhouette, and versatile everyday wearability.`,

    price: design.price + priceVariation,

    images: createGallery(
      imageUrl(galleryImages[photoIndex]),
      (photoIndex + 1) % galleryImages.length
    ),

    category: design.category,

    stock,

    brand,

    // Important for index/pagination experiments.
    // Gives the dataset a spread of creation dates.
    createdAt: new Date(
      Date.now() - index * 60 * 60 * 1000
    ),

    updatedAt: new Date(
      Date.now() - index * 30 * 60 * 1000
    ),
  };
};

// ============================================================
// SEED DATABASE
// ============================================================

const seedDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error(
        "MONGODB_URI or MONGO_URI must be set before seeding."
      );
    }

    if (TARGET_COUNT < products.length) {
      throw new Error(
        `SEED_COUNT must be at least ${products.length}.`
      );
    }

    await mongoose.connect(MONGODB_URI);

    console.log("\nConnected to MongoDB Atlas");
    console.log(`Target product count: ${TARGET_COUNT}`);

    // --------------------------------------------------------
    // 1. Insert/update original MAREN products
    // --------------------------------------------------------

    await Promise.all(
      products.map(async (product, index) => {
        const { images, ...productFields } = product;

        await Product.updateOne(
          { name: product.name },
          {
            $set: {
              images: createGallery(images[0], index),
            },
            $setOnInsert: productFields,
          },
          { upsert: true }
        );
      })
    );

    console.log(`Base catalog ready: ${products.length} products`);

    // --------------------------------------------------------
    // 2. Check existing product count
    // --------------------------------------------------------

    let currentCount = await Product.countDocuments();

    console.log(`Existing products: ${currentCount}`);

    if (currentCount >= TARGET_COUNT) {
      console.log(
        `Target already reached. No synthetic products needed.`
      );

      console.log(
        `\nCatalog ready: ${currentCount} products`
      );

      return;
    }

    // --------------------------------------------------------
    // 3. Generate synthetic products
    // --------------------------------------------------------

    const required = TARGET_COUNT - currentCount;

    console.log(
      `Generating ${required} synthetic products...`
    );

    const existingNames = new Set(
      (
        await Product.find(
          {},
          { name: 1, _id: 0 }
        ).lean()
      ).map(({ name }) => name)
    );

    const batch = [];

    let generated = 0;

    let index = 0;

    while (generated < required) {
      const product = createSyntheticProduct(
        currentCount + index
      );

      index++;

      if (existingNames.has(product.name)) {
        continue;
      }

      batch.push(product);
      existingNames.add(product.name);
      generated++;

      if (batch.length === BATCH_SIZE) {
        await Product.insertMany(batch);

        currentCount += batch.length;

        console.log(
          `Inserted ${currentCount}/${TARGET_COUNT} products`
        );

        batch.length = 0;
      }
    }

    // Insert remaining products
    if (batch.length > 0) {
      await Product.insertMany(batch);

      currentCount += batch.length;

      console.log(
        `Inserted ${currentCount}/${TARGET_COUNT} products`
      );
    }

    // --------------------------------------------------------
    // 4. Verify
    // --------------------------------------------------------

    const finalCount = await Product.countDocuments();

    console.log("\n=================================");
    console.log("SEED COMPLETE");
    console.log("=================================");
    console.log(`Products in database: ${finalCount}`);
    console.log(`Target: ${TARGET_COUNT}`);
    console.log("=================================\n");

  } catch (error) {
    console.error("\nError seeding database:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDB();