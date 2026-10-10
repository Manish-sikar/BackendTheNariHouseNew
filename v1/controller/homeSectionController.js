const HomeSection = require("../models/homeSectionModel");

const {
  uploadToS3,
} = require("../services/authServices");

const {
  v4: uuidv4,
} = require("uuid");

const parseItems = (items) => {
  const parsed = typeof items === "string" ? JSON.parse(items) : items;
  return Array.isArray(parsed) ? parsed : [];
};

const attachItemImages = async (items, files = []) => {
  const result = [];
  for (let i = 0; i < items.length; i++) {
    const item = { ...items[i] };
    const file = files.find((f) => f.fieldname === `itemImage_${i}`);
    if (file) {
      item.image = await uploadToS3(
        file.buffer,
        `home_item_${uuidv4()}_${file.originalname}`,
        file.mimetype,
        "home-sections"
      );
    }
    result.push(item);
  }
  return result;
};

const getMainImageFile = (req) =>
  (req.files || []).find((f) => f.fieldname === "image");
// =====================================================
// ADD HOME SECTION
// =====================================================

const AddHomeSection = async (
  req,
  res
) => {

  try {

    const {
      sectionType,
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      backgroundImage,
      items,
      order,
      status,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!sectionType) {

      return res.status(400).json({

        success: false,

        message:
          "Section type is required",

      });

    }


const allowedTypes = ["PROMO", "WHY_CHOOSE", "NEWSLETTER", "TESTIMONIAL", "STATS"];


    if (
      !allowedTypes.includes(
        sectionType
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid section type",

      });

    }


    // ==========================================
    // IMAGE UPLOAD
    // ==========================================
let image = "";
const mainFile = getMainImageFile(req);
if (mainFile) {
  image = await uploadToS3(
    mainFile.buffer,
    `home_${uuidv4()}_${mainFile.originalname}`,
    mainFile.mimetype,
    "home-sections"
  );
}

let sectionItems = [];
if (items) {
  try {
    sectionItems = parseItems(items);
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid items format" });
  }
  sectionItems = await attachItemImages(sectionItems, req.files);
}


    // ==========================================
    // ITEMS
    // ==========================================

 


    // ==========================================
    // CREATE
    // ==========================================

    const homeSection =
      await HomeSection.create({

        sectionType,

        title:
          title?.trim() || "",

        subtitle:
          subtitle?.trim() || "",

        description:
          description?.trim() || "",

        buttonText:
          buttonText?.trim() || "",

        buttonLink:
          buttonLink?.trim() || "",

        image,

        backgroundImage:
          backgroundImage || "",

        items:
          sectionItems,

        order:
          Number(order) || 0,

        status:
          status !== undefined
            ? Number(status)
            : 1,

      });


    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({

      success: true,

      message:
        "Home section added successfully",

      data:
        homeSection,

    });


  } catch (error) {

    console.error(
      "Add Home Section Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        error.message,

    });

  }
};


// =====================================================
// GET ACTIVE HOME SECTIONS
// FRONTEND
// =====================================================

const GetHomeSections = async (
  req,
  res
) => {

  try {

    const sections =
      await HomeSection.find({
        status: 1,
      })
        .sort({
          order: 1,
          createdAt: 1,
        });


    return res.status(200).json({

      success: true,

      message:
        "Home sections fetched successfully",

      section_Data:
        sections,

    });


  } catch (error) {

    console.error(
      "Get Home Sections Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        error.message,

    });

  }
};


// =====================================================
// GET ALL HOME SECTIONS
// ADMIN
// =====================================================

const GetAllHomeSections = async (
  req,
  res
) => {

  try {

    const sections =
      await HomeSection.find()
        .sort({
          order: 1,
          createdAt: -1,
        });


    return res.status(200).json({

      success: true,

      message:
        "All home sections fetched successfully",

      section_Data:
        sections,

    });


  } catch (error) {

    console.error(
      "Get All Home Sections Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        error.message,

    });

  }
};


// =====================================================
// GET SINGLE HOME SECTION
// =====================================================

