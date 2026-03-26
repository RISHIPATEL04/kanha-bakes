const { products } = require('./queries');

const initialProducts = [
    {
        name: "Signature Chocolate Cake",
        description: "Dark brown layers with golden frosting, a Khana classic.",
        price: 35.00,
        category: "Cakes",
        image: "images/chocolate-cake.jpg"
    },
    {
        name: "Classic Vanilla Cake",
        description: "Light beige layers with white frosting, perfect for any occasion.",
        price: 28.00,
        category: "Cakes"
    },
    {
        name: "Zesty Lemon Cake",
        description: "Yellow layers with green decorations and a fresh citrus burst.",
        price: 30.00,
        category: "Cakes"
    },
    {
        name: "Red Velvet Bliss",
        description: "Red layers with rich cream cheese frosting.",
        price: 32.00,
        category: "Cakes"
    },
    {
        name: "Assorted Artisanal Chocolates",
        description: "A luxury box of handcrafted fine chocolates.",
        price: 24.00,
        category: "Chocolates"
    },
    {
        name: "Fresh Croissants",
        description: "A box of 4 buttery, flaky croissants.",
        price: 12.00,
        category: "Pastries"
    }
];

async function seed() {
    console.log("Starting to seed Firestore with initial menu items...");
    for (const prod of initialProducts) {
        try {
            const added = await products.create(prod);
            console.log(`✅ Added: ${added.name} (ID: ${added.id})`);
        } catch (e) {
            console.error(`❌ Failed to add ${prod.name}:`, e.message);
        }
    }
    console.log("Seeding complete. You can exit now.");
    process.exit(0);
}

seed();
