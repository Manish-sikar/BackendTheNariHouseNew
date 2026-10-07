const FooterModel = require("../models/footerModel");



const updateFooterData = async (req, res) => {
  try {
    const {
      _id, // Assuming _id is passed in req.body
      footer_title,
      footer_desc,
      footer_social_details,
      footer_our_services,
      footer_other_services,
      footer_banking_services,
      footer_address1,
      footer_address2,
      footer_email
    } = req.body;

    // Validate required fields
    if (
      !_id ||
      !footer_title ||
      !footer_desc ||
      !footer_social_details ||
      !footer_our_services ||
      !footer_other_services ||
      !footer_banking_services ||
      !footer_address1 ||
      !footer_address2 ||
      !footer_email
    ) {
      return res.status(400).json({
        err: "All fields are required, including _id, footer_title, footer_desc, footer_social_details, footer_our_services, footer_other_services, footer_banking_services, footer_address1, footer_address2, and footer_email."
      });
    }

    // Create an object to hold the updates
    const updateData = {
      footer_title,
      footer_desc,
      footer_social_details,
      footer_our_services,
      footer_other_services,
      footer_banking_services,
      footer_address1,
      footer_address2,
      footer_email,
      updatedAt: Date.now() // Update the timestamp
    };

    // Update the footer data
    const updatedFooterData = await FooterModel.findByIdAndUpdate(
      _id, // Filter by ID
      updateData,
      { new: true } // Return the updated document
    );

    // Check if the update was successful
    if (!updatedFooterData) {
      return res.status(404).json({
        err: "Footer data not found."
      });
    }

    // Send a success response with the updated data
    return res.status(200).json({
      message: "Footer details updated successfully!",
      data: updatedFooterData
    });
  } catch (error) {
    console.error("Error updating footer data:", error);
    return res.status(500).json({
      err: "An error occurred, unable to update footer details."
    });
  }
};

// create new footer data
// const updateFooterData = async (req, res) => {
//   try {
//     const {
//       footer_title,
//       footer_desc,
//       footer_social_details,
//       footer_our_services,
//       footer_other_services,
//       footer_banking_services,
//       footer_address1,
//       footer_address2,
//       footer_email,
//     } = req.body;

//     // Validate required fields
//     if (
//       !footer_title ||
//       !footer_desc ||
//       !footer_social_details ||
//       !footer_our_services ||
//       !footer_other_services ||
//       !footer_banking_services ||
//       !footer_address1 ||
//       !footer_address2 ||
//       !footer_email
//     ) {
//       return res.status(400).json({
//         err: "All fields are required: footer_title, footer_desc, footer_social_details, footer_our_services, footer_other_services, footer_banking_services, footer_address1, footer_address2, and footer_email.",
//       });
//     }

//     // Validate email format
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(footer_email)) {
//       return res.status(400).json({ err: "Invalid email address." });
//     }

//     // Create the new footer document
//     const newFooterData = await FooterModel.create({
//       footer_title,
//       footer_desc,
//       footer_social_details,
//       footer_our_services,
//       footer_other_services,
//       footer_banking_services,
//       footer_address1,
//       footer_address2,
//       footer_email,
//     });

//     return res.status(201).json({
//       message: "Footer details created successfully!",
//       data: newFooterData,
//     });
//   } catch (error) {
//     console.error("Error inserting footer data:", error);
//     return res.status(500).json({
//       err: "An error occurred, unable to create footer details.",
//     });
//   }
// };




const getFooterData = async (req, res) => {
  try {
    // Fetch all footer details from the database
    const footerDetails = await FooterModel.find();

    // Check if the result is empty
    if (!footerDetails || footerDetails.length === 0) {
      return res.status(404).json({ error: "Footer details not found" });
    }

    // Send success response with the fetched data
    res.status(200).json({
      footer_Data: footerDetails, // Updated to use camelCase
      message: "Footer details found successfully!",
    });
  } catch (error) {
    console.error("Error fetching footer data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};








  module.exports = {
    updateFooterData ,
    getFooterData

  }
