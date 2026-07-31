const fs = require('fs');
const path = require('path');

const models = [
  { name: 'Page', routeName: 'pages', varName: 'page' },
  { name: 'GalleryImage', routeName: 'galleryimages', varName: 'galleryImage' },
  { name: 'AboutFeature', routeName: 'aboutfeatures', varName: 'aboutFeature' },
  { name: 'LandingStat', routeName: 'landingstats', varName: 'landingStat' },
  { name: 'LandingSpecial', routeName: 'landingspecials', varName: 'landingSpecial' },
];

models.forEach(model => {
  const controllerCode = `import { Request, Response } from "express";
import { ${model.name} } from "../models/${model.name}";

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await ${model.name}.find();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const data = await ${model.name}.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: "Not Found" });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = await ${model.name}.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data = await ${model.name}.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, error: "Not Found" });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const data = await ${model.name}.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: "Not Found" });
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
`;
  fs.writeFileSync(path.join(__dirname, 'server', 'controllers', model.varName + 'Controller.ts'), controllerCode);

  const routeCode = `import express from "express";
import { getAll, getOne, create, update, remove } from "../controllers/${model.varName}Controller";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/")
  .get(getAll)
  .post(protect, admin, create);

router.route("/:id")
  .get(getOne)
  .put(protect, admin, update)
  .delete(protect, admin, remove);

export default router;
`;
  fs.writeFileSync(path.join(__dirname, 'server', 'routes', model.varName + 'Routes.ts'), routeCode);
});
