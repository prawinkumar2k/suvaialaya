import mongoose from "mongoose";
import { SystemSettings } from "./server/models/SystemSettings.ts";
import { Page } from "./server/models/Page.ts";
import { GalleryImage } from "./server/models/GalleryImage.ts";
import { AboutFeature } from "./server/models/AboutFeature.ts";
import { LandingStat } from "./server/models/LandingStat.ts";
import { LandingSpecial } from "./server/models/LandingSpecial.ts";

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/suvaialaya");
  
  const settings = await SystemSettings.findOne();
  if (settings) {
    // Pages
    await Page.deleteMany({});
    await Page.create([
      { slug: "landing", heroEyebrow: settings.landing?.heroEyebrow, heroTitle: settings.landing?.heroTitle, heroDescription: settings.landing?.heroDescription },
      { slug: "menu", heroEyebrow: settings.menuPage?.heroEyebrow, heroTitle: settings.menuPage?.heroTitle, heroDescription: settings.menuPage?.heroDescription },
      { slug: "gallery", heroEyebrow: settings.galleryPage?.heroEyebrow, heroTitle: settings.galleryPage?.heroTitle, heroDescription: settings.galleryPage?.heroDescription },
      { slug: "about", heroEyebrow: settings.aboutPage?.heroEyebrow, heroTitle: settings.aboutPage?.heroTitle, heroDescription1: settings.aboutPage?.heroDescription1, heroDescription2: settings.aboutPage?.heroDescription2 }
    ]);

    // Sub-collections
    if (settings.galleryPage?.images?.length > 0) {
      await GalleryImage.deleteMany({});
      await GalleryImage.insertMany(settings.galleryPage.images.map((img: any, i: number) => {
        const copy = img.toObject ? img.toObject() : img;
        delete copy._id;
        return { ...copy, order: i };
      }));
    }
    
    if (settings.aboutPage?.features?.length > 0) {
      await AboutFeature.deleteMany({});
      await AboutFeature.insertMany(settings.aboutPage.features.map((f: any, i: number) => {
        const copy = f.toObject ? f.toObject() : f;
        delete copy._id;
        return { ...copy, order: i };
      }));
    }
    
    if (settings.landing?.stats?.length > 0) {
      await LandingStat.deleteMany({});
      await LandingStat.insertMany(settings.landing.stats.map((s: any, i: number) => {
        const copy = s.toObject ? s.toObject() : s;
        delete copy._id;
        return { ...copy, order: i };
      }));
    }
    
    if (settings.landing?.specials?.length > 0) {
      await LandingSpecial.deleteMany({});
      await LandingSpecial.insertMany(settings.landing.specials.map((s: any, i: number) => {
        const copy = s.toObject ? s.toObject() : s;
        delete copy._id;
        return { ...copy, order: i };
      }));
    }
    
    console.log("Migration complete!");
  }
  process.exit(0);
}
run();
