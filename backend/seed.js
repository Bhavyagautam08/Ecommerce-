import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/product.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

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

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    await Product.deleteMany({});
    console.log("Cleared existing products.");

    const inserted = await Product.insertMany(products);
    console.log(`Successfully seeded ${inserted.length} products!`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