const GetHomeSectionById = async (
  req,
  res
) => {

  try {

    const {
      id,
    } = req.params;


    const section =
      await HomeSection.findById(
        id
      );


    if (!section) {

      return res.status(404).json({

        success: false,

        message:
          "Home section not found",

      });

    }


    return res.status(200).json({

      success: true,

      message:
        "Home section fetched successfully",

      data:
        section,

    });


  } catch (error) {

    console.error(
      "Get Home Section Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        error.message,

    });

  }
};


// =====================================================
// UPDATE HOME SECTION
// =====================================================

const UpdateHomeSection = async (
  req,
  res
) => {
console.log("dddddddddddddd")
  try {

    const {
      id,
    } = req.params;


    const section =
      await HomeSection.findById(
        id
      );


    if (!section) {

      return res.status(404).json({

        success: false,

        message:
          "Home section not found",

      });

    }


    const {
      sectionType,
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      backgroundImage,
      items,
      order,
      status,
    } = req.body;


    // ==========================================
    // IMAGE
    // ==========================================

let image = section.image;
const mainFile = getMainImageFile(req);
if (mainFile) {
  image = await uploadToS3(
    mainFile.buffer,
    `home_${uuidv4()}_${mainFile.originalname}`,
    mainFile.mimetype,
    "home-sections"
  );
}

let sectionItems = section.items;
if (items !== undefined) {
  try {
    sectionItems = parseItems(items);
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid items format" });
  }
  sectionItems = await attachItemImages(sectionItems, req.files);
}


    // ==========================================
    // UPDATE
    // ==========================================

    if (sectionType) {


const allowedTypes = ["PROMO", "WHY_CHOOSE", "NEWSLETTER", "TESTIMONIAL", "STATS"];



      if (
        !allowedTypes.includes(
          sectionType
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid section type",

        });

      }


      section.sectionType =
        sectionType;

    }


    if (title !== undefined) {

      section.title =
        title.trim();

    }


    if (subtitle !== undefined) {

      section.subtitle =
        subtitle.trim();

    }


    if (description !== undefined) {

      section.description =
        description.trim();

    }


    if (
      buttonText !== undefined
    ) {

      section.buttonText =
        buttonText.trim();

    }


    if (
      buttonLink !== undefined
    ) {

      section.buttonLink =
        buttonLink.trim();

    }


    if (
      backgroundImage !==
      undefined
    ) {

      section.backgroundImage =
        backgroundImage;

    }


    section.image =
      image;


    section.items =
      sectionItems;


    if (order !== undefined) {

      section.order =
        Number(order);

    }


    if (status !== undefined) {

      section.status =
        Number(status);

    }


    await section.save();


    return res.status(200).json({

      success: true,

      message:
        "Home section updated successfully",

      data:
        section,

    });


  } catch (error) {

    console.error(
      "Update Home Section Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        error.message,

    });

  }
};


// =====================================================
// DELETE HOME SECTION
// =====================================================

const DeleteHomeSection = async (
  req,
  res
) => {

  try {

    const {
      id,
    } = req.params;


    const section =
      await HomeSection.findById(
        id
      );


    if (!section) {

      return res.status(404).json({

        success: false,

        message:
          "Home section not found",

      });

    }


    await HomeSection.findByIdAndDelete(
      id
    );


    return res.status(200).json({

      success: true,

      message:
        "Home section deleted successfully",

    });


  } catch (error) {

    console.error(
      "Delete Home Section Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        error.message,

    });

  }
};


// =====================================================
// CHANGE STATUS
// =====================================================

const ChangeHomeSectionStatus = async (
  req,
  res
) => {

  try {

    const {
      id,
    } = req.params;


    const section =
      await HomeSection.findById(
        id
      );


    if (!section) {

      return res.status(404).json({

        success: false,

        message:
          "Home section not found",

      });

    }


    section.status =
      section.status === 1
        ? 0
        : 1;


    await section.save();


    return res.status(200).json({

      success: true,

      message:
        "Home section status changed successfully",

      data:
        section,

    });


  } catch (error) {

    console.error(
      "Change Home Section Status Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        error.message,

    });

  }
};


module.exports = {

  AddHomeSection,

  GetHomeSections,

  GetAllHomeSections,

  GetHomeSectionById,

  UpdateHomeSection,

  DeleteHomeSection,

  ChangeHomeSectionStatus,

};