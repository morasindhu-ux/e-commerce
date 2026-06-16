require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const sampleProducts = [
  // ==========================================
  // Electronics & Tech
  // ==========================================
  {
    sku: "SKU-IPH15",
    title: "iPhone 15 Pro Max (256GB, Titanium)",
    description: "Experience the power of titanium, the advanced A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
    category: "Electronics & Tech",
    price: 1199.99,
    stockQuantity: 50,
    averageRating: 4.8,
    numReviews: 142,
    reviews: [
      { name: "Sarah K.", rating: 5, comment: "Absolutely love the titanium feel and battery life!" },
      { name: "John D.", rating: 4, comment: "Great camera, but gets a bit warm during intensive gaming." }
    ]
  },
  {
    sku: "SKU-APODP",
    title: "Apple AirPods Pro (2nd Generation)",
    description: "AirPods Pro feature up to 2x more Active Noise Cancellation, plus Adaptive Audio and Personalized Spatial Audio for a premium listening experience.",
    category: "Electronics & Tech",
    price: 249.00,
    stockQuantity: 120,
    averageRating: 4.7,
    numReviews: 98,
    reviews: [
      { name: "David M.", rating: 5, comment: "The noise cancellation is magic on flights." }
    ]
  },
  {
    sku: "SKU-MBP14",
    title: "MacBook Pro 14-inch M3 Pro",
    description: "Built for creatives and developers, the M3 Pro chip delivers extreme CPU and GPU performance, stunning Liquid Retina XDR screen, and 18 hours of battery.",
    category: "Electronics & Tech",
    price: 1999.00,
    stockQuantity: 25,
    averageRating: 4.9,
    numReviews: 43,
    reviews: [
      { name: "Emily W.", rating: 5, comment: "The best screen on any laptop. Worth every penny." }
    ]
  },
  {
    sku: "SKU-S24U",
    title: "Samsung Galaxy S24 Ultra (512GB)",
    description: "Unleash new levels of creativity and productivity with Galaxy AI, 200MP camera system, built-in S Pen, and Snapdragon 8 Gen 3 for Galaxy.",
    category: "Electronics & Tech",
    price: 1299.99,
    stockQuantity: 40,
    averageRating: 4.7,
    numReviews: 85,
    reviews: [
      { name: "Michael T.", rating: 5, comment: "The anti-reflective screen is a game changer." }
    ]
  },
  {
    sku: "SKU-WH1000",
    title: "Sony WH-1000XM5 Wireless Headphones",
    description: "Industry-leading noise canceling overhead headphones with Auto NC Optimizer, crystal clear hands-free calling, and 30-hour battery life.",
    category: "Electronics & Tech",
    price: 398.00,
    stockQuantity: 75,
    averageRating: 4.6,
    numReviews: 122,
    reviews: [
      { name: "Chris P.", rating: 4, comment: "Very comfortable, noise cancelling is top tier." }
    ]
  },
  {
    sku: "SKU-XPS15",
    title: "Dell XPS 15 9530 Laptop",
    description: "Stunning 15.6-inch OLED touch display powered by Intel Core i7, 32GB RAM, 1TB SSD, and NVIDIA GeForce RTX 4060 graphics.",
    category: "Electronics & Tech",
    price: 1749.99,
    stockQuantity: 15,
    averageRating: 4.5,
    numReviews: 29,
    reviews: [
      { name: "Kevin L.", rating: 4, comment: "Exceptional build quality and display. Runs warm under heavy load." }
    ]
  },
  {
    sku: "SKU-NSOLED",
    title: "Nintendo Switch OLED Model",
    description: "Play at home on the TV or on-the-go with a vibrant 7-inch OLED screen, wide adjustable stand, wired LAN port, and 64GB of internal storage.",
    category: "Electronics & Tech",
    price: 349.99,
    stockQuantity: 60,
    averageRating: 4.8,
    numReviews: 215,
    reviews: [
      { name: "Jessica R.", rating: 5, comment: "Metroid Dread looks incredible on this OLED screen." }
    ]
  },
  {
    sku: "SKU-AWS9",
    title: "Apple Watch Series 9 GPS 45mm",
    description: "S9 chip enables a super-bright display and a magical new way to quickly and easily interact with your watch without touching the screen.",
    category: "Electronics & Tech",
    price: 429.00,
    stockQuantity: 90,
    averageRating: 4.6,
    numReviews: 76,
    reviews: [
      { name: "Danielle F.", rating: 5, comment: "Double tap gesture works reliably, helpful when holding groceries." }
    ]
  },
  {
    sku: "SKU-GP12",
    title: "GoPro HERO12 Black Action Camera",
    description: "Incredible image quality, even better HyperSmooth video stabilization and a huge boost in battery runtime come together in the world's most versatile camera.",
    category: "Electronics & Tech",
    price: 399.99,
    stockQuantity: 35,
    averageRating: 4.4,
    numReviews: 48,
    reviews: [
      { name: "Tyler J.", rating: 4, comment: "Stabilization is unmatched. HDR video looks gorgeous." }
    ]
  },
  {
    sku: "SKU-KPW16",
    title: "Kindle Paperwhite (16 GB, Black)",
    description: "Now with a 6.8-inch display and thinner borders, adjustable warm light, up to 10 weeks of battery life, and 20% faster page turns.",
    category: "Electronics & Tech",
    price: 149.99,
    stockQuantity: 110,
    averageRating: 4.8,
    numReviews: 310,
    reviews: [
      { name: "Alice H.", rating: 5, comment: "The warm light is so gentle on my eyes before sleeping." }
    ]
  },

  // ==========================================
  // Fashion & Apparel
  // ==========================================
  {
    sku: "SKU-NKEAF1",
    title: "Nike Air Force 1 '07 (White/Crisp)",
    description: "The radiance lives on in the Nike Air Force 1 '07, the basketball original that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash.",
    category: "Fashion & Apparel",
    price: 115.00,
    stockQuantity: 80,
    averageRating: 4.5,
    numReviews: 73,
    reviews: [
      { name: "Marcus L.", rating: 4, comment: "Classic design, looks clean, but takes a few days to break in." }
    ]
  },
  {
    sku: "SKU-PATJD",
    title: "Patagonia Down Sweater Jacket",
    description: "The perfect warmth for just about everything, our classic Down Sweater Hoody is lightweight and windproof with a shell made of NetPlus 100% recycled nylon ripstop.",
    category: "Fashion & Apparel",
    price: 279.00,
    stockQuantity: 45,
    averageRating: 4.6,
    numReviews: 39,
    reviews: [
      { name: "Elena R.", rating: 5, comment: "Super warm and packs down into its own pocket. Highly recommend!" }
    ]
  },
  {
    sku: "SKU-LVS501",
    title: "Levi's 501 Original Fit Jeans",
    description: "The original blue jean since 1873. Features a straight fit through the hip and thigh with a signature button fly, crafted from premium non-stretch denim.",
    category: "Fashion & Apparel",
    price: 79.50,
    stockQuantity: 150,
    averageRating: 4.4,
    numReviews: 198,
    reviews: [
      { name: "Brian C.", rating: 4, comment: "Timeless style, extremely durable, fits exactly as expected." }
    ]
  },
  {
    sku: "SKU-ADUB",
    title: "Adidas Ultraboost Light Shoes",
    description: "Experience epic energy in the new Ultraboost Light, our lightest Ultraboost ever. The secret lies in the Light BOOST midsole, a new generation of Adidas BOOST.",
    category: "Fashion & Apparel",
    price: 190.00,
    stockQuantity: 100,
    averageRating: 4.7,
    numReviews: 134,
    reviews: [
      { name: "Rachel S.", rating: 5, comment: "Like walking on clouds. Excellent for both running and long shifts." }
    ]
  },
  {
    sku: "SKU-RBWAY",
    title: "Ray-Ban Classic Wayfarer Sunglasses",
    description: "Ray-Ban Original Wayfarer Classics are the most recognizable style in the history of sunglasses. Distinctive shape is combined with the traditional Ray-Ban signature logo.",
    category: "Fashion & Apparel",
    price: 163.00,
    stockQuantity: 60,
    averageRating: 4.6,
    numReviews: 89,
    reviews: [
      { name: "Justin B.", rating: 5, comment: "Iconic look and great polarization." }
    ]
  },
  {
    sku: "SKU-LLALIGN",
    title: "Lululemon Align High-Rise Pant 25\"",
    description: "When feeling nothing is everything. Powered by Nulu fabric, this ultra-buttery soft yoga pant is weightless, sweat-wicking, and features four-way stretch.",
    category: "Fashion & Apparel",
    price: 98.00,
    stockQuantity: 140,
    averageRating: 4.8,
    numReviews: 320,
    reviews: [
      { name: "Megan T.", rating: 5, comment: "Literally the softest leggings I have ever owned. Worth the price!" }
    ]
  },
  {
    sku: "SKU-TNFBP",
    title: "The North Face Borealis Backpack",
    description: "Our classic 28-liter backpack features easy-access pockets, an overhauled suspension system, and key organization panels for commuters and students.",
    category: "Fashion & Apparel",
    price: 99.00,
    stockQuantity: 85,
    averageRating: 4.5,
    numReviews: 112,
    reviews: [
      { name: "Sam G.", rating: 4, comment: "Roomy and supportive padding. Fits my 15-inch laptop nicely." }
    ]
  },
  {
    sku: "SKU-CHHOOD",
    title: "Champion Reverse Weave Hoodie",
    description: "Crafted with our legendary heavyweight fleece that is cut on the cross-grain to resist vertical shrinkage. Features double-needle construction and signature stretch panels.",
    category: "Fashion & Apparel",
    price: 65.00,
    stockQuantity: 110,
    averageRating: 4.6,
    numReviews: 67,
    reviews: [
      { name: "Frank K.", rating: 5, comment: "Heavy, thick, and very cozy. Standard champion quality." }
    ]
  },
  {
    sku: "SKU-BKAZ",
    title: "Birkenstock Arizona Unisex Sandals",
    description: "The iconic two-strap sandal. Featuring adjustable buckled straps and a contoured cork footbed that conforms to the shape of your foot over time.",
    category: "Fashion & Apparel",
    price: 110.00,
    stockQuantity: 95,
    averageRating: 4.5,
    numReviews: 143,
    reviews: [
      { name: "Laura O.", rating: 4, comment: "Takes a couple weeks to break in but becomes the comfiest shoe you have." }
    ]
  },
  {
    sku: "SKU-CHHAT",
    title: "Carhartt Acrylic Watch Hat",
    description: "A go-to cold weather accessory. Knit with warm acrylic yarn in a stretchy rib knit that fits snugly and features the classic Carhartt patch sewn on the cuff.",
    category: "Fashion & Apparel",
    price: 19.99,
    stockQuantity: 300,
    averageRating: 4.7,
    numReviews: 450,
    reviews: [
      { name: "Derek W.", rating: 5, comment: "Super warm, stays on well, and goes with everything." }
    ]
  },

  // ==========================================
  // Hardware & Tools
  // ==========================================
  {
    sku: "SKU-DYSONV8",
    title: "Dyson V8 Cordless Vacuum Cleaner",
    description: "Engineered for homes with pets. The de-tangling Motorbar cleaner head deep cleans carpets and hard floors, converting easily to a handheld vacuum.",
    category: "Hardware & Tools",
    price: 399.99,
    stockQuantity: 30,
    averageRating: 4.4,
    numReviews: 65,
    reviews: [
      { name: "Robert H.", rating: 4, comment: "Suction is excellent, although battery lasts about 30 mins on max." }
    ]
  },
  {
    sku: "SKU-DW20V",
    title: "DEWALT 20V MAX Cordless Drill Kit",
    description: "Compact, lightweight design fits into tight areas. High performance motor delivers 300 unit watts out of power ability completing a wide range of applications.",
    category: "Hardware & Tools",
    price: 99.00,
    stockQuantity: 70,
    averageRating: 4.7,
    numReviews: 156,
    reviews: [
      { name: "Tom B.", rating: 5, comment: "Absolute workhorse. Battery holds charge forever." }
    ]
  },
  {
    sku: "SKU-BS12V",
    title: "Bosch 12V Max FlexiClick 5-in-1 Drill/Driver",
    description: "High-quality compact 12V system with 4 attachment heads: 1/4\" hex, keyless chuck, locking bit holder, and right angle/offset adapters.",
    category: "Hardware & Tools",
    price: 159.00,
    stockQuantity: 40,
    averageRating: 4.6,
    numReviews: 42,
    reviews: [
      { name: "Harry M.", rating: 5, comment: "The offset head has saved me so much frustration inside cabinets." }
    ]
  },
  {
    sku: "SKU-ST65P",
    title: "Stanley 65-Piece Home Hand Tool Kit",
    description: "A curated collection of the most-used hand tools for basic repair and DIY projects, including hammer, screwdrivers, sockets, pliers, tape measure, and level.",
    category: "Hardware & Tools",
    price: 49.99,
    stockQuantity: 120,
    averageRating: 4.3,
    numReviews: 89,
    reviews: [
      { name: "Julie N.", rating: 4, comment: "Perfect starter kit for a new apartment." }
    ]
  },
  {
    sku: "SKU-EH16",
    title: "Estwing 16 oz Curved Claw Hammer",
    description: "Forged in one piece, this solid steel hammer features Estwing's patented shock reduction grip, reducing impact vibration by up to 70%.",
    category: "Hardware & Tools",
    price: 29.50,
    stockQuantity: 95,
    averageRating: 4.9,
    numReviews: 104,
    reviews: [
      { name: "Gary S.", rating: 5, comment: "Indestructible. Perfect balance and comfortable grip." }
    ]
  },
  {
    sku: "SKU-MK18V",
    title: "Makita 18V LXT Circular Saw Kit",
    description: "Makita-built motor delivers 3,700 RPM for faster cutting and ripping through wood, featuring heavy gauge aluminum base and built-in dust blower.",
    category: "Hardware & Tools",
    price: 219.00,
    stockQuantity: 28,
    averageRating: 4.7,
    numReviews: 53,
    reviews: [
      { name: "Sean V.", rating: 5, comment: "Cuts like butter. The brake stops the blade instantly." }
    ]
  },
  {
    sku: "SKU-CRFSET",
    title: "Craftsman 3/8-Inch Drive Socket Set (30-Piece)",
    description: "Contains 12-point sockets, extension bar, universal joint, and a quick-release ratchet handle, packaged in a rugged blow-molded case.",
    category: "Hardware & Tools",
    price: 39.98,
    stockQuantity: 110,
    averageRating: 4.5,
    numReviews: 72,
    reviews: [
      { name: "Diana E.", rating: 4, comment: "Good quality sockets. Ratchet has a nice, smooth click." }
    ]
  },
  {
    sku: "SKU-GL18",
    title: "Gorilla Ladders 18ft Multi-Position Ladder",
    description: "Offers 20 telescoping configurations, including A-frame, extension, staircase, and 90-degree. Rated for 300 lbs heavy-duty load capacity.",
    category: "Hardware & Tools",
    price: 179.00,
    stockQuantity: 22,
    averageRating: 4.8,
    numReviews: 165,
    reviews: [
      { name: "Alan D.", rating: 5, comment: "Extremely sturdy and locks securely in place. Highly recommend." }
    ]
  },
  {
    sku: "SKU-MWFB",
    title: "Milwaukee FASTBACK Folding Utility Knife",
    description: "Press-and-flip one-handed opening. Features quick blade changes, gut hook, wire stripper, and onboard storage for 5 extra utility blades.",
    category: "Hardware & Tools",
    price: 14.99,
    stockQuantity: 250,
    averageRating: 4.8,
    numReviews: 289,
    reviews: [
      { name: "Jim T.", rating: 5, comment: "The best utility knife ever made. The flip mechanism is addictive." }
    ]
  },
  {
    sku: "SKU-RYLB",
    title: "Ryobi ONE+ 18V 100 MPH Cordless Leaf Blower",
    description: "Compact and lightweight sweeper design makes clearing leaves and debris from driveways, decks, and sidewalks quick and effortless.",
    category: "Hardware & Tools",
    price: 89.00,
    stockQuantity: 50,
    averageRating: 4.2,
    numReviews: 95,
    reviews: [
      { name: "Linda G.", rating: 4, comment: "Lightweight and perfect for blowing grass clippings off the patio." }
    ]
  },

  // ==========================================
  // Health & Wellness
  // ==========================================
  {
    sku: "SKU-STANQ",
    title: "Stanley Quencher H2.0 FlowState Tumbler",
    description: "Constructed of recycled stainless steel for sustainable sipping, our 40 oz Quencher H2.0 offers maximum hydration with fewer refills. Commuting, gym, or day trips—you’ll want this tumbler by your side.",
    category: "Health & Wellness",
    price: 45.00,
    stockQuantity: 200,
    averageRating: 4.9,
    numReviews: 312,
    reviews: [
      { name: "Jessica T.", rating: 5, comment: "Keeps ice cold for days and fits perfectly in my cup holder!" }
    ]
  },
  {
    sku: "SKU-FITBITCH6",
    title: "Fitbit Charge 6 Fitness Tracker",
    description: "Give your routine a boost with Fitbit Charge 6, the only fitness tracker with Google tools built-in. Track your workouts, heart rate, sleep metrics, and navigate with Google Maps.",
    category: "Health & Wellness",
    price: 159.95,
    stockQuantity: 90,
    averageRating: 4.3,
    numReviews: 54,
    reviews: [
      { name: "Alex B.", rating: 4, comment: "Heart rate tracking is very responsive, love the Google Maps integration." }
    ]
  },
  {
    sku: "SKU-THMINI",
    title: "Theragun Mini Portable Muscle Massager",
    description: "Compact but powerful, Theragun Mini is the pocket-sized percussion therapy device that gives you deep tissue treatment anywhere, reducing soreness and recovery times.",
    category: "Health & Wellness",
    price: 199.00,
    stockQuantity: 40,
    averageRating: 4.6,
    numReviews: 61,
    reviews: [
      { name: "Gavin E.", rating: 5, comment: "Perfect for taking to the gym. battery lasts a long time." }
    ]
  },
  {
    sku: "SKU-ONWHEY",
    title: "Optimum Nutrition Gold Standard Whey (5 lbs)",
    description: "The world's best-selling whey protein powder. Each serving delivers 24g of high-quality whey isolate, 5.5g of BCAAs, and low carbs for lean muscle support.",
    category: "Health & Wellness",
    price: 79.99,
    stockQuantity: 150,
    averageRating: 4.7,
    numReviews: 410,
    reviews: [
      { name: "Aaron F.", rating: 5, comment: "Double Rich Chocolate tastes great and mixes easily in a shaker." }
    ]
  },
  {
    sku: "SKU-HF32",
    title: "Hydro Flask 32 oz Wide Mouth Bottle",
    description: "TempShield double-wall vacuum insulation keeps cold drinks cold for up to 24 hours, and hot drinks hot for up to 12 hours. Features flex cap strap.",
    category: "Health & Wellness",
    price: 44.95,
    stockQuantity: 180,
    averageRating: 4.8,
    numReviews: 204,
    reviews: [
      { name: "Emma H.", rating: 5, comment: "Sturdy handle, does not leak, and keeps my water cold all day." }
    ]
  },
  {
    sku: "SKU-BF552",
    title: "Bowflex SelectTech 552 Adjustable Dumbbells",
    description: "Replaces 15 pairs of traditional dumbbells. Turn the dial to easily adjust the weight from 5 lbs up to 52.5 lbs in small increments.",
    category: "Health & Wellness",
    price: 429.00,
    stockQuantity: 15,
    averageRating: 4.7,
    numReviews: 128,
    reviews: [
      { name: "Victor S.", rating: 5, comment: "Saves so much space in my home gym. Easy adjustment mechanism." }
    ]
  },
  {
    sku: "SKU-GYOGA",
    title: "Gaiam Essentials Yoga Mat (1/4 Inch)",
    description: "Thick dual-sided textured non-slip yoga mat provides comfort and cushion for knees, elbows, and joints during yoga, pilates, or floor stretches.",
    category: "Health & Wellness",
    price: 24.99,
    stockQuantity: 130,
    averageRating: 4.4,
    numReviews: 92,
    reviews: [
      { name: "Chloe M.", rating: 4, comment: "Provides good cushioning, doesn't slip on hardwood floors." }
    ]
  },
  {
    sku: "SKU-VPCOL",
    title: "Vital Proteins Collagen Peptides (20 oz)",
    description: "Sourced from grass-fed, pasture-raised bovine hide to ensure a high quality and sustainable source of collagen. Supports skin, hair, nails, and joint health.",
    category: "Health & Wellness",
    price: 47.00,
    stockQuantity: 140,
    averageRating: 4.5,
    numReviews: 142,
    reviews: [
      { name: "Tina P.", rating: 4, comment: "Dissolves completely in my morning coffee with zero taste." }
    ]
  },
  {
    sku: "SKU-LIVHYD",
    title: "Liquid I.V. Hydration Multiplier (16 Pack)",
    description: "Great-tasting, non-GMO electrolyte drink mix powered by Cellular Transport Technology (CTT) to deliver hydration to your bloodstream faster than water alone.",
    category: "Health & Wellness",
    price: 24.99,
    stockQuantity: 220,
    averageRating: 4.6,
    numReviews: 185,
    reviews: [
      { name: "Olivia R.", rating: 5, comment: "Lemon Lime is delicious. Perfect for hot summer days or after runs." }
    ]
  },
  {
    sku: "SKU-SONICARE",
    title: "Philips Sonicare ProtectiveClean 5100",
    description: "Improves gum health up to 100% more than a manual toothbrush. Features pressure sensor, 3 brush modes, and brush head replacement alerts.",
    category: "Health & Wellness",
    price: 99.95,
    stockQuantity: 65,
    averageRating: 4.6,
    numReviews: 115,
    reviews: [
      { name: "Jason Y.", rating: 5, comment: "My teeth feel dentist-clean every day. Battery lasts weeks." }
    ]
  }
];
const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding");

    const productImages = {
      "SKU-IPH15": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
      "SKU-APODP": "https://images.unsplash.com/photo-1588449668365-d15e397f6787?auto=format&fit=crop&w=600&q=80",
      "SKU-MBP14": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
      "SKU-S24U": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
      "SKU-WH1000": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      "SKU-XPS15": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
      "SKU-NSOLED": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=600&q=80",
      "SKU-AWS9": "https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=600&q=80",
      "SKU-GP12": "https://images.unsplash.com/photo-1565849906660-6b6038cc960f?auto=format&fit=crop&w=600&q=80",
      "SKU-KPW16": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      "SKU-NKEAF1": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
      "SKU-PATJD": "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=600&q=80",
      "SKU-LVS501": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
      "SKU-ADUB": "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=600&q=80",
      "SKU-RBWAY": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80",
      "SKU-LLALIGN": "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=600&q=80",
      "SKU-TNFBP": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
      "SKU-CHHOOD": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80",
      "SKU-BKAZ": "https://images.unsplash.com/photo-1603487226258-2085ae445d98?auto=format&fit=crop&w=600&q=80",
      "SKU-CHHAT": "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?auto=format&fit=crop&w=600&q=80",
      "SKU-DYSONV8": "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80",
      "SKU-DW20V": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
      "SKU-BS12V": "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80",
      "SKU-ST65P": "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&w=600&q=80",
      "SKU-EH16": "https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?auto=format&fit=crop&w=600&q=80",
      "SKU-MK18V": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80",
      "SKU-CRFSET": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80",
      "SKU-GL18": "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=600&q=80",
      "SKU-MWFB": "https://images.unsplash.com/photo-1608731294827-0cfc737c3552?auto=format&fit=crop&w=600&q=80",
      "SKU-RYLB": "https://images.unsplash.com/photo-1530124560072-aab8772d25d9?auto=format&fit=crop&w=600&q=80",
      "SKU-STANQ": "https://images.unsplash.com/photo-1678854494921-6a2c2069e20a?auto=format&fit=crop&w=600&q=80",
      "SKU-FITBITCH6": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80",
      "SKU-THMINI": "https://images.unsplash.com/photo-1616252988188-1417d67f7fc7?auto=format&fit=crop&w=600&q=80",
      "SKU-ONWHEY": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=600&q=80",
      "SKU-HF32": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
      "SKU-BF552": "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=600&q=80",
      "SKU-GYOGA": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80",
      "SKU-VPCOL": "https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=600&q=80",
      "SKU-LIVHYD": "https://images.unsplash.com/photo-1548839140-29a8894559ad?auto=format&fit=crop&w=600&q=80",
      "SKU-SONICARE": "https://images.unsplash.com/photo-1559591937-e1b0c0ffc27f?auto=format&fit=crop&w=600&q=80"
    };

    const productsWithImages = sampleProducts.map(p => ({
      ...p,
      imageUrl: productImages[p.sku] || ""
    }));

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Seed products
    const seeded = await Product.insertMany(productsWithImages);
    console.log(`Successfully seeded ${seeded.length} products with images!`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedProducts();
