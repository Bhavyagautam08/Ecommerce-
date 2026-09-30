import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/product.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

const products = [
  {
    name: "Structured Wool Blazer",
    description: "A masterclass in tailoring. This double-breasted blazer is crafted from premium Italian wool with strong shoulders and a nipped-in waist.",
    price: 48500,
    images: ["https://images.unsplash.com/photo-1612731486606-2614b4d74921?auto=format&fit=crop&q=80&w=600"],
    category: "Outerwear",
    stock: 25,
    brand: "MAREN"
  },
  {
    name: "Silk Midi Dress",
    description: "Fluid silk satin drapes beautifully in this minimalist bias-cut midi dress. Features a delicate cowl neck and adjustable barely-there straps.",
    price: 32000,
    images: ["https://images.unsplash.com/photo-1664076458686-3449062080ac?auto=format&fit=crop&q=80&w=600"],
    category: "Dresses",
    stock: 15,
    brand: "MAREN"
  },
  {
    name: "Tailored Linen Suit",
    description: "Breezy yet impeccably structured. The perfect two-piece linen ensemble for transitioning between seasons.",
    price: 69500,
    images: ["https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?auto=format&fit=crop&q=80&w=600"],
    category: "Sets",
    stock: 12,
    brand: "MAREN"
  },
  {
    name: "Pleated Wide-Leg Trouser",
    description: "Voluminous wide-leg trousers cut from heavy crepe. Featuring sharp front pleats and a high-rise waist for an elongating effect.",
    price: 26500,
    images: ["https://images.unsplash.com/photo-1580478491436-fd6a937acc9e?auto=format&fit=crop&q=80&w=600"],
    category: "Bottoms",
    stock: 30,
    brand: "MAREN"
  },
  {
    name: "Cashmere Turtleneck",
    description: "An essential layering piece. Spun from 100% pure cashmere for unparalleled softness and warmth.",
    price: 21000,
    images: ["https://images.unsplash.com/photo-1588117260148-b47818741c74?auto=format&fit=crop&q=80&w=600"],
    category: "Tops",
    stock: 45,
    brand: "MAREN"
  },
  {
    name: "Oversized Trench Coat",
    description: "A modern reimagining of the classic trench. Features dramatic proportions, storm flaps, and a D-ring belt.",
    price: 54000,
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"],
    category: "Outerwear",
    stock: 20,
    brand: "MAREN"
  },
  {
    name: "Asymmetric Hem Dress",
    description: "Architectural design meets fluid movement. This dress features a striking asymmetric hemline and subtle side cutouts.",
    price: 41000,
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600"],
    category: "Dresses",
    stock: 18,
    brand: "MAREN"
  },
  {
    name: "Leather Chelsea Boots",
    description: "Sleek and versatile. Crafted from smooth calf leather with elasticated side panels and a chunky stacked sole.",
    price: 38500,
    images: ["https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600"],
    category: "Footwear",
    stock: 22,
    brand: "MAREN"
  },
  {
    name: "Sculptural Crossbody Bag",
    description: "A statement piece that doubles as art. Constructed from rigid leather with polished gold-tone hardware.",
    price: 45000,
    images: ["https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=600"],
    category: "Accessories",
    stock: 14,
    brand: "MAREN"
  },
  {
    name: "Minimalist Gold Hoops",
    description: "The everyday essential. Solid 14k gold hoops with a secure latch back closure.",
    price: 18500,
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600"],
    category: "Accessories",
    stock: 50,
    brand: "MAREN"
  },
  {
    name: "Ribbed Knit Sweater",
    description: "Chunky yet refined. This dropped-shoulder sweater features a textured ribbed knit and mock neckline.",
    price: 19000,
    images: ["https://images.unsplash.com/photo-1614252235316-8465d648b251?auto=format&fit=crop&q=80&w=600"],
    category: "Tops",
    stock: 35,
    brand: "MAREN"
  },
  {
    name: "Satin Slip Skirt",
    description: "Lustrous and lightweight. Cut on the bias to gently skim the body, finishing at a flattering midi length.",
    price: 16500,
    images: ["https://images.unsplash.com/photo-1583391733958-d15ce11516f4?auto=format&fit=crop&q=80&w=600"],
    category: "Bottoms",
    stock: 28,
    brand: "MAREN"
  },
  {
    name: "Double-Breasted Wool Coat",
    description: "Command attention in this sweeping floor-length wool coat. Features sharp peak lapels and a structured silhouette.",
    price: 89000,
    images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600"],
    category: "Outerwear",
    stock: 10,
    brand: "MAREN"
  },
  {
    name: "Cotton Poplin Shirt",
    description: "Crisp and classic. An oversized button-down shirt with a sharp point collar and exaggerated cuffs.",
    price: 14000,
    images: ["https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=600"],
    category: "Tops",
    stock: 60,
    brand: "MAREN"
  },
  {
    name: "Leather Moto Jacket",
    description: "An iconic staple. Buttery-soft lambskin leather tailored to a cropped, boxy fit with heavy silver hardware.",
    price: 72000,
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600"],
    category: "Outerwear",
    stock: 8,
    brand: "MAREN"
  }
];

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

const createSupplementalProducts = () => {
  const tones = [
    "Midnight", "Ivory", "Sienna", "Olive", "Cobalt",
    "Rose", "Stone", "Aubergine", "Sage", "Oat",
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

  return tones.flatMap((tone, toneIndex) =>
    designs.map((design, designIndex) => {
      const photoIndex = (toneIndex * designs.length + designIndex) % galleryImages.length;
      return {
        name: `MAREN ${tone} ${design.name}`,
        description: `A considered MAREN essential in ${tone.toLowerCase()}. Designed with a refined silhouette, thoughtful detailing, and an easy fit for everyday wear.`,
        price: design.price + toneIndex * 500,
        images: createGallery(imageUrl(galleryImages[photoIndex]), photoIndex + 1),
        category: design.category,
        stock: 12 + ((toneIndex * 7 + designIndex * 3) % 39),
        brand: "MAREN",
      };
    })
  );
};

const seedDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGO_URI must be set before seeding the product catalog.");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    await Promise.all(products.map(async (product, index) => {
      const { images, ...productFields } = product;
      await Product.updateOne(
        { name: product.name },
        {
          $set: { images: createGallery(images[0], index) },
          $setOnInsert: productFields,
        },
        { upsert: true }
      );
    }));

    const existingNames = new Set(
      (await Product.find({}, { name: 1, _id: 0 }).lean()).map(({ name }) => name)
    );
    const currentCount = await Product.countDocuments();
    const missingCount = Math.max(0, 100 - currentCount);
    const additions = createSupplementalProducts()
      .filter((product) => !existingNames.has(product.name))
      .slice(0, missingCount);

    if (additions.length < missingCount) {
      throw new Error(`Could only prepare ${additions.length} of ${missingCount} missing products.`);
    }

    if (additions.length) {
      await Product.insertMany(additions);
    }

    const finalCount = await Product.countDocuments();
    if (finalCount < 100) {
      throw new Error(`Catalog seeding finished with ${finalCount} products; expected at least 100.`);
    }

    console.log(`Catalog ready: ${finalCount} products, including multi-image galleries.`);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDB();
