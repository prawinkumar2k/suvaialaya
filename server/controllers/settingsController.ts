import { Request, Response } from "express";
import { SystemSettings } from "../models/SystemSettings";
import { Page } from "../models/Page";
import { GalleryImage } from "../models/GalleryImage";
import { AboutFeature } from "../models/AboutFeature";
import { LandingStat } from "../models/LandingStat";
import { LandingSpecial } from "../models/LandingSpecial";

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    const pages = await Page.find();
    const galleryImages = await GalleryImage.find().sort({ order: 1 });
    const aboutFeatures = await AboutFeature.find().sort({ order: 1 });
    const landingStats = await LandingStat.find().sort({ order: 1 });
    const landingSpecials = await LandingSpecial.find().sort({ order: 1 });

    const landingPage = pages.find(p => p.slug === "landing");
    const aboutPage = pages.find(p => p.slug === "about");
    const galleryPage = pages.find(p => p.slug === "gallery");
    const menuPage = pages.find(p => p.slug === "menu");

    const aggregatedSettings = {
      ...settings.toObject(),
      landing: {
        ...settings.landing,
        heroEyebrow: landingPage?.heroEyebrow || settings.landing?.heroEyebrow,
        heroTitle: landingPage?.heroTitle || settings.landing?.heroTitle,
        heroDescription: landingPage?.heroDescription || settings.landing?.heroDescription,
        stats: landingStats.length > 0 ? landingStats : settings.landing?.stats,
        specials: landingSpecials.length > 0 ? landingSpecials : settings.landing?.specials,
      },
      aboutPage: {
        ...settings.aboutPage,
        heroEyebrow: aboutPage?.heroEyebrow || settings.aboutPage?.heroEyebrow,
        heroTitle: aboutPage?.heroTitle || settings.aboutPage?.heroTitle,
        heroDescription1: aboutPage?.heroDescription1 || settings.aboutPage?.heroDescription1,
        heroDescription2: aboutPage?.heroDescription2 || settings.aboutPage?.heroDescription2,
        features: aboutFeatures.length > 0 ? aboutFeatures : settings.aboutPage?.features,
      },
      galleryPage: {
        ...settings.galleryPage,
        heroEyebrow: galleryPage?.heroEyebrow || settings.galleryPage?.heroEyebrow,
        heroTitle: galleryPage?.heroTitle || settings.galleryPage?.heroTitle,
        heroDescription: galleryPage?.heroDescription || settings.galleryPage?.heroDescription,
        images: galleryImages.length > 0 ? galleryImages : settings.galleryPage?.images,
      },
      menuPage: {
        ...settings.menuPage,
        heroEyebrow: menuPage?.heroEyebrow || settings.menuPage?.heroEyebrow,
        heroTitle: menuPage?.heroTitle || settings.menuPage?.heroTitle,
        heroDescription: menuPage?.heroDescription || settings.menuPage?.heroDescription,
      }
    };

    res.json({ success: true, data: aggregatedSettings });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const {
      landing,
      aboutPage,
      galleryPage,
      menuPage,
      festival,
      contactPage,
      faqPage,
      organizersPage,
      welcomeItems,
      returnGifts,
      contactPhone,
      ...rest
    } = req.body;

    // Build a $set object for all nested sections so we do deep-merge, not replacement
    const setPayload: Record<string, any> = { ...rest };

    if (festival) {
      Object.keys(festival).forEach(k => {
        setPayload[`festival.${k}`] = festival[k];
      });
    }
    if (contactPage) {
      Object.keys(contactPage).forEach(k => {
        setPayload[`contactPage.${k}`] = contactPage[k];
      });
    }
    if (faqPage) {
      Object.keys(faqPage).forEach(k => {
        setPayload[`faqPage.${k}`] = faqPage[k];
      });
    }
    if (organizersPage) {
      Object.keys(organizersPage).forEach(k => {
        setPayload[`organizersPage.${k}`] = organizersPage[k];
      });
    }
    if (welcomeItems !== undefined) setPayload["welcomeItems"] = welcomeItems;
    if (returnGifts !== undefined) setPayload["returnGifts"] = returnGifts;
    if (contactPhone !== undefined) setPayload["contactPhone"] = contactPhone;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create(req.body);
    } else {
      settings = await SystemSettings.findOneAndUpdate(
        {},
        { $set: setPayload },
        { new: true, runValidators: true }
      );
    }

    if (landing) {
      await Page.findOneAndUpdate({ slug: "landing" }, {
        slug: "landing",
        heroEyebrow: landing.heroEyebrow,
        heroTitle: landing.heroTitle,
        heroDescription: landing.heroDescription
      }, { upsert: true });

      if (landing.stats) {
        await LandingStat.deleteMany({});
        await LandingStat.insertMany(landing.stats.map((s: any, i: number) => ({ ...s, order: i })));
      }
      if (landing.specials) {
        await LandingSpecial.deleteMany({});
        await LandingSpecial.insertMany(landing.specials.map((s: any, i: number) => ({ ...s, order: i })));
      }
    }

    if (aboutPage) {
      await Page.findOneAndUpdate({ slug: "about" }, {
        slug: "about",
        heroEyebrow: aboutPage.heroEyebrow,
        heroTitle: aboutPage.heroTitle,
        heroDescription1: aboutPage.heroDescription1,
        heroDescription2: aboutPage.heroDescription2
      }, { upsert: true });

      if (aboutPage.features) {
        await AboutFeature.deleteMany({});
        await AboutFeature.insertMany(aboutPage.features.map((f: any, i: number) => ({ ...f, order: i })));
      }
    }

    if (galleryPage) {
      await Page.findOneAndUpdate({ slug: "gallery" }, {
        slug: "gallery",
        heroEyebrow: galleryPage.heroEyebrow,
        heroTitle: galleryPage.heroTitle,
        heroDescription: galleryPage.heroDescription
      }, { upsert: true });

      if (galleryPage.images) {
        await GalleryImage.deleteMany({});
        await GalleryImage.insertMany(galleryPage.images.map((img: any, i: number) => ({ ...img, order: i })));
      }
    }

    if (menuPage) {
      await Page.findOneAndUpdate({ slug: "menu" }, {
        slug: "menu",
        heroEyebrow: menuPage.heroEyebrow,
        heroTitle: menuPage.heroTitle,
        heroDescription: menuPage.heroDescription
      }, { upsert: true });
    }

    // Return freshly aggregated settings
    return getSettings(req, res);
  } catch (error: any) {
    console.error("Error updating settings:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
